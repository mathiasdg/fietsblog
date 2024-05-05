/* 
  TODO :
  - afgelegde route verwijderen na animatie en de volledige tekenen met hoge resolutie (dus alle punten)
  - extra info aanpassen?
  - tentjes in beeld laten vliegen
  - afstand van etappes berekenen en in tooltip zetten
  - fietsje eventueel laten roteren
*/

// init GLOBALS
const map = initializeMap();
const overnachtingen = [
  [ 51.489959, 5.075763 ],
  [ 51.401369, 6.075619 ],
  [ 51.667356, 6.66894 ],
  [ 51.810134, 7.60287 ],
  [ 51.837279, 8.361003 ],
  [ 51.850845, 9.448757 ],
  [ 51.918988, 10.294779 ]
]
const extraInfo = document.getElementById('extra-info');
const fietsje = L.icon({
  iconUrl: 'images/fietsje.svg',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [22, 0],
});
const tentje = L.icon({
  iconUrl: 'images/tentie.svg',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  tooltipAnchor: [16, 0],
});


fetchAndDrawRoute(fietsje, extraInfo);


function initializeMap() {
  const map = L.map('map');
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}


function fetchAndDrawRoute(icon, extraInfo) {
  fetch('data.gpx')
      .then(response => response.text())
      .then(text => parseAndDrawRoute(icon, extraInfo, text))
      .catch(error => console.error('Error fetching GPX file:', error));
}

function parseAndDrawRoute(icon, extraInfo, gpxText) {
  const parser = new DOMParser();
  const data = parser.parseFromString(gpxText, "text/xml");
  const items = data.getElementsByTagName('trkpt');
  // Remaining logic for parsing and drawing the route...
}

// Other helper functions...
async function fetchAndParseGpx() {
  const response = await fetch('data.gpx');
  const text = await response.text();
  const parser = new DOMParser();
  const data = parser.parseFromString(text, "text/xml");

  return data.getElementsByTagName('trkpt');
}

async function processData() {
  const items = await fetchAndParseGpx();
  const latLngsTotaleRoute = [];
  // neem als slaapplek de coordinaten van de laatste slaapplek in de overnachtingen array
  const laatsteSlaapplek = overnachtingen[overnachtingen.length - 1];
  let minDist = Infinity;
  let dichtstePunt;
  let afstand = 0;
  let vorige_punt = [items[0].getAttribute('lat'), items[0].getAttribute('lon')];
  
  // map.setView([0,0], 13);
  map.setView([laatsteSlaapplek[0], laatsteSlaapplek[1]], 13);

  for (let i = 0; i < items.length; ++i) {
    const coordinate = [items[i].getAttribute('lat'), items[i].getAttribute('lon')];
    
    if (i != 0){
        const dist = getDistanceFromLatLonInKm(vorige_punt[0], vorige_punt[1], coordinate[0], coordinate[1]);
        afstand += dist;
    }
    
    let distX = coordinate[0] - laatsteSlaapplek[0];
    let distY = coordinate[1] - laatsteSlaapplek[1];
    let dist = Math.sqrt(distX**2 + distY**2);
    
    if(dist < minDist) {
        minDist = dist;
        dichtstePunt = coordinate;
    }
    
    latLngsTotaleRoute.push(coordinate);
    vorige_punt = coordinate;
  }

  console.log(afstand, ' in meters?');
  console.log(dichtstePunt);

  // maak path van volledige route en teken op map
  const totaleRoute = L.polyline(latLngsTotaleRoute, {color: '#ff6944', opacity: 0.69}).addTo(map);
  const lengteTotaleRoute = L.GeometryUtil.length(totaleRoute);
  
  // const punde = L.point(laatsteSlaapplek);
  // const dichtstePunt = totaleRoute.closestLayerPoint(map.latLngToLayerPoint(laatsteSlaapplek));
  
  const indexOfDichtstePunt = latLngsTotaleRoute.indexOf(dichtstePunt);
  console.log(indexOfDichtstePunt);
  const percy_in_array = (indexOfDichtstePunt / latLngsTotaleRoute.length * 100).toFixed(2);
  const latLngsTotaleAfgelegdeRoute = latLngsTotaleRoute.slice(0, indexOfDichtstePunt+1);
  
  // maak path van afgelegde route en teken op map
  const afgelegdeRoute = L.polyline([], {color: '#116944', weight: 6.9}).addTo(map);

  const fietsMarker = L.marker(latLngsTotaleRoute[0], {icon: fietsje})
    .addTo(map);
    // .bindTooltip("lat: " + dichtstePunt[0] + "<br> lon: " + dichtstePunt[1]);
  
  
  const lengteAfgelegdeRoute = animateRoute(afgelegdeRoute, latLngsTotaleAfgelegdeRoute, fietsMarker);


  console.log(lengteAfgelegdeRoute/1000);
  console.log((lengteAfgelegdeRoute/lengteTotaleRoute*100).toFixed(2), '%');
  
  
  map.fitBounds(totaleRoute.getBounds());
}

