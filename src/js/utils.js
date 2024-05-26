/**
 * Calculates the distance between two geographic coordinates in kilometers.
 *
 * @param {number} lat1 - The latitude of the first coordinate in degrees.
 * @param {number} lon1 - The longitude of the first coordinate in degrees.
 * @param {number} lat2 - The latitude of the second coordinate in degrees.
 * @param {number} lon2 - The longitude of the second coordinate in degrees.
 * @returns {number} The distance between the two coordinates in kilometers.
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Converts a degree value to its corresponding radian value.
 *
 * @param {number} deg - The degree value to be converted.
 * @returns {number} The radian value corresponding to the input degree value.
 */
export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the Euclidean distance between two 2D coordinates.
 *
 * @param {number[]} coord1 - The first 2D coordinate as an array of [x, y].
 * @param {number[]} coord2 - The second 2D coordinate as an array of [x, y].
 * @returns {number} The Euclidean distance between the two coordinates.
 */
export function getEuclideanDistance(coord1, coord2) {
  const distX = coord1[0] - coord2[0];
  const distY = coord1[1] - coord2[1];
  return Math.sqrt(distX ** 2 + distY ** 2);
}
