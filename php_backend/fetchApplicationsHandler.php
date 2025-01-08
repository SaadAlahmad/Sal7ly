<?php
header("Content-Type: application/json");
$allowedOrigins = ['http://localhost:5173']; // Allowed origins
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

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);
$craftsmanId = $data['craftsman_id'] ?? null;
$action = $data['action'] ?? 'fetch'; // Default action is fetch

try {
    switch ($action) {
        case 'fetch':
            // Fetch applications for the craftsman
            if (!$craftsmanId) {
                echo json_encode(['error' => 'Invalid input']);
                exit;
            }

            $stmt = $conn->prepare("SELECT * FROM applications WHERE craftsman_id = :craftsman_id AND status = 1 ORDER BY created_at DESC");
            $stmt->bindParam(':craftsman_id', $craftsmanId, PDO::PARAM_INT);
            $stmt->execute();
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'applications' => $applications]);
            break;

        case 'modify':
            // Modify application
            $applicationId = $data['application_id'] ?? null;
            $message = $data['message'] ?? null;

            if (!$applicationId || !$message) {
                echo json_encode(['error' => 'Invalid input for modification']);
                exit;
            }

            $stmt = $conn->prepare("UPDATE applications SET message = :message WHERE id = :application_id AND craftsman_id = :craftsman_id");
            $stmt->bindParam(':message', $message, PDO::PARAM_STR);
            $stmt->bindParam(':application_id', $applicationId, PDO::PARAM_INT);
            $stmt->bindParam(':craftsman_id', $craftsmanId, PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Application modified successfully']);
            } else {
                echo json_encode(['error' => 'Failed to modify application']);
            }
            break;

        case 'delete':
            // Delete application (set status to 0)
            $applicationId = $data['application_id'] ?? null;

            if (!$applicationId) {
                echo json_encode(['error' => 'Invalid input for deletion']);
                exit;
            }

            $stmt = $conn->prepare("UPDATE applications SET status = 0 WHERE id = :application_id AND craftsman_id = :craftsman_id");
            $stmt->bindParam(':application_id', $applicationId, PDO::PARAM_INT);
            $stmt->bindParam(':craftsman_id', $craftsmanId, PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Application deleted successfully']);
            } else {
                echo json_encode(['error' => 'Failed to delete application']);
            }
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
?>