// Call processData function to start the process
processData();

setTimeout(animateCampingLocations, 2690);



function animateRoute(route, routeCoordinates, marker) {
  let i = 0;
  let timer = setInterval(function() {
    if (i >= routeCoordinates.length) {
      clearInterval(timer);
      return;
    }
    route.addLatLng(routeCoordinates[i]);
    marker.setLatLng(routeCoordinates[i]);
    i+=69;
  }, 16); // Adjust the interval for desired animation speed


  const lengteAfgelegdeRoute = L.GeometryUtil.length(route);
  return lengteAfgelegdeRoute
}
function animateCampingLocations() {
  // teken alle tentjes buiten het laatste zodat het fietsje goed zichtbaar is
  let i = 0;
  let timer = setInterval(function() {
  if (i >= overnachtingen.length) {
      clearInterval(timer);
      return;
  }
  const campingCoordinates = overnachtingen[i];
  const tooltipText = "etappe " + (i+1) + "<br>afstand : " + null + "<br> totaal bestierde afstand: " + null;
  L.marker(campingCoordinates, { icon: tentje })
    .addTo(map)
    .bindTooltip(tooltipText);
    i++;
  }, 111); // Adjust the interval for desired animation speed

  
}




const bar = new ProgressBar.Line('#bar', {
  // strokeWidth: 1,
  easing: 'easeOut',
  duration: 3333,
  color: '#116944',
  trailColor: '#ff6944',
  // trailWidth: 1,
  svgStyle: {width: '100%', height: '100%'},
  text: {
    style: null,
  }
  // autoStyleContainer: false
  });
bar.animate(0.39);  // Value from 0.0 to 1.0
  

const afgelegde_km = 686;
const tot_km = 1769;
  
const intID = setInterval(function() {
  bar.setText( (bar.value()*100).toFixed(0) + '%');
  extraInfo.textContent = 'Reeds bestierde afstand: '+ (bar.value()*tot_km).toFixed(0) +'km van de in totaal '+ tot_km +'km';
}, 10);

setTimeout(function() {
  clearInterval(intID);
}, 3369);



/*
start function declarations
*/
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



// const gpx_data = fetch('data.gpx')
//   .then((response) => response.text())
//   .then((text) => {
//     const parser = new DOMParser();
//     const data = parser.parseFromString(text, "text/xml");
//     const items = data.getElementsByTagName('trkpt');
//     const latlngs_totale_route = new Array();
//     // const latlngs_totale_afgelegde_route = new Array();
//     // Find closest point
//     let minDist = Infinity;
//     let dichtstePunt;

//     let afstand = 0;
//     let vorige_punt = [items[0].getAttribute('lat'), items[0].getAttribute('lon')];
//     // const start_marky = L.marker(vorige_punt, {opacity: 0.55}).addTo(map);
//     // start_marky.bindTooltip("lat: " + vorige_punt[0] + "<br> lon: " + vorige_punt[1]);

//     for(let i = 0; i < items.length; ++i) {
//         const coordinate = [items[i].getAttribute('lat'), items[i].getAttribute('lon')];


