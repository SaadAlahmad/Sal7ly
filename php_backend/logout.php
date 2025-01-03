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

// Destroy the session
session_unset();
session_destroy();

// Respond with success
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
exit;
?>
