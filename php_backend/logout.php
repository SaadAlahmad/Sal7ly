<?php
session_start();
header("Content-Type: application/json");

/* 
 FOR RUNING ON PORT 5173 AND DATABASE ON LOCALHOST XAMPP
 CTRL + / AFTER NPM RUN BUILD IF EVERYTHING IS RUNNING ON THE SAME PORT 
*/

$allowedOrigins = ['http://localhost:5173'];
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

session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
exit;
?>
