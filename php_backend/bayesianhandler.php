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

require_once 'DbConnect.php';
$db = new DbConnect();
$conn = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);

function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

$projectId = $data['projectId'] ?? null;

if (!$projectId) {
    sendResponse(400, ['error' => 'Invalid input. Project ID is required.']);
}

try {
    $query = "SELECT craftsman_id FROM projects WHERE id = :projectId";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
    $stmt->execute();
    $project = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        sendResponse(404, ['error' => 'Project not found.']);
    }

    $craftsmanId = $project['craftsman_id'];

    $globalAvgQuery = "SELECT AVG(rating) AS global_avg FROM reviews WHERE status = 1";
    $stmt = $conn->prepare($globalAvgQuery);
    $stmt->execute();
    $globalData = $stmt->fetch(PDO::FETCH_ASSOC);
    $globalAverage = $globalData['global_avg'] ?? 0.0;

    $m = 3; // MINIMUM RATED PROJECTS

    $insertQuery = "
        INSERT INTO bayesian (craftsman_id, reviews_num, average_rating, bayesian)
        SELECT p.craftsman_id, 0, 0, 0
        FROM projects p
        LEFT JOIN bayesian b ON p.craftsman_id = b.craftsman_id
        WHERE b.craftsman_id IS NULL
        GROUP BY p.craftsman_id
    ";
    $conn->prepare($insertQuery)->execute();

    $updateAllQuery = "
        UPDATE bayesian b
        JOIN (
            SELECT p.craftsman_id, COUNT(r.id) AS reviews_count, AVG(r.rating) AS average_rating
            FROM projects p
            JOIN reviews r ON p.id = r.project_id
            WHERE r.status = 1
            GROUP BY p.craftsman_id
        ) sub ON b.craftsman_id = sub.craftsman_id
        SET b.reviews_num = sub.reviews_count,
            b.average_rating = sub.average_rating,
            b.bayesian = ((:m * :globalAverage) + (sub.reviews_count * sub.average_rating)) / (:m + sub.reviews_count)
    ";
    $updateStmt = $conn->prepare($updateAllQuery);
    $updateStmt->bindParam(':m', $m, PDO::PARAM_INT);
    $updateStmt->bindParam(':globalAverage', $globalAverage, PDO::PARAM_STR);
    $updateStmt->execute();

    sendResponse(200, ['success' => true, 'message' => 'Bayesian data updated successfully for all records.']);
} catch (PDOException $e) {
    sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
