<?php
header("Content-Type: application/json");

$allowedOrigins = ['http://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
} else {
    http_response_code(403);
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'bayesianupdater.php';
require_once 'DbConnect.php';
$db = new DbConnect();
$conn = $db->connect();

try {
    $success = updateBayesianData($conn);
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Bayesian data updated successfully for all records.']);
    } else {
        echo json_encode(['error' => 'Failed to update Bayesian data.']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