//         // L.marker(coordinate, {opacity: 0.44}).addTo(map);
//             // .bindTooltip("lat: " + coordinate[0] + "<br> lon: " + coordinate[1]);
//         // var ele = items[i].children[0].textContent;

//         if (i != 0){
//             // console.log(coordinate);
//             // console.log(vorige_punt);

//             // let dist_x = coordinate[0] - vorige_punt[0];
//             // let dist_y = coordinate[1] - vorige_punt[1];
//             // let dist = Math.sqrt(dist_x**2 + dist_y**2);
//             const dist = getDistanceFromLatLonInKm(vorige_punt[0], vorige_punt[1], coordinate[0], coordinate[1]);
//             // console.log('dist: ', dist);
//             afstand += dist;
//             // console.log('afstand: ', afstand);
//         }
        
//         // Calculate distance
//         let distX = coordinate[0] - slaapplek[0];
//         let distY = coordinate[1] - slaapplek[1];
//         let dist = Math.sqrt(distX**2 + distY**2);
        
//         // Check if closest
//         if(dist < minDist) {
//             minDist = dist;
//             dichtstePunt = coordinate;
//             //   latlngs_totale_afgelegde_route.push(dichtstePunt);
//         }
        
        
        
//         latlngs_totale_route.push(coordinate)
        
//         vorige_punt = coordinate;
//     }
//     console.log(afstand, ' in meters?');




// const totale_route = L.polyline(latlngs_totale_route, {color: '#ff6944', opacity: 0.69}).addTo(map);

// const lll = L.GeometryUtil.length(totale_route);
// console.log(lll/1000);


// const punde = L.point(slaapplek);
// console.log(slaapplek);
// console.log(punde);

// const dicht_punde = totale_route.closestLayerPoint(map.latLngToLayerPoint(slaapplek));

// console.log('dicht ze ', dicht_punde);


// // console.log(latlngs_totale_route);

// let indy = latlngs_totale_route.indexOf(dichtstePunt);
// console.log(indy);
// console.log(latlngs_totale_route.length);

// const percy_in_array = (indy / latlngs_totale_route.length * 100).toFixed(2);
// console.log(percy_in_array, '%');

// const latlngs_totale_afgelegde_route = latlngs_totale_route.slice(0, indy+1);



// const afgelegde_route = L.polyline(latlngs_totale_afgelegde_route, {color: '#116944', weight: 6.9}).addTo(map);
// const aaa = L.GeometryUtil.length(afgelegde_route);
// console.log(aaa/1000);
// console.log((aaa/lll*100).toFixed(2), '%');
  



// // zoom the map to the polyline
// map.fitBounds(totale_route.getBounds());

// });



// let tagmap = L.map("map");

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  // maxZoom: 19,
  // }).addTo(tagmap);
  
  // function drawTrack(track) {
    // let z = 0;
    // let coordinates = track.points.map((p) => [p.lat.toFixed(5), p.lon.toFixed(5), z++]);
    
    // let polyline = L.hotline(coordinates, {
      //     min: 0,
      //     max: z,
      //     weight: 5,
      //     palette: {
        //     0.0: "#008800",
        //     0.5: "#ffff00",
        //     1.0: "#ff0000",
//     },
//     outlineColor: "#000000",
//     outlineWidth: 1,
// }).addTo(tagmap);
// L.circle(coordinates.at(-1), { radius: 5 }).addTo(tagmap);

// // zoom the map to the polyline
// tagmap.fitBounds(polyline.getBounds());
// }

// let url_string = window.location.href;
// let url = new URL(url_string);
// let trackPath = url.searchParams.get("track");
// if (!trackPath) {
// trackPath = "data/data.gpx";
// }

// fetch(trackPath)
// .then(function (response) {
//     return response.text();
// })
// .then(function (gpxData) {
//     let gpx = new gpxParser();
//     gpx.parse(gpxData);
//     drawTrack(gpx.tracks[0]);
//     document.getElementById("lastUpdate").innerText = gpx.tracks[0].points.at(-1).time.toLocaleString();
// });




