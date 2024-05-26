import slaapPlekken from "./overnachtingen.json";
import { getDistanceFromLatLonInKm, getEuclideanDistance } from "./utils";

// Constants and Globals
const dag = new Date().getDay();
const ezyOrFiets = dag % 2 ? "ezy" : "fietsje";
const overnachtingen = slaapPlekken.slaapCoordinaten;

const tilesURL =
  "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg";

// Icons
const fietsjeIcon = L.icon({
  iconUrl: `./src/images/${ezyOrFiets}.svg`,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  tooltipAnchor: [22, 0],
});
const tentjeIcon = L.icon({
  iconUrl: "./src/images/tentie.svg",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [16, 0],
});

class MapHandler {
  constructor() {
    this.map = this.initializeMap();
    // this.processData();
    setTimeout(this.animateCampingLocations.bind(this), 2690);
  }

  initializeMap() {
    const map = L.map("map");
    L.tileLayer(tilesURL, {
      maxZoom: 19,
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
      laatsteSlaapplek = overnachtingen[overnachtingen.length - 1];
    } else {
      laatsteSlaapplek = 0;
    }
    let minDist = Infinity;
    let dichtstePunt;
    let afstand = 0;
    let vorigePunt = [
      items[0].getAttribute("lat"),
      items[0].getAttribute("lon"),
    ];

    // this.map.setView([laatsteSlaapplek[0], laatsteSlaapplek[1]], 13);

    for (let i = 0; i < items.length; ++i) {
      const coordinate = [
        items[i].getAttribute("lat"),
        items[i].getAttribute("lon"),
      ];

      if (i !== 0) {
        afstand += getDistanceFromLatLonInKm(
          vorigePunt[0],
          vorigePunt[1],
          coordinate[0],
          coordinate[1]
        );
      }

      const dist = getEuclideanDistance(coordinate, laatsteSlaapplek);
      if (dist < minDist) {
        minDist = dist;
        dichtstePunt = coordinate;
      }

      latLngsTotaleRoute.push(coordinate);
      vorigePunt = coordinate;
    }

    // console.log(
    //   `Afstand: ${afstand.toFixed(2)} km, minDist: ${minDist.toFixed(
    //     2
    //   )} km, dichtstePunt: ${dichtstePunt}`
    // );

    const totaleRoute = L.polyline(latLngsTotaleRoute, {
      color: "#ff6944",
      opacity: 0.69,
    }).addTo(this.map);
    const lengteTotaleRoute = L.GeometryUtil.length(totaleRoute);
    // console.log(lengteTotaleRoute / 1000 + " km");

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

    const fietsMarker = L.marker(latLngsTotaleRoute[0], {
      icon: fietsjeIcon,
    }).addTo(this.map);

    const lengteAfgelegdeRoute = L.GeometryUtil.length(afgelegdeRoute);

    // console.log(lengteAfgelegdeRoute / 1000 + " km");
    // console.log(
    //   ((lengteAfgelegdeRoute / lengteTotaleRoute) * 100).toFixed(2),
    //   "%"
    // );

    this.map.fitBounds(totaleRoute.getBounds());

    this.animateRoute(
      afgelegdeRouteVoorAnimatie,
      latLngsAfgelegdeRoute,
      fietsMarker
    );
    setInterval(() => {
      this.map.addLayer(afgelegdeRoute);
      this.map.removeLayer(afgelegdeRouteVoorAnimatie);
    }, 3333);

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
      // this.map.setView(routeCoordinates[i], 9);

      i += 52;
    }, 16);
  }

  animateCampingLocations() {
    let i = 0;
    const timer = setInterval(() => {
      if (i >= overnachtingen.length - 1) {
        clearInterval(timer);
        return;
      }
      const campingCoordinates = overnachtingen[i];
      const tooltipText = `etappe ${
        i + 1
      }<br>afstand : ${null}<br> totaal bestierde afstand: ${null}`;
      L.marker(campingCoordinates, { icon: tentjeIcon }).addTo(this.map);
      // .bindTooltip(tooltipText);
      i++;
    }, 169);
  }
}

export default MapHandler;
