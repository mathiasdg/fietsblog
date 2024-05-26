import "../styles/index.css";
import "leaflet-geometryutil";
import ProgressBar from "progressbar.js";
import MapHandler from "./mapHandler";

// globals and constants
const extraInfo = document.getElementById("extra-info");

// Initialize the MapHandler
const maphandy = new MapHandler();
const routeData = await maphandy.processData();
// maphandy.processData(); // tweede achtervolger => Eefke

const totaalKilometers = (routeData.lengteTotaleRoute / 1000).toFixed(0);
const afgelegdeKilometers = (routeData.lengteAfgelegdeRoute / 1000).toFixed(0);
const afgelegdPercentage = (
  routeData.lengteAfgelegdeRoute / routeData.lengteTotaleRoute
).toFixed(2);

// Initialize ProgressBar
const bar = new ProgressBar.Line("#bar", {
  easing: "easeOut",
  duration: 3333,
  color: "#116944",
  trailColor: "#ff6944",
  svgStyle: { width: "100%", height: "100%" },
  text: {
    style: null,
  },
});
bar.animate(afgelegdPercentage); // Value from 0.0 to 1.0

const intervalID = setInterval(() => {
  bar.setText(`${(bar.value() * 100).toFixed(0)}%`);
  extraInfo.innerHTML = `Reeds bestierde afstand: ${afgelegdeKilometers} van de ${totaalKilometers} kilometer <img src='/images/bull.svg'/>`;
}, 10);

setTimeout(() => clearInterval(intervalID), 3369);
