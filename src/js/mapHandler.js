import { getDistanceFromLatLonInKm, getEuclideanDistance } from "./utils";

// Constants and Globals
const animationDuration = 5555;
const dag = new Date().getDay();
const ezyOrFiets = dag % 2 ? "ezy" : "fietsje";
// const overnachtingen = slaapPlekken.slaapCoordinaten;
const overnachtingen = await fetchOvernachtingenData();
// console.log(overnachtingen);
const trip = "donau-2025";

// fetch de overnachtingen uit de dynamiosche json file
async function fetchOvernachtingenData() {
  const response = await fetch("/trips.json");
  const data = await response.json();
  return {
    overnight_locations: data.trips["donau-2025"].overnight_locations,
    gpx_file: data.trips["donau-2025"].gpx_file
  };
}

const tilesURL =
  // "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
  // "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg";
  // "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.jpg";
  // "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}{r}.jpg";
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Icons
const fietsjeIcon = L.icon({
  iconUrl: `/images/${ezyOrFiets}.svg`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [16, 0],
  className: "fietser",
});

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
    // this.telAfstand;
    // this.telEtappeAfstand;
    this.map = this.initializeMap();
    this.processData();
  }

  initializeMap() {
    const map = L.map("map");

    // console.log("Voegt tile layer toe aan de map...");
    L.tileLayer(tilesURL, {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return map;
  }

  async fetchAndParseGpx() {
    const tripData = await fetchOvernachtingenData();
    // Remove leading slash for dev mode
    const gpxPath = tripData.gpx_file.startsWith('/') ? tripData.gpx_file.slice(1) : tripData.gpx_file;
    const response = await fetch(gpxPath);
    const text = await response.text();
    const parser = new DOMParser();
    const data = parser.parseFromString(text, "text/xml");
    const items = data.getElementsByTagName("trkpt");
    
    if (!items || items.length === 0) {
      console.error("No track points found in GPX file");
      return [];
    }
    
    return items;
  }

  async processData() {
    const items = await this.fetchAndParseGpx();
    const latLngsTotaleRoute = [];
    let laatsteSlaapplek;

    if (overnachtingen.length > 0) {
      laatsteSlaapplek = overnachtingen[overnachtingen.length - 1];
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

      // console.log(dichtstePunt);
      // console.log(dist);

      latLngsTotaleRoute.push(coordinate);
      vorigePunt = coordinate;
    }

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

    // L.motion
    //   .polyline(
    //     [
    //       [53, 6],
    //       [54, 7],
    //       [52, 8],
    //     ],
    //     {
    //       color: "transparent",
    //     },
    //     {
    //       auto: true,
    //       duration: 3000,
    //       easing: L.Motion.Ease.easeInOutQuart,
    //     },
    //     {
    //       removeOnEnd: true,
    //       showMarker: true,
    //       icon: L.divIcon({
    //         html: "<i class='fa fa-car fa-2x' aria-hidden='true'></i>",
    //         iconSize: L.point(27.5, 24),
    //       }),
    //     }
    //   )
    //   .addTo(this.map);

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
    setTimeout(applyTransform, 100);

    // Als de marker beweegt, opnieuw de transformatie toepassen
    fietsMarker.on("move", applyTransform);

    const lengteAfgelegdeRoute = L.GeometryUtil.length(afgelegdeRoute);

    this.animateRoute(
      afgelegdeRouteVoorAnimatie,
      latLngsAfgelegdeRoute,
      fietsMarker
    );

    setTimeout(
      // this.animateCampingLocations.bind(this),
      this.animateCampingLocations(afgelegdeRoute),
      animationDuration - 2000
    );

    const intervalID = setInterval(() => {
      this.map.addLayer(afgelegdeRoute);
      // this.map.removeLayer(fietsMarker);
      this.map.removeLayer(afgelegdeRouteVoorAnimatie);
      // this.map.fitBounds(totaleRoute.getBounds(), { padding: [69, 69] });
      // this.map.setView(eindPunt, 9);
    }, animationDuration);
    setTimeout(() => clearInterval(intervalID), animationDuration + 169);

    // this.map.fitBounds(afgelegdeRoute.getBounds(), { padding: [69, 69] });
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
    const timer = setInterval(() => {
      if (i >= routeCoordinates.length) {
        clearInterval(timer);
        return;
      }
      route.addLatLng(routeCoordinates[i]);
      marker.setLatLng(routeCoordinates[i]);
      // this.map.setView(routeCoordinates[i], 7.69);

      i += 12;
    }, 6);
  }

  animateCampingLocations(afgelegdeRoute) {
    // this.calculateEtappeDistance(afgelegdeRoute);
    let i = 0;

    const timer = setInterval(() => {
      if (i >= overnachtingen.length - 1) {
        clearInterval(timer);
        return;
      }
      const campingCoordinates = overnachtingen[i];
      const tooltipText = `etappe ${i + 1}
      <br>afstand : ${null}<br> totaal bestierde afstand: ${null}
      <br>${campingCoordinates}`;

      L.marker(campingCoordinates, { icon: tentjeIcon }).addTo(this.map);

      // .bindTooltip(tooltipText);

      i++;
    }, 369);
  }

  /**
   * Calculates the closest point on the map to the current route.
   *
   * @returns {L.LatLng} The closest point on the map to the current route.
   */
  calculateClosestPoint() {
    return L.GeometryUtil.closest(this.map, this.afgelegdeRoute);
    // let test = L.GeometryUtil.closest(this.map, this.afgelegdeRoute);

    // console.log(this.afgelegdeRoute);
    // console.log("boo " + test);
    // return true;
  }
}

export default MapHandler;
