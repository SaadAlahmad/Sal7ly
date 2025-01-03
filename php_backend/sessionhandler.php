<?php
session_start();

header("Content-Type: application/json");
$allowedOrigins = ['http://localhost:5173']; // Add your allowed origins here
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
} else {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}


$response = ['loggedIn' => false];

if (isset($_SESSION['user'])) {
    $response['loggedIn'] = true;
    $response['username'] = $_SESSION['user']['name'];
    $response['email'] = $_SESSION['user']['email'];
}

echo json_encode($response);
exit;
?>
