<?php
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
    header("Access-Control-Allow-Methods: POST, OPTIONS");
} else {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

require_once 'DbConnect.php';
$db = new DbConnect();
$conn = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);
$requestId = $data['request_id'] ?? null;
$craftsmanId = $data['craftsman_id'] ?? null;
$message = $data['applicationText'] ?? null;

if (!$requestId || !$craftsmanId || !$message) {
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {
    do {
        $id = '41' . random_int(1000000000, 9999999999);
        $stmt = $conn->prepare("SELECT COUNT(*) FROM applications WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $idExists = $stmt->fetchColumn() > 0;
    } while ($idExists);

    $stmt = $conn->prepare("
        INSERT INTO applications (id, craftsman_id, request_id, message, created_at, status) 
        VALUES (:id, :craftsman_id, :request_id, :message, NOW(), 1)
    ");
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    $stmt->bindParam(':craftsman_id', $craftsmanId, PDO::PARAM_INT);
    $stmt->bindParam(':request_id', $requestId, PDO::PARAM_INT);
    $stmt->bindParam(':message', $message, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Application submitted successfully']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
