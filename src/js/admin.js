// import data from "./overnachtingen.json";

const slaapPlekken = await fetchOvernachtingenData();
// console.log(overnachtingen);

// fetch de overnachtingen uit de dynamiosche json file
async function fetchOvernachtingenData() {
  const response = await fetch('/overnachtingen.json');
  const data = await response.json();
  return data;
}

// console.log(slaapPlekken);  
const button = document.querySelector("#nieuw");
const geoDiv = document.querySelector("#geo");

if (geoDiv) {
  if (navigator.geolocation) {
    geoDiv.textContent = "joepie";
  } else {
    geoDiv.textContent = "geolocatie is niet beschikbaar";
  }
}

button.addEventListener("click", (event) => {
  event.preventDefault();

  navigator.geolocation.getCurrentPosition((position) => {
    slaapPlekken.slaapCoordinaten.push([
      position.coords.latitude,
      position.coords.longitude
      // position.coords.accuracy,
      // position.timestamp,
    ]);

    // console.log(slaapPlekken.slaapCoordinaten);

    fetch("http://localhost/fietsblog/addSleepSpot.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slaapPlekken),
    })
      .then((response) => {
        console.log(response.status);
        // return response.json(); // Make sure to handle the JSON response correctly
      })
      // .then((responseData) => {
      //   console.log("Response data:", responseData.overnachtingen);
      // })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
