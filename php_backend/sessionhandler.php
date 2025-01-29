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

$response = ['loggedIn' => false];

if (isset($_SESSION['user'])) {
    $response['loggedIn'] = true;
    $response['id'] = $_SESSION['user']['id'];
    $response['name'] = $_SESSION['user']['name'];
    $response['email'] = $_SESSION['user']['email'];
    $response['userType'] = $_SESSION['user']['userType'];

    if ($_SESSION['user']['userType'] === 'craftsman') {
        $response['city'] = $_SESSION['user']['city'] ?? null;
        $response['category'] = $_SESSION['user']['category'] ?? null;

        $response['picture'] = "data:image/jpeg;base64," . $_SESSION['user']['picture'];
    }
}

echo json_encode($response);
exit;
