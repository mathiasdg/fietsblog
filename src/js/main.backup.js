const map = initializeMap();
// init GLOBALS
const slaapplek = [51.91898815392505, 10.29477981462838];
const extraInfo = document.getElementById('extra_info').firstChild;
const fietsje = L.icon({
  iconUrl: 'images/fietsje.svg',
  iconSize: [33, 33],
  iconAnchor: [16, 16],
  tooltipAnchor: [22, 0],
});
const tentie = L.icon({
  iconUrl: 'images/tentie.svg',
  iconSize: [33, 33],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
});

addCampingLocation(map, slaapplek, tentie);

fetchAndDrawRoute(map, slaapplek, fietsje, extraInfo);



function initializeMap() {
    const map = L.map('map').setView([51.133, 4.55], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
}

function addCampingLocation(map, slaapplek, icon) {
    L.marker(slaapplek, { icon })
        .addTo(map)
        .bindTooltip("lat: " + slaapplek[0] + "<br> lon: " + slaapplek[1])
        .getElement().classList.add('mirrored-icon');
}

function fetchAndDrawRoute(map, slaapplek, icon, extraInfo) {
    fetch('data.gpx')
        .then(response => response.text())
        .then(text => parseAndDrawRoute(map, slaapplek, icon, extraInfo, text))
        .catch(error => console.error('Error fetching GPX file:', error));
}

function parseAndDrawRoute(map, slaapplek, icon, extraInfo, gpxText) {
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
    const latlngs_totale_route = [];
    let minDist = Infinity;
    let closestPoint;
    let afstand = 0;
    let vorige_punt = [items[0].getAttribute('lat'), items[0].getAttribute('lon')];

    for (let i = 0; i < items.length; ++i) {
        const coordinate = [items[i].getAttribute('lat'), items[i].getAttribute('lon')];
        
        if (i != 0){
            const dist = getDistanceFromLatLonInKm(vorige_punt[0], vorige_punt[1], coordinate[0], coordinate[1]);
            afstand += dist;
        }
        
        let distX = coordinate[0] - slaapplek[0];
        let distY = coordinate[1] - slaapplek[1];
        let dist = Math.sqrt(distX**2 + distY**2);
        
        if(dist < minDist) {
            minDist = dist;
            closestPoint = coordinate;
        }
        
        latlngs_totale_route.push(coordinate);
        vorige_punt = coordinate;
    }

    console.log(afstand, ' in meters?');
    console.log(closestPoint);

    const totale_route = L.polyline(latlngs_totale_route, {color: '#ff6944', opacity: 0.69}).addTo(map);
    const lll = L.GeometryUtil.length(totale_route);

    const punde = L.point(slaapplek);
    const dicht_punde = totale_route.closestLayerPoint(map.latLngToLayerPoint(slaapplek));
    
    let indy = latlngs_totale_route.indexOf(closestPoint);
    const percy_in_array = (indy / latlngs_totale_route.length * 100).toFixed(2);
    const latlngs_totale_afgelegde_route = latlngs_totale_route.slice(0, indy+1);
    
    const afgelegde_route = L.polyline(latlngs_totale_afgelegde_route, {color: '#116944', weight: 6.9}).addTo(map);
    const aaa = L.GeometryUtil.length(afgelegde_route);
    console.log(aaa/1000);
    console.log((aaa/lll*100).toFixed(2), '%');

    map.fitBounds(totale_route.getBounds());
}

// Call processData function to start the process
processData();


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
//     let closestPoint;

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
//             closestPoint = coordinate;
//             //   latlngs_totale_afgelegde_route.push(closestPoint);
//         }
        
        
        
//         latlngs_totale_route.push(coordinate)
        
//         vorige_punt = coordinate;
//     }
//     console.log(afstand, ' in meters?');

// // console.log(closestPoint);

// L.marker(closestPoint, {icon: fietsje})
//   .addTo(map)
//   .bindTooltip("lat: " + closestPoint[0] + "<br> lon: " + closestPoint[1]);



// const totale_route = L.polyline(latlngs_totale_route, {color: '#ff6944', opacity: 0.69}).addTo(map);

// const lll = L.GeometryUtil.length(totale_route);
// console.log(lll/1000);


// const punde = L.point(slaapplek);
// console.log(slaapplek);
// console.log(punde);

// const dicht_punde = totale_route.closestLayerPoint(map.latLngToLayerPoint(slaapplek));

// console.log('dicht ze ', dicht_punde);


// // console.log(latlngs_totale_route);

// let indy = latlngs_totale_route.indexOf(closestPoint);
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


const bar = new ProgressBar.Line('#progress', {
  strokeWidth: 1,
  easing: 'easeOut',
  duration: 2222,
  color: '#116944',
  trailColor: 'rgba(0,0,0,0)',
  // trailColor: '#ff6944',
  trailWidth: 1,
  svgStyle: {width: '100%', height: '100%'},
  text: {
    // style: null,
    // value: '69%',
    // style: {
      // Text color.
      // Default: same as stroke color (options.color)
      // color: '#111',
      // position: 'absolute',
      // left: '46%',
      // top: '10%',
      // padding: 0,
      // margin: 0,
      // transform: null,
      // },
      // autoStyleContainer: false
    }
  });
bar.animate(0.39);  // Value from 0.0 to 1.0
  

const afgelegde_km = 686;
const tot_km = 1769;
  
const intID = setInterval(function() {
    bar.setText( (bar.value()*100).toFixed(0) + '%');
    extra_info.textContent = 'Reeds bestierde afstand: '+ (bar.value()*tot_km).toFixed(0) +'km van de in totaal '+ tot_km +'km';
    // extra_info.style.marginLeft = (bar.value()*69).toFixed(0) + '%';
}, 10);

setTimeout(function() {
  clearInterval(intID);
}, 2369);



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
