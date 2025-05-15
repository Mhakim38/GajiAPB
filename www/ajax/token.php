<?php
// Step 1: Load .env file manually
$envPath = __DIR__ . '\..\..\.env';

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    list($key, $value) = explode('=', $line, 2);
    putenv(trim($key) . '=' . trim($value));
}

$publicKey = getenv('PUBLIC_KEY'); 
// print_r($publicKey); die();

// Step 2: Authenticate with iLovePDF
$ch = curl_init('https://api.ilovepdf.com/v1/auth');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['public_key' => $publicKey]));

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

$token = $data['token'] ?? null;

// Debug output
// print_r($data);

// echo "Token received successfully: $token \n";
