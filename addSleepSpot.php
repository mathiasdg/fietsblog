<?php

// Add CORS headers
header("Access-Control-Allow-Origin: *");  // Allow requests from any origin
header("Access-Control-Allow-Methods: POST");  // Allow POST requests
header("Access-Control-Allow-Headers: Content-Type");  // Allow Content-Type header
header('Content-Type: application/json');

// Read the incoming JSON data
$json_data = file_get_contents('php://input');

// Dynamically determine the path to the JSON file in the public directory
$jsonFilePath = './public/overnachtingen.json';

if (file_put_contents($jsonFilePath, $json_data) === false) {
  echo json_encode(array('error' => 'Could not save data to file'. $jsonFilePath ) );
  if (!is_writable($jsonFilePath)) {
    echo json_encode(array('error' => 'File is not writable'. $jsonFilePath ) );
  } elseif (!file_exists($jsonFilePath)) {
    echo json_encode(array('error' => 'File does not exist'. $jsonFilePath ) );
  } else {
    echo json_encode(array('error' => 'onbekende erreuuuuur' ) );
  }
} else {
  echo $json_data;
}