<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

$baseUrl = "http://localhost/test-project/test-project/php_backend"; // Adjust to your base URL

try {
    // Initialize database connection
    $db = new DbConnect();
    $conn = $db->connect();

    // Get the professional ID from the request
    $id = isset($_GET['id']) ? $_GET['id'] : '';

    if (empty($id)) {
        echo json_encode(['error' => 'Professional ID is required']);
        exit;
    }

    // Fetch the professional's details
    $stmt = $conn->prepare("
        SELECT id, name, picture, city, mobile, bio, worksamples 
        FROM craftspeople 
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $professional = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($professional) {
        // Process the data
        if (!empty($professional['picture'])) {
            $professional['picture'] = $baseUrl . str_replace('./', '/', $professional['picture']);
        }
        $professional['bio'] = $professional['bio'] ?? 'No bio available';
        $professional['worksamples'] = $professional['worksamples'] ? explode(',', $professional['worksamples']) : [];
    } else {
        echo json_encode(['error' => 'craftspeople not found']);
        exit;
    }

    // Return JSON response
    echo json_encode(['professional' => $professional]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>
