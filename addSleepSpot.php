<?php
// Add CORS headers
header("Access-Control-Allow-Origin: *");  // Allow requests from any origin
header("Access-Control-Allow-Methods: POST");  // Allow POST requests
header("Access-Control-Allow-Headers: Content-Type");  // Allow Content-Type header
header('Content-Type: application/json');

// Read the incoming JSON data
$json_data = file_get_contents('php://input');

// print_r($json_data);

// Check if the file was successfully written
if (file_put_contents('public/overnachtingen.json', $json_data)) {
  // Set Content-Type to application/json
  header('Content-Type: application/json');
  // Return the JSON data
  echo $json_data;
} else {
  // Set Content-Type to text/plain
  header('Content-Type: text/plain');
  // Return an error message
  echo 'Could not save data to file';
}




  // // Your existing PHP code to handle the incoming data
  // $input = file_get_contents("php://input");
  // $data = json_decode($input, true);
  
  // // Load the existing JSON data
  // $jsonFile = 'path/to/overnachtingen.json';  // Update this path to your actual JSON file location
  // $existingData = json_decode(file_get_contents($jsonFile), true);
  
  // // Append new data
  // $existingData['overnachtingen'] = $data['overnachtingen'];
  
  // // Save the updated data back to the JSON file
  // file_put_contents($jsonFile, json_encode($existingData, JSON_PRETTY_PRINT));
  
  // // Respond with the updated data
  // header('Content-Type: application/json');
  // echo json_encode($existingData);
// }