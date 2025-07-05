import { getDistanceFromLatLonInKm, getEuclideanDistance } from "./utils";

// Constants and Globals
const animationDuration = 6900;
const dag = new Date().getDay();
const ezyOrFiets = dag % 2 ? "ezy" : "fietsje";
const overnachtingen = await fetchOvernachtingenData();
const etappes = []


// fetch de overnachtingen uit de dynamische json file
async function fetchOvernachtingenData() {
  const response = await fetch("/overnachtingen.json");
  const data = await response.json();

  return data.slaapCoordinaten;
}

const tilesURL =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
// "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg";
// "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.jpg";
// "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}{r}.jpg";
// "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Icons
const fietsjeIcon = L.icon({
  iconUrl: `/images/${ezyOrFiets}.svg`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [0, 0],
  className: "fietser",
});

// const tentjeIcon = L.icon({
//   iconUrl: "./images/tentie.svg",
//   iconSize: [33, 33],
//   iconAnchor: [16, 16],
//   tooltipAnchor: [16, 0],
//   className: "tentie",
// });
const tentjeIcon = L.divIcon({
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [16, 0],
  html: '<div class="marker animate__animated animate__bounceInDown"></div>',
});
const finishIcon = L.icon({
  iconUrl: "./images/finish.png",
  iconSize: [33, 33],
  iconAnchor: [15, 30],
});

class MapHandler {
  constructor() {
    this.telAfstand;
    this.telEtappeAfstand;
    this.map = this.initializeMap();
    // this.processData();
    setTimeout(
      this.animateCampingLocations.bind(this),
      animationDuration - 2000
    );
  }

