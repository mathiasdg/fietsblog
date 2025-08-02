import { getDistanceFromLatLonInKm, getEuclideanDistance } from "./utils";

// Constants and Globals
const animationDuration = 6900;
const minute = new Date().getMinutes();
const fietsMarker = (() => {
	switch (minute % 3) {
		case 0:
			return "ezy";
		case 1:
			return "oli";
		default:
			return "fietsje";
	}
})();

const overnachtingen = await fetchOvernachtingenData();
let etappes = [];

// fetch de overnachtingen uit de dynamische json file
async function fetchOvernachtingenData() {
	const response = await fetch("/overnachtingen.json");
	const data = await response.json();

	return data.slaapCoordinaten;
}

const tilesURL =
	"https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";

// Icons
const fietsjeIcon = L.icon({
	iconUrl: `/images/${fietsMarker}.svg`,
	iconSize: [44, 44],
	iconAnchor: [22, 22],
	tooltipAnchor: [0, 0],
	className: "fietser",
});

const tentjeIcon = L.divIcon({
	iconSize: [44, 44],
	iconAnchor: [22, 22],
	tooltipAnchor: [16, 0],
	html: '<div class="tent-marker animate__animated animate__bounceInDown"></div>',
});

const huisjeIcon = L.divIcon({
	iconSize: [44, 44],
	iconAnchor: [22, 22],
	tooltipAnchor: [16, 0],
	html: '<div class="huis-marker animate__animated animate__bounceInDown"></div>',
});

const finishIcon = L.icon({
	iconUrl: "./images/finish.png",
	iconSize: [33, 33],
	iconAnchor: [10, 30],
});

class MapHandler {
	constructor() {
		this.telAfstand;
		this.telEtappeAfstand;
		this.map = this.initializeMap();
		// this.processData();
		setTimeout(
			this.animateCampingLocations.bind(this),
			animationDuration - 1690,
		);
		this.segmentPolylines = [];
		this.tentMarkers = [];
		this.hasZoomed = false;
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
			laatsteSlaapplek = [
				overnachtingen[overnachtingen.length - 1].lat,
				overnachtingen[overnachtingen.length - 1].lon,
			];
		} else {
			laatsteSlaapplek = 0;
		}
		let minDist = Number.POSITIVE_INFINITY;
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
		etappes = this.calculateSegmentLengths(latLngsTotaleRoute, overnachtingen);
		// console.log('Segment lengths:', etappes);

		const totaleRoute = L.polyline(latLngsTotaleRoute, {
			color: "#ff6944",
			opacity: 0.69,
		}).addTo(this.map);
		const lengteTotaleRoute = L.GeometryUtil.length(totaleRoute);

		const indexOfDichtstePunt = latLngsTotaleRoute.indexOf(dichtstePunt);
		const latLngsAfgelegdeRoute = latLngsTotaleRoute.slice(
			0,
			indexOfDichtstePunt + 1,
		);

		const afgelegdeRoute = L.polyline(latLngsAfgelegdeRoute, {
			color: "#116944",
			weight: 6.9,
			opacity: 0.87,
		});

		const afgelegdeRouteVoorAnimatie = L.polyline([], {
			color: "#116944",
			weight: 6.9,
			opacity: 0.87,
		}).addTo(this.map);

		const eindPunt = latLngsTotaleRoute[latLngsTotaleRoute.length - 1];
		L.marker(eindPunt, {
			icon: finishIcon,
		}).addTo(this.map);

		const fietsMarker = L.marker(latLngsTotaleRoute[0], {
			icon: fietsjeIcon,
		}).addTo(this.map);

		const lengteAfgelegdeRoute = L.GeometryUtil.length(afgelegdeRoute);

		this.animateRoute(
			afgelegdeRouteVoorAnimatie,
			latLngsAfgelegdeRoute,
			fietsMarker,
		);
		if (!this.hasZoomed) {
			this.map.fitBounds(totaleRoute.getBounds(), { padding: [0, 0] });
			this.hasZoomed = true;
		}


		const intervalID = setInterval(() => {
			this.map.addLayer(afgelegdeRoute);
			this.map.removeLayer(afgelegdeRouteVoorAnimatie);
		}, animationDuration);

		setTimeout(() => {
			// Remove the animated route
			this.map.removeLayer(afgelegdeRouteVoorAnimatie);
			// Add the static route
			this.map.addLayer(afgelegdeRoute);
			// Re-add all segment polylines
			// for (const polyline of this.segmentPolylines) {
			//   if (!this.map.hasLayer(polyline)) {
			//     this.map.addLayer(polyline);
			//   }
			// };

			// --- Use overnachting coords for bounding box ---
			// const numDays = 10;
			// const last10 = overnachtingen.slice(-numDays);
			// const last10Coords = last10.map((loc) => [loc.lat, loc.lon]);


		}, animationDuration + 690);

