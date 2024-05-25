import data from "./js/overnachtingen.json";

const button = document.querySelector("#nieuw");
const geoDiv = document.querySelector("#geo");

if (geoDiv) {
  if (navigator.geolocation) {
    geoDiv.textContent = "joepie";
  } else {
    geoDiv.textContent = "geolocatie is niet beschikbaar";
  }
}

button?.addEventListener("click", (event) => {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition((position) => {
    data.overnachtingen.push([position.coords.latitude, position.coords.longitude]);

    fetch("http://localhost/fietsblog/addSleepSpot.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      console.log(response.status);
      return response.json();  // Make sure to handle the JSON response correctly
    })
      .then((responseData) => {
        console.log("Response data:", responseData.overnachtingen);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
