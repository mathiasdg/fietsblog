const button = document.querySelector("#nieuw");
const coordsInput = document.querySelector("#coords");
const fotoInput = document.querySelector("#foto");
const feedbackText = document.querySelector("#feedback-text");
const spinner = document.querySelector("#spinner");
// const map = document.querySelector("#map");
let deviceCoords = null;
const defaultCoords = [46.69, 21.69]; // update tijdens de reis
const apiUrl = import.meta.env.VITE_API_URL || './api/addSleepSpot.php';

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
  mapz.on("click", (e) => {
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


async function updateData(formData) {
  // disable button while waiting for response
  button.disabled = true;

  try {
    // show loading indicator
    spinner.style.display = "inline-block";
    feedbackText.innerHTML = "<mark>Bezig met toevoegen...</mark>";

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    })
      // .then(res => res.json())
      // .then(data => {
      //   console.log("✅ Slaapplek toegevoegd", data);
      //   document.getElementById("feedback").innerText = "✅ Tentje toegevoegd!";
      // });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      const nr = responseData.count;
      spinner.style.display = "none";
      feedbackText.innerHTML =
        `<br><mark>slaapplek ${nr} toegevoegd met coordys: ${responseData.added.lat},${responseData.added.lon} in ${responseData.added.country} ${responseData.added.flag}</mark>`;

      // redirect to map
      setTimeout(() => {
        window.location = '/';
      }, 1690);

    } else {
      // Show backend error message
      feedbackText.innerHTML =
        `<br><mark>Fout: ${responseData.error || "Onbekende fout"}</mark>`;
    
      // enable button again for next try
      button.disabled = false;

    }
  } catch (error) {
    // Show network or unexpected error
    feedbackText.innerHTML =
      `<br><mark>Netwerk- of serverfout: ${error.message}</mark>`;
    console.error("Toevoegen niet gelukt: ", error);
  }
}

button.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

    const coordInput = coordsInput.value.trim();
    const foto = fotoInput.files[0];
    const [lat, lng] = coordInput.split(",").map(s => Number.parseFloat(s));
    
    const formData = new FormData();
    formData.append("lat", lat.toFixed(6));
    formData.append("lng", lng.toFixed(6)); 
    if (foto) {
      formData.append("foto", foto);
    }
    
    // const coords = coordsInput.value
    //   .split(",")
    //   .map((coord) => parseFloat(coord.trim()).toFixed(6));
    
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    // Use coordinates from the input field if available
    // const newCoordys = { 'lat': coordInput[0], 'lon': coordInput[1] };
    updateData(formData).catch((error) =>
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
        // enable button again for next try
        button.disabled = false;
        
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  }
});
