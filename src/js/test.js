
// init de map
var map = L.map('map').setView([51.133, 4.55], 12);
// init tiles van OSM
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// init GLOBALS
const slaapplek = [51.91898815392505, 10.29477981462838];
const extra_info = document.getElementById('extra_info').firstChild;


const fietsje = L.icon({
  iconUrl: '/images/fietsje.svg',
    iconSize: [33, 33],
    iconAnchor: [16, 16],
    tooltipAnchor: [22, 0],
  });
const tentie = L.icon({
  iconUrl: '/images/tentie.svg',
  iconSize: [33, 33],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0],
});


L.marker(slaapplek, {icon: tentie})
  .addTo(map)
  .bindTooltip("lat: " + slaapplek[0] + "<br> lon: " + slaapplek[1]);



var gpx = 'data.gpx' // URL to your GPX file or the GPX itself
new L.GPX(gpx, {
    async: true,
    marker_options: {}
}).on('loaded', function(e) {
  map.fitBounds(e.target.getBounds());
  console.log(
      'dist:', e.target.get_distance()/1000,
      'min:', e.target.get_elevation_min()+'m',
      'max:', e.target.get_elevation_max()+'m',
      'gain:', e.target.get_elevation_gain()+'m',
      'loss:', e.target.get_elevation_loss()+'m',
  );
}).addTo(map);



// haal de gpx punten op
