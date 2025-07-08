const button = document.querySelector("#nieuw");
const coordsInput = document.querySelector("#coords");
const feedbackDiv = document.querySelector("#feedback");
const map = document.querySelector("#map");
let deviceCoords = null;
const defaultCoords = [46.69, 21.69]; // update tijdens de reis
const mode = import.meta.env.VITE_MODE;
let apiUrl = "";

if (mode === "dev") {
  apiUrl = "http://localhost/fietsblog/api/addSleepSpot.php";
} else {
  apiUrl = "./api/addSleepSpot.php";
}

navigator.geolocation.getCurrentPosition(
  (position) => {
    deviceCoords = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    coordsInput.value = deviceCoords;
    initMap(); // Initialize map with device coordinates
  },
  (error) => {
    console.error(error);
    deviceCoords = defaultCoords; // Use fallback coordinates
    initMap(); // Initialize map with default coordinates
  }
);

function initMap() {
  const mapz = L.map("map").setView(deviceCoords, 11);
  // rest of your map initialization code
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
    mapz.setView([lat, lng], mapz.getZoom());
    coordsInput.value = [lat, lng].toString();
  });

  return mapz;
}

// setTimeout(() => {
//   initMap();
// }, 3690);


async function updateData(newCoordys) {

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCoordys),
  });

  if (response.ok) {
    const responseData = await response.json();
    const nr = responseData.count;
    feedbackDiv.innerHTML =
      "<br><mark>slaapplek " +
      nr +
      " toegevoegd met coordys: " +
      responseData.added.lat +
      "," +
      responseData.added.lon +
      " in " +
      responseData.added.country +
      " " +
      responseData.added.flag +
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
    .map((coord) => parseFloat(coord.trim()).toFixed(6));

  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    // Use coordinates from the input field if available
    const newCoordys = {'lat': coords[0], 'lon': coords[1]};
    updateData(newCoordys).catch((error) =>
      console.error("Toevoegen niet gelukt: ", error)
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
          console.error("Toevoegen niet gelukt: ", error)
        );
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  }
});
