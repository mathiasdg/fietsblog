<?php

// Add CORS headers
header("Access-Control-Allow-Origin: *");  // Allow requests from any origin
header("Access-Control-Allow-Methods: POST");  // Allow POST requests
header("Access-Control-Allow-Headers: Content-Type");  // Allow Content-Type header
header('Content-Type: application/json');

$jsonFile = 'trips.json';
$tripId = $_POST['tripId'] ?? 'donau-2025'; // Default to new trip if not specified

// Read existing data
$data = json_decode(file_get_contents($jsonFile), true);

// Get new coordinates from POST data
$newCoords = json_decode($_POST['coords'], true);

// Add new coordinates to the specified trip
if (isset($data['trips'][$tripId])) {
    $data['trips'][$tripId]['overnight_locations'][] = $newCoords;
    
    // Save back to file
    file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Location added successfully',
        'trip' => $data['trips'][$tripId]
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Trip not found'
    ]);
}