<?php
require_once 'token.php';

// URL of the uploaded .docx file from Firebase (test URL hardcoded)
$docxUrl = $_POST['docxUrl'] ?? null; // Get the URL from POST request
if (!$docxUrl) {
    die('Error: No .docx file URL provided.');
}

$tool = 'officepdf'; // DOCX to PDF tool

// Step 1: Start Task
$startUrl = "https://api.ilovepdf.com/v1/start/$tool";
$ch = curl_init($startUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);
$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

$taskId = $data['task'] ?? null;
$server = $data['server'] ?? null;

if (!$taskId || !$server) {
    die('Error: Failed to initialize iLovePDF task.');
}

// Step 2: Upload the DOCX file by URL (cloud_file)
$uploadUrl = "https://$server/v1/upload";
$uploadData = [
    'task' => $taskId,
    'cloud_file' => $docxUrl
];

$ch = curl_init($uploadUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($uploadData));
$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

$serverFilename = $data['server_filename'] ?? null;
if (!$serverFilename) {
    die('Error: Failed to upload .docx file to iLovePDF.');
}

// Step 3: Process the file (convert DOCX to PDF)
$processUrl = "https://$server/v1/process";
$processData = [
    'task' => $taskId,
    'tool' => $tool,
    'files' => [
        [
            'server_filename' => $serverFilename,
            'filename' => 'letterAPB.pdf'  // Name you want for the output
        ]
    ]
];

$ch = curl_init($processUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($processData));
$response = curl_exec($ch);
$processResponse = json_decode($response, true);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpStatus !== 200 || ($processResponse['status'] ?? '') !== 'TaskSuccess') {
    die('Error: Failed to process the .docx file.');
}

$downloadUrl = "https://$server/v1/download/$taskId";

$ch = curl_init($downloadUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);

$fileData = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpStatus !== 200) {
    die("Error: Failed to download the converted PDF file. HTTP Status: $httpStatus");
}

// Save the PDF locally
$outputPath = __DIR__ . '/letterAPB.pdf';
file_put_contents($outputPath, $fileData);

// Include Firebase PHP SDK
require_once __DIR__ . '/vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Storage;

// Initialize Firebase Storage
$firebase = (new Factory)
    ->withServiceAccount(__DIR__ . '/mygaji-7212c-firebase-adminsdk-fbsvc-49cfb470e0.json') // Correct path to the JSON file
    ->withDefaultStorageBucket('mygaji-7212c.firebasestorage.app'); // Correct bucket name from Firebase Console

$storage = $firebase->createStorage();
$bucket = $storage->getBucket();

// Extract employeeId from the docxUrl (assuming it's part of the URL)
preg_match('/letters%2F(.*?)%2F/', $docxUrl, $matches);
$employeeId = urldecode($matches[1] ?? 'unknown'); // Decode the employeeId to handle spaces

// Upload the PDF to Firebase Storage
$firebaseFilePath = "letters/" . rawurlencode($employeeId) . "/Surat_Sebab.pdf"; // Encode the path properly
try {
    $bucket->upload(
        fopen($outputPath, 'r'),
        [
            'name' => $firebaseFilePath,
            'metadata' => [
                'contentType' => 'application/pdf'
            ]
        ]
    );

    // Get the public URL of the uploaded file
    $uploadedFile = $bucket->object($firebaseFilePath);
    $publicUrl = $uploadedFile->signedUrl(new DateTime('+1 year')); // Generate a signed URL valid for 1 year

    // Return the public URL as a JSON response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded to Firebase successfully.',
        'publicUrl' => $publicUrl
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error uploading file to Firebase: ' . $e->getMessage()
    ]);
    exit;
}

// Ensure no additional output
exit;

