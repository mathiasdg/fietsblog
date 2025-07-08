<?php

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');   

// 🔄 Functie om vlag te halen
function countryCodeToEmoji(string $code): string {
    $code = strtoupper($code);
    $offset = 0x1F1E6;
    $emoji = '';
    foreach (str_split($code) as $char) {
        $emoji .= mb_chr($offset + ord($char) - ord('A'), 'UTF-8');
    }
    return $emoji;
}

function getCountryData($lat, $lng) {
    $url = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=json&zoom=3&addressdetails=1";
    $opts = [
        "http" => ["header" => "User-Agent: MathiflipAdminScript/69"]
    ];
    $context = stream_context_create($opts);
    $json = file_get_contents($url, false, $context);
    $data = json_decode($json, true);

    if (!isset($data['address'])) return null;

    return [
        'country' => $data['address']['country'] ?? null,
        'country_code' => $data['address']['country_code'] ?? null
    ];
}

// 📥 Lees binnenkomende JSON
$incoming = json_decode(file_get_contents('php://input'), true);

$lat = (float) round($incoming['lat'], 6);
$lng = (float) round($incoming['lon'], 6);
$foto = $incoming['foto'] ?? null;

// 🌍 Voeg land en vlag toe
$geo = getCountryData($lat, $lng);
$country = $geo['country'] ?? null;
$flag = $geo['country_code'] ? countryCodeToEmoji($geo['country_code']) : null;

// 📁 Pad naar json
$jsonFilePath = '../public/overnachtingen.json';

// 📂 Bestaande data inladen
if (file_exists($jsonFilePath)) {
    $existing = json_decode(file_get_contents($jsonFilePath), true);
} else {
    $existing = ['slaapCoordinaten' => []];
}

// 🏕️ Voeg toe
$existing['slaapCoordinaten'][] = [
    'lat' => $lat,
    'lon' => $lng,
    'country' => $country,
    'flag' => $flag,
    "kmTotHier" => null,
    "blogTitle" => null,
    "tentPhoto" => null,
    "icon" => "tent"
];

// 💾 Opslaan
if (file_put_contents($jsonFilePath, json_encode($existing, JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['success' => true, 'count' => count($existing['slaapCoordinaten']), 'added' => end($existing['slaapCoordinaten'])]);
} else {
    echo json_encode(['error' => 'Kon JSON bestand niet wegschrijven']);
}