  initializeMap() {
    const map = L.map("map");
    L.tileLayer(tilesURL, {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    return map;
  }

  async fetchAndParseGpx() {
    const response = await fetch("/data/data.gpx");
    const text = await response.text();
    const parser = new DOMParser();
    const data = parser.parseFromString(text, "text/xml");

    return data.getElementsByTagName("trkpt");
  }

  async processData() {
    const items = await this.fetchAndParseGpx();
    const latLngsTotaleRoute = [];
    let laatsteSlaapplek;

    if (overnachtingen.length > 0) {
      laatsteSlaapplek = [overnachtingen[overnachtingen.length - 1].lat, overnachtingen[overnachtingen.length - 1].lon];
    } else {
      laatsteSlaapplek = 0;
    }
    let minDist = Infinity;
    let dichtstePunt;
    // let afstand = 0;
    let vorigePunt = [
      items[0].getAttribute("lat"),
      items[0].getAttribute("lon"),
    ];

    for (let i = 0; i < items.length; ++i) {
      const coordinate = [
        items[i].getAttribute("lat"),
        items[i].getAttribute("lon"),
      ];

      // if (i !== 0) {
      //   afstand += getDistanceFromLatLonInKm(
      //     vorigePunt[0],
      //     vorigePunt[1],
      //     coordinate[0],
      //     coordinate[1]
      //   );
      // }

      const dist = getEuclideanDistance(coordinate, laatsteSlaapplek);
      if (dist < minDist) {
        minDist = dist;
        dichtstePunt = coordinate;
      }
      // console.log(dist);

      latLngsTotaleRoute.push(coordinate);
      vorigePunt = coordinate;
    }

    // Calculate segment lengths between overnight locations
    const segmentLengths = this.calculateSegmentLengths(latLngsTotaleRoute, overnachtingen);
    console.log('Segment lengths:', segmentLengths);  

    const totaleRoute = L.polyline(latLngsTotaleRoute, {
      color: "#ff6944",
      opacity: 0.69,
    }).addTo(this.map);
    const lengteTotaleRoute = L.GeometryUtil.length(totaleRoute);

    const indexOfDichtstePunt = latLngsTotaleRoute.indexOf(dichtstePunt);
    const latLngsAfgelegdeRoute = latLngsTotaleRoute.slice(
      0,
      indexOfDichtstePunt + 1
    );

    const afgelegdeRoute = L.polyline(latLngsAfgelegdeRoute, {
      color: "#116944",
      weight: 6.9,
    });

    const afgelegdeRouteVoorAnimatie = L.polyline([], {
      color: "#116944",
      weight: 6.9,
    }).addTo(this.map);

    const eindPunt = latLngsTotaleRoute[latLngsTotaleRoute.length - 1];
    L.marker(eindPunt, {
      icon: finishIcon,
    }).addTo(this.map);

    // L.polylineDecorator(totaleRoute, {
    //   patterns: [
    //     {
    //       offset: "100%",
    //       repeat: 22,
    //       symbol: L.Symbol.marker({
    //         rotate: false,
    //         markerOptions: {
    //           icon: L.icon({
    //             iconUrl: "./images/vuurwerk.gif",
    //             iconSize: [369, 369],
    //           }),
    //         },
    //       }),
    //     },
    //   ],
    // });
    // .addTo(this.map);

    const fietsMarker = L.marker(latLngsTotaleRoute[0], {
      icon: fietsjeIcon,
    }).addTo(this.map);

    // Function to combine the transforms
    function applyTransform() {
      var element = document.querySelector(".fietser");
      if (element) {
        var currentTransform = window.getComputedStyle(element).transform;
        var newTransform = "scaleX(-1)";

        if (currentTransform !== "none") {
          newTransform = currentTransform + " " + newTransform;
        }

        element.style.transform = newTransform;
      }
    }

    // Gebruik een timeout om de transformatie toe te passen nadat het element is gerenderd
    // setTimeout(applyTransform, 100);

    // Als de marker beweegt, opnieuw de transformatie toepassen
    // fietsMarker.on("move", applyTransform);

    const lengteAfgelegdeRoute = L.GeometryUtil.length(afgelegdeRoute);

    this.animateRoute(
      afgelegdeRouteVoorAnimatie,
      latLngsAfgelegdeRoute,
      fietsMarker
    );
    const intervalID = setInterval(() => {
      this.map.addLayer(afgelegdeRoute);
      // this.map.removeLayer(fietsMarker);
      this.map.removeLayer(afgelegdeRouteVoorAnimatie);
      // this.map.fitBounds(totaleRoute.getBounds(), { padding: [69, 69] });
      // this.map.setView(eindPunt, 9);
    }, animationDuration);
    setTimeout(() => clearInterval(intervalID), animationDuration + 169);

    this.map.fitBounds(afgelegdeRoute.getBounds(), { padding: [69, 69] });
    // this.map.fitBounds(totaleRoute.getBounds(), { padding: [2, 3] });

    return {
      lengteTotaleRoute,
      lengteAfgelegdeRoute,
    };
  }

  /**
   * Animates a route on a map by adding each coordinate in the route to the map's polyline and moving a marker along the route.
   *
   * @param {L.Polyline} route - The Leaflet polyline object representing the route to be animated.
   * @param {L.LatLng[]} routeCoordinates - An array of latitude and longitude coordinates representing the route.
   * @param {L.Marker} marker - The Leaflet marker object to be moved along the route.
   * @returns {number} The total length of the route in meters.
   */
  animateRoute(route, routeCoordinates, marker, animationTime = 3690) {
    let i = 0;
    const timer = setInterval(_ => {
      if (i >= routeCoordinates.length) {
        clearInterval(timer);
        return;
      }
      route.addLatLng(routeCoordinates[i]);
      marker.setLatLng(routeCoordinates[i]);
      // this.map.setView(routeCoordinates[i], 8.69);

      i += 44;
    }, 11);
  }


  /**
   * Calculate the length of each segment between overnight locations
   * @param {Array} routeCoordinates - Array of [lat, lon] coordinates for the entire route
   * @param {Array} overnightLocations - Array of overnight location objects with lat/lon properties
   * @returns {Array} Array of segment lengths in meters
   */
  calculateSegmentLengths(routeCoordinates, overnightLocations) {
    const segmentLengths = [];
    
    for (let i = 0; i < overnightLocations.length - 1; i++) {
      const currentLocation = [overnightLocations[i].lat, overnightLocations[i].lon];
      const nextLocation = [overnightLocations[i + 1].lat, overnightLocations[i + 1].lon];
      
      // Find the closest route points to these overnight locations
      const currentIndex = this.findClosestRoutePoint(routeCoordinates, currentLocation);
      const nextIndex = this.findClosestRoutePoint(routeCoordinates, nextLocation);
      
      // Extract the segment coordinates
      const segmentCoordinates = routeCoordinates.slice(currentIndex, nextIndex + 1);
      
      // Create a polyline for this segment and calculate its length
      const segmentPolyline = L.polyline(segmentCoordinates);
      const segmentLength = L.GeometryUtil.length(segmentPolyline);
      
      segmentLengths.push({
        segment: i + 1,
        from: overnightLocations[i].flag || `Location ${i + 1}`,
        to: overnightLocations[i + 1].flag || `Location ${i + 2}`,
        length: segmentLength,
        lengthKm: (segmentLength / 1000).toFixed(2)
      });
    }
    
    return segmentLengths;
  }

  /**
   * Find the index of the route coordinate closest to a given location
   * @param {Array} routeCoordinates - Array of [lat, lon] coordinates
   * @param {Array} targetLocation - [lat, lon] of target location
   * @returns {number} Index of closest route coordinate
   */
  findClosestRoutePoint(routeCoordinates, targetLocation) {
    let minDistance = Infinity;
    let closestIndex = 0;
    
    for (let i = 0; i < routeCoordinates.length; i++) {
      const distance = getEuclideanDistance(routeCoordinates[i], targetLocation);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  }

  animateCampingLocations() {
    let i = 0;

    const timer = setInterval(_ => {
      if (i >= overnachtingen.length - 1) {
        clearInterval(timer);
        return;
      }
      
      // const etappeLengte = L.GeometryUtil.length(totaleRoute);
      // console.log(etappeLengte);


      const campingData = overnachtingen[i];
      const campingCoordinates = [campingData['lat'], campingData['lon']];

      const tooltipText = `<h2>Etappe ${i + 1} ${campingData.flag}</h2>`;
      // <br> totaal bestierde afstand: ${campingData.kmTotHier}`;
      // <br>${campingCoordinates}`;

      L.marker(campingCoordinates, { icon: tentjeIcon })
        .addTo(this.map)
        .bindTooltip(tooltipText);

      i++;
    }, 369);
  }
}

export default MapHandler;
