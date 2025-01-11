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
$requestId = $data['request_id'] ?? null;
$applicationId = $data['application_id'] ?? null;
$action = $data['action'] ?? 'accept'; // Default action is accept

try {
    if ($action === 'accept') {
        if (!$craftsmanId || !$requestId || !$applicationId) {
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }

        // Update the request status to 0 (inactive)
        $stmtRequest = $conn->prepare("UPDATE requests SET status = 0 WHERE id = :request_id");
        $stmtRequest->bindParam(':request_id', $requestId, PDO::PARAM_INT);
        if (!$stmtRequest->execute()) {
            echo json_encode(['error' => 'Failed to update request status']);
            exit;
        }

        // Update all applications related to the request to status 0 (inactive)
        $stmtApplications = $conn->prepare("UPDATE applications SET status = 0 WHERE request_id = :request_id");
        $stmtApplications->bindParam(':request_id', $requestId, PDO::PARAM_INT);
        if (!$stmtApplications->execute()) {
            echo json_encode(['error' => 'Failed to update applications status']);
            exit;
        }

        // Insert the project data into the projects table
        $stmtProject = $conn->prepare(
          "INSERT INTO projects (craftsman_id, user_id, application_id, request_id, created_at, status) 
          VALUES (:craftsman_id, 
                  (SELECT user_id FROM requests WHERE id = :request_id LIMIT 1), 
                  :application_id, 
                  :request_id, 
                  NOW(),
                  1)"
      );
        $stmtProject->bindParam(':craftsman_id', $craftsmanId, PDO::PARAM_INT);
        $stmtProject->bindParam(':request_id', $requestId, PDO::PARAM_INT);
        $stmtProject->bindParam(':application_id', $applicationId, PDO::PARAM_INT);

        if ($stmtProject->execute()) {
            echo json_encode(['success' => true, 'message' => 'Request accepted and project created successfully']);
        } else {
            echo json_encode(['error' => 'Failed to insert project']);
        }
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
?>
