<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
// header('Content-Type: application/json');

ini_set('error_reporting', false);

$sleepSpotNumber = null;
// Detecteer of we in development zijn
$isLocal = $_SERVER['HTTP_HOST'] === 'localhost' ||
    strpos($_SERVER['HTTP_HOST'], 'localhost') !== false;

// 📁 Pad naar json
$jsonFilePath = $isLocal
    ? '../public/overnachtingen.json'
    : '../overnachtingen.json';

// 📁 Pad naar slaapspot upload dir
$uploadDir = $isLocal
    ? '../public/images/slaapspots/'
    : '../images/slaapspots/';

// 📥 Lees binnenkomende POST vars
if (empty($_POST)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Geen POST params ontvangen!']);
    exit;
}

// ⛳ Coördinaten uitlezen
$lat = isset($_POST['lat']) ? round(floatval($_POST['lat']), 6) : null;
$lng = isset($_POST['lng']) ? round(floatval($_POST['lng']), 6) : null;

// 🌍 Voeg land en vlag toe
$geo = getCountryData($lat, $lng);
$country = $geo['country'] ?? 'België';
$countryCode = $geo['country_code'] ?? 'be';
$flag = countryCodeToEmoji($countryCode);

// 📂 Bestaande data inladen
if (file_exists($jsonFilePath)) {
    $existing = json_decode(file_get_contents($jsonFilePath), true);
    if ($existing === null) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Kan bestaande JSON file niet lezen']);
        exit;
    }
    $sleepSpotNumber = 1 + count($existing['slaapCoordinaten']);
} else {
    $existing = ['slaapCoordinaten' => []];
}

// verwerk de image
$photoUploadedResult = processImage($sleepSpotNumber, $uploadDir);

// 🏕️ Voeg toe
$existing['slaapCoordinaten'][] = [
    'lat' => $lat,
    'lon' => $lng,
    'country' => $country,
    'flag' => $flag,
    'kmTotHier' => null,
    'blogTitle' => null,
    'tentPhoto' => $photoUploadedResult['bool'],
    'icon' => 'tent'
];

// 💾 Opslaan
if (file_put_contents($jsonFilePath, json_encode($existing, JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['success' => true, 'count' => count($existing['slaapCoordinaten']), 'added' => end($existing['slaapCoordinaten']), 'upload_msg' => $photoUploadedResult['msg']]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Kon JSON bestand niet wegschrijven']);
}

function dd($var)
{
    var_dump($var);
    exit;
}

// 🔄 Functie om vlag te halen
function countryCodeToEmoji(string $code): string
{
    $code = strtoupper($code);
    $offset = 0x1F1E6;
    $emoji = '';
    foreach (str_split($code) as $char) {
        $emoji .= mb_chr($offset + ord($char) - ord('A'), 'UTF-8');
    }
    return $emoji;
}

function getCountryData($lat, $lng): null|array
{
    $url = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=json&zoom=3&addressdetails=1";
    $opts = [
        'http' => ['header' => 'User-Agent: MathiflipAdminScript/69']
    ];
    $context = stream_context_create($opts);
    $json = file_get_contents($url, false, $context);
    $data = json_decode($json, true);

    if (!isset($data['address']))
        return null;

    return [
        'country' => $data['address']['country'] ?? null,
        'country_code' => $data['address']['country_code'] ?? null
    ];
}

function processImage($filename, $uploadDir): array
{
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $tmpPath = $_FILES['foto']['tmp_name'];
        $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        // $filename = $filename . "." . $ext;
        $filename = $filename . '.webp';
        $destination = $uploadDir . $filename;

        // ❇️ Resize/optimaliseer (max 369px breed)
        list($width, $height) = getimagesize($tmpPath);
        $maxWidth = 420;
        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = intval($height * ($maxWidth / $width));
            $src = imagecreatefromstring(file_get_contents($tmpPath));
            $dst = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagejpeg($dst, $destination, 87);  // 87% kwaliteit
            imagedestroy($src);
            imagedestroy($dst);
        } else {
            move_uploaded_file($tmpPath, $destination);
        }
        return array('bool' => true, 'msg' => 'Foto succesvol geupload');
    } else {
        return array('bool' => null, 'msg' => 'Geen foto geupload');
    }
}
