import "animate.css";
import "../styles/index.css";
import "leaflet-geometryutil";
import ProgressBar from "progressbar.js";
import MapHandler from "./mapHandler";

// globals and constants
const animationDuration = 4444;
const extraInfo = document.getElementById("extra-info");
const statsKnop = document.getElementById("statz");
const statsModal = document.getElementById("statz-modal-body");
const logos = document.querySelectorAll(".logo");

// load the stats from the external file
statsModal.innerHTML = await fetch("./stats.html").then((res) => res.text());

statsKnop.addEventListener("click", stopAnimations);
setTimeout(animateLogos, animationDuration + 3690);

function animateLogos() {
	for (const logo of logos) {
		const rubberOrSwing =
			Math.random() > 0.5 ? "animate__rubberBand" : "animate__swing";
		logo.classList.add(rubberOrSwing, "animate__infinite", "animate__slower");
	}
}
function stopAnimations() {
	logos[0].classList.remove("animate__animated");
}

// Initialize the MapHandler
const maphandy = new MapHandler();
const routeData = await maphandy.processData();
// console.log(routeData)
// maphandy.processData(); // tweede achtervolger => Eefke

const totaalKilometers = Number(routeData.lengteTotaleRoute / 1000).toFixed(0);
const afgelegdeKilometers = Number(
	(routeData.lengteAfgelegdeRoute / 1000).toFixed(0),
);
// console.log(afgelegdeKilometers)
const afgelegdPercentage = (afgelegdeKilometers / totaalKilometers).toFixed(2);
// console.log(afgelegdPercentage)

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

// Blog popup logic
setTimeout(() => {
	fetch("/blog-news.txt")
		.then((response) => response.text())
		.then((text) => {
			if (text.trim()) {
				const popup = document.getElementById("blog-news");
				popup.innerHTML = text.trim();
				popup.classList.add("animate__bounceInUp");
				popup.style.display = "block";
				setTimeout(() => {
					popup.classList.remove("animate__bounceInUp");
					popup.classList.add("animate__bounceOutDown");
					// Wait for the animation to finish before hiding
					popup.addEventListener("animationend", function handler() {
						popup.style.display = "none";
						popup.classList.remove("animate__bounceOutDown");
						popup.removeEventListener("animationend", handler);
					});
				}, 11111);
			}
		});
}, 6900);
