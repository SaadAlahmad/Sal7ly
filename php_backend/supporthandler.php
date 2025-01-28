<?php
header("Content-Type: application/json");
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

$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$message = $data['message'] ?? null;

if (!$name || !$email || !$message) {
    echo json_encode(['error' => 'Invalid input. All fields are required.']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO support (name, email, message, created_at, opened) 
        VALUES (:name, :email, :message, NOW(), 1)
    ");
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':message', $message, PDO::PARAM_STR);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Your inquiry has been submitted successfully.']);
    } else {
        echo json_encode(['error' => 'Failed to submit your inquiry.']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
?>
