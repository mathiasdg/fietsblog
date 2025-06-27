const button = document.querySelector("#nieuw");
const coordsInput = document.querySelector("#coords");
const feedbackDiv = document.querySelector("#feedback");
const map = document.querySelector("#map");
let deviceCoords = null;

navigator.geolocation.getCurrentPosition(
  (position) => {
    deviceCoords = [
      position.coords.latitude,
      position.coords.longitude,
      // position.coords.accuracy,
      // position.timestamp,
    ];
    // console.log(deviceCoords);
    coordsInput.value = deviceCoords;
    // console.log("jok");
  },
  (error) => {
    console.error(error);
  }
);
// initMap();

function initMap() {
  const mapz = L.map("map").setView(deviceCoords, 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(mapz);
  let marker = L.marker(deviceCoords).addTo(mapz);

  // Add marker on click
  mapz.on("click", function (e) {
    const { lat, lng } = e.latlng;
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker([lat, lng]).addTo(mapz);
    }
    // console.log(`Clicked at ${lat}, ${lng}`);
    mapz.setView([lat, lng], mapz.getZoom());
    coordsInput.value = [lat, lng].toString();
  });

  return mapz;
}

// setTimeout(() => {
//   initMap();
// }, 3690);

// fetch de overnachtingen uit de dynamische json file
async function fetchData() {
  const response = await fetch("/overnachtingen.json");
  const data = await response.json();
  return data;
}

async function updateData(newCoordys) {
  const data = await fetchData();
  data.slaapCoordinaten.push(newCoordys);

  const response = await fetch("./addSleepSpot.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const responseData = await response.json();
    const nr = responseData.slaapCoordinaten.length;
    feedbackDiv.innerHTML =
      "<br><mark>slaapplek " +
      nr +
      " toegevoegd met coordys: " +
      responseData.slaapCoordinaten[nr - 1] +
      "</mark>";
  } else {
    console.error("Failed to update data");
  }
}

button.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const coords = coordsInput.value
    .split(",")
    .map((coord) => parseFloat(coord.trim()));

  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    // Use coordinates from the input field if available
    const newCoordys = [coords[0], coords[1]];
    updateData(newCoordys).catch((error) =>
      console.error("Error updating data:", error)
    );
  } else {
    // Use Geolocation API if the input field is empty or invalid
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoordys = [
          position.coords.latitude,
          position.coords.longitude,
          // position.coords.accuracy,
          // position.timestamp,
        ];

        updateData(newCoordys).catch((error) =>
          console.error("Error updating data:", error)
        );
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  }
});