		this.generateSegmentButtons(
			overnachtingen,
			totaleRoute,
			latLngsTotaleRoute,
		);

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
		const timer = setInterval((_) => {
			if (i >= routeCoordinates.length) {
				clearInterval(timer);
				// Set marker to the exact last coordinate of the route
				marker.setLatLng(routeCoordinates[routeCoordinates.length - 1]);

				// Add tooltip to the bike marker using the reusable function
				const lastEtappe = etappes[etappes.length - 1];
				const lastOvernachting = overnachtingen[overnachtingen.length - 1];
				const tooltipText = this.createTooltipText(lastOvernachting, lastEtappe, overnachtingen.length - 1);

				marker.bindTooltip(tooltipText);

				// this.map.fitBounds(route.getBounds(), { padding: [12, 33] });
				return;
			}
			route.addLatLng(routeCoordinates[i]);
			marker.setLatLng(routeCoordinates[i]);
			// this.map.setView(routeCoordinates[i], 8.69);

			i += 69;
		}, 9);
	}

	/**
	 * Calculate the length of each segment between overnight locations
	 * @param {Array} routeCoordinates - Array of [lat, lon] coordinates for the entire route
	 * @param {Array} overnightLocations - Array of overnight location objects with lat/lon properties
	 * @returns {Array} Array of segment lengths in meters
	 */
	calculateSegmentLengths(routeCoordinates, overnightLocations) {
		const segmentLengths = [];

		// 1. Add segment from start to first overnight location
		if (overnightLocations.length > 0) {
			const firstLocation = [
				overnightLocations[0].lat,
				overnightLocations[0].lon,
			];
			const firstIndex = this.findClosestRoutePoint(
				routeCoordinates,
				firstLocation,
			);

			const segmentCoordinates = routeCoordinates.slice(0, firstIndex + 1);
			const koloor = `#${(9 + Math.floor(Math.random() * 90)).toString()}${(9 + Math.floor(Math.random() * 90)).toString()}${(9 + Math.floor(Math.random() * 90)).toString()}`;

			const segmentPolyline = L.polyline(segmentCoordinates, {
				color: koloor,
				opacity: 0, // initially hidden
				weight: 22,
			}).addTo(this.map);

			this.segmentPolylines.push(segmentPolyline);

			const segmentLength = L.GeometryUtil.length(segmentPolyline);

			segmentLengths.push({
				segment: 1,
				// from: "Start 'Donaueschingen",
				from: overnightLocations[0].flag || "Slaapplek 1",
				to: overnightLocations[0].flag || "Slaapplek 1",
				lengthKm: (segmentLength / 1000).toFixed(1),
			});
		}

		// 2. Add segments between overnight locations
		for (let i = 0; i < overnightLocations.length - 1; i++) {
			const currentLocation = [
				overnightLocations[i].lat,
				overnightLocations[i].lon,
			];
			const nextLocation = [
				overnightLocations[i + 1].lat,
				overnightLocations[i + 1].lon,
			];

			const currentIndex = this.findClosestRoutePoint(
				routeCoordinates,
				currentLocation,
			);
			const nextIndex = this.findClosestRoutePoint(
				routeCoordinates,
				nextLocation,
			);

			const segmentCoordinates = routeCoordinates.slice(
				currentIndex,
				nextIndex + 1,
			);
			const koloor = `#${(9 + Math.floor(Math.random() * 90)).toString()}${(9 + Math.floor(Math.random() * 90)).toString()}${(9 + Math.floor(Math.random() * 90)).toString()}`;

			const segmentPolyline = L.polyline(segmentCoordinates, {
				color: koloor,
				opacity: 0, // initially hidden
				weight: 22,
			});
			// .addTo(this.map);

			this.segmentPolylines.push(segmentPolyline);

			const segmentLength = L.GeometryUtil.length(segmentPolyline);

			segmentLengths.push({
				segment: i + 2,
				from: overnightLocations[i].flag || `Location ${i + 1}`,
				to: overnightLocations[i + 1].flag || `Location ${i + 2}`,
				lengthKm: (segmentLength / 1000).toFixed(1),
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
		let minDistance = Number.POSITIVE_INFINITY;
		let closestIndex = 0;

		for (let i = 0; i < routeCoordinates.length; i++) {
			const distance = getEuclideanDistance(
				routeCoordinates[i],
				targetLocation,
			);
			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = i;
			}
		}

		return closestIndex;
	}

	/**
	 * Creates tooltip text for a camping location
	 * @param {Object} campingData - The camping location data
	 * @param {Object} etappe - The etappe data
	 * @param {number} index - The index of the camping location (0-based)
	 * @returns {string} The HTML tooltip text
	 */
	createTooltipText(campingData, etappe, index) {
		const land = etappe.from === etappe.to
			? etappe.from
			: `${etappe.from} &#8611; ${etappe.to}`;

		let tooltipText = `<h2>Etappe ${index + 1}</h2>
			<h1>${land}</h1>
			<h3>${etappe.lengthKm} km</h3>`;

		if (campingData.tentPhoto) {
			const imagePath = `/images/slaapspots/${index + 1}.webp`;
			tooltipText += `<img width='287px' src='${imagePath}' alt='slaapplek ${index + 1}' />`;
		}

		return tooltipText;
	}

	animateCampingLocations() {
		let i = 0;

		const timer = setInterval((_) => {
			if (i >= overnachtingen.length - 1) {
				clearInterval(timer);

				// Add a 1 second delay before zooming
				setTimeout(() => {
					const end = overnachtingen.length;
					const start = end - 11;
					const coords = overnachtingen.slice(start, end).map((loc) => [loc.lat, loc.lon]);
					if (coords.length > 1) {
						const bounds = L.latLngBounds(coords);
						this.map.fitBounds(bounds, { padding: [0, 0] });
					}
				}, 1111);

				return;
			}
			const campingData = overnachtingen[i];
			const campingCoordinates = [campingData.lat, campingData.lon];
			const etappe = etappes[i];

			const tooltipText = this.createTooltipText(campingData, etappe, i);

			let tentMarkerOptions = { icon: tentjeIcon };
			if (campingData.icon === "huis") {
				tentMarkerOptions = { icon: huisjeIcon };
			}

			const tentMarker = L.marker(campingCoordinates, tentMarkerOptions)
				.addTo(this.map)
				.bindTooltip(tooltipText);

			// const tentIndex = i;
			// const tentMarker = L.marker(campingCoordinates, { icon: tentjeIcon })
			// 	.addTo(this.map)
			// 	.bindTooltip(tooltipText);
			// .bindPopup(tooltipText);

			// Store reference to tent marker
			// this.tentMarkers[tentIndex] = tentMarker;

			// Add click event to show the corresponding segment polyline
			// tentMarker.on('click', () => {
			//   // Hide all segments first
			//   for (const poly of this.segmentPolylines) {
			//     poly.setStyle({ opacity: 0 });
			//   }

			//   // Show only the clicked segment
			//   if (this.segmentPolylines[tentIndex]) {
			//     this.segmentPolylines[tentIndex].setStyle({ opacity: 1 });
			//     if (this.segmentPolylines[tentIndex].bringToFront) {
			//       this.segmentPolylines[tentIndex].bringToFront();
			//     }
			//   }
			// });

			++i;
		}, 69);
	}

	generateSegmentButtons(overnachtingen, totaleRoute, latLngsTotaleRoute) {
		const numPerSegment = 10;
		const numSegments = Math.ceil(overnachtingen.length / numPerSegment);
		const controls = document.getElementById("segment-controls");
		controls.innerHTML = ""; // Clear previous

		// Whole route button
		const allBtn = document.createElement("button");
		allBtn.textContent = "Hele route";
		allBtn.onclick = () => {
			this.map.fitBounds(totaleRoute.getBounds(), { padding: [0, 0] });
			this.setActiveButton(allBtn);
		};
		controls.appendChild(allBtn);

		// Segment buttons
		for (let i = 0; i < numSegments; i++) {
			const start = i * numPerSegment;
			const end = Math.min((i + 1) * numPerSegment, overnachtingen.length);
			const btn = document.createElement("button");

			btn.textContent = (start+1 === end) ? `Dag ${end}` : `Dag ${start + 1}-${end}`;
			
			btn.onclick = () => {
				const coords = overnachtingen
					.slice(start, end)
					.map((loc) => [loc.lat, loc.lon]);
				if (coords.length > 1) {
					const bounds = L.latLngBounds(coords);
					this.map.fitBounds(bounds, { padding: [22, 42] });
				}
				this.setActiveButton(btn);
			};
			controls.appendChild(btn);
		}
		// Optionally, set the first button as active
		this.setActiveButton(allBtn);
	}

	setActiveButton(btn) {
		for (const b of document.querySelectorAll("#segment-controls button")) {
			b.classList.remove("active");
		}
		btn.classList.add("active");
	}
}

export default MapHandler;
