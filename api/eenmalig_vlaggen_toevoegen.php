<?php

function countryCodeToEmoji(string $code): string {
    $code = strtoupper($code);
    $offset = 0x1F1E6;
    $emoji = '';
    foreach (str_split($code) as $char) {
        $emoji .= mb_chr($offset + ord($char) - ord('A'), 'UTF-8');
    }
    return $emoji;
}

function getCountryData(float $lat, float $lon): array {
    $url = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lon&format=json&zoom=3&addressdetails=1";
    $opts = [
        "http" => ["header" => "User-Agent: MathiflipDonau/69.420"]
    ];
    $context = stream_context_create($opts);
    $json = file_get_contents($url, false, $context);
    $data = json_decode($json, true);
    if (!isset($data['address'])) return null;
    return [
        'country' => $data['address']['country'] ?? '',
        'country_code' => $data['address']['country_code'] ?? ''
    ];
}

// Inlezen en verrijken
$data = json_decode(file_get_contents('./public/overnachtingen.json'), true);

foreach ($data['slaapCoordinaten'] as $k => &$plek) {
    [$lat, $lon] = $plek;
    $result = getCountryData($lat, $lon);

    if ($result) {
        $plek['lat'] = round($lat, 6);
        $plek['lon'] = round($lon, 6);
        $plek['country'] = $result['country'];
        $plek['flag'] = countryCodeToEmoji($result['country_code']);
        $plek['kmTotHier'] = null;
        $plek['blogTitle'] = null;
        $plek['tentPhoto'] = null;
        $plek['icon'] = 'tent';
        // optioneel in de toekomst: kmTotHier, blogTitle, tentPhoto, etc.
        echo "✅ {$plek['country']} {$plek['flag']}<br>\n";
        unset($plek[0]);
        unset($plek[1]);
        usleep(1000); // Rustig aan doen met requests
    } else {
        echo "⚠️ Geen land gevonden voor {++$k}e slaapplek\n";
    }
}

// Wegschrijven naar nieuwe file
file_put_contents('slaapplekken-met-land.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

