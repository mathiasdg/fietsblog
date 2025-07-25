import "animate.css";
import "leaflet-geometryutil";
import "../styles/index.css";
import L from "leaflet";
import ProgressBar from "progressbar.js";
import MapHandler from "./mapHandler";

// globals and constants
const animationDuration = 4444;
const extraInfo = document.getElementById("extra-info");
const statsKnop = document.getElementById("statz");
const statsModal = document.getElementById("statz-modal-body");
const logos = document.querySelector(".logo");

// load the stats from the external file
statsModal.innerHTML = await fetch("./stats.html").then((res) => res.text());

statsKnop.addEventListener("click", stopAnimations);
setTimeout(animateLogos, animationDuration + 3690);

function animateLogos() {
  const rubberOfSwing =
    Math.random() > 0.5 ? "animate__rubberBand" : "animate__swing";
  logos.classList.add(rubberOfSwing, "animate__infinite", "animate__slower");

  // setTimeout(() => {
  //   vuurwerk.classList.add("animate__zoomOutDown");
  // }, animationDuration + 6900);
}
function stopAnimations() {
  logos.classList.remove("animate__animated");
}

// Initialize the MapHandler
const maphandy = new MapHandler();
const routeData = await maphandy.processData();

const totaalKilometers = Number(routeData.lengteTotaleRoute / 1000).toFixed(0);
let afgelegdeKilometers = Number(
  (routeData.lengteAfgelegdeRoute / 1000).toFixed(0)
);
afgelegdeKilometers = afgelegdeKilometers;
const afgelegdPercentage = (afgelegdeKilometers / totaalKilometers).toFixed(2);

// Initialize ProgressBar
const bar = new ProgressBar.Line("#bar", {
  easing: "easeOut",
  duration: animationDuration,
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
}, 11);

setTimeout(() => clearInterval(intervalID), animationDuration + 169);
