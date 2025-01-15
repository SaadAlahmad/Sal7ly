<?php
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

require_once 'DbConnect.php';

try {
    // Initialize database connection
    $db = new DbConnect();
    $conn = $db->connect();

    // Decode the JSON payload
    $input = json_decode(file_get_contents("php://input"), true);

    // Validate input data
    $category = isset($input['category']) ? trim(htmlspecialchars($input['category'])) : '';
    $city = isset($input['city']) ? trim(htmlspecialchars($input['city'])) : '';

    if (empty($category) || empty($city)) {
        echo json_encode(['error' => 'Category and city are required']);
        exit;
    }

    error_log("Category: $category, City: $city");

    // Fetch requests matching the category and city
    $stmt = $conn->prepare("
    SELECT r.id, r.user_id, r.details, r.city, r.location, r.created_at, u.name,
           COUNT(a.id) AS applications_count
    FROM requests r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN applications a ON r.id = a.request_id AND a.status = 1
    WHERE r.service = :category AND r.city = :city AND r.status = 1
    GROUP BY r.id
    ");
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':city', $city);
    $stmt->execute();

    if ($stmt->errorCode() != '00000') {
        error_log("SQL Error: " . implode(", ", $stmt->errorInfo()));
    }

    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($requests) {
        foreach ($requests as &$request) {
            $request['created_at'] = date("Y-m-d H:i:s", strtotime($request['created_at']));
        }
    } else {
        echo json_encode(['message' => 'No matching requests found']);
        exit;
    }

    echo json_encode(['requests' => $requests]);

} catch (Exception $e) {
    error_log("Error in sentrequestshandler.php: " . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching requests.']);
    exit;
}
?>
