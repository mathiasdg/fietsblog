const button = document.querySelector("#nieuw");
const feedbackDiv = document.querySelector("#feedback");

// fetch de overnachtingen uit de dynamiosche json file
async function fetchOvernachtingenData() {
  const response = await fetch("/overnachtingen.json");
  const data = await response.json();
  return data;
}

const slaapPlekken = fetchOvernachtingenData();
slaapPlekken.then((data) => {
  buttonClick(data);
  console.log("plekken geladen, klikken maar!");
});

function buttonClick(slaapPlekken) {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    navigator.geolocation.getCurrentPosition((position) => {
      slaapPlekken.slaapCoordinaten.push([
        position.coords.latitude,
        position.coords.longitude,
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
          return response.json(); // Make sure to handle the JSON response correctly
        })
        .then((responseData) => {
          console.log(responseData.slaapCoordinaten);
          const nr = responseData.slaapCoordinaten.length;
          feedbackDiv.innerHTML =
            "<mark>slaapplek " +
            nr +
            " toegevoegd met coordys: " +
            responseData.slaapCoordinaten[nr - 1] +
            "</mark>";
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });
}
