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

const totaalKilometers = Number(routeData.lengteTotaleRoute / 1000).toFixed(0);
let afgelegdeKilometers = (Number) ((routeData.lengteAfgelegdeRoute / 1000).toFixed(0));
afgelegdeKilometers = afgelegdeKilometers; // +20km voor Lier-Mechelen
const afgelegdPercentage = (
  afgelegdeKilometers / totaalKilometers
).toFixed(2);

// Initialize ProgressBar
const bar = new ProgressBar.Line("#bar", {
  easing: "easeOut",
  duration: 4690,
  color: "#116944",
  trailColor: "#ff6944",
  svgStyle: { width: "100%", height: "100%" },
  text: {
    style: null,
  },
});
bar.animate(afgelegdPercentage);

const intervalID = setInterval(() => {
  bar.setText(`${(bar.value() * 100).toFixed(0)}%`);
  const afgelegdeKilis = (bar.value() * totaalKilometers).toFixed(0);
  extraInfo.innerHTML = `Reeds bestierde afstand: <b>${afgelegdeKilis}</b> van de ${totaalKilometers} kilometer <img src='/images/bull.svg'/>`;
}, 10);

setTimeout(() => clearInterval(intervalID), 5000);
