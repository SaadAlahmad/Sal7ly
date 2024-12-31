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

    // Get the category from the request
    $category = isset($_GET['category']) ? $_GET['category'] : '';

    if (empty($category)) {
        echo json_encode(['error' => 'Category is required']);
        exit;
    }

    // Fetch professionals for the given category
    $stmt = $conn->prepare("
        SELECT id, name, picture, city, mobile 
        FROM craftspeople 
        WHERE category = :category
    ");
    $stmt->bindParam(':category', $category);
    $stmt->execute();

    $professionals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process the results
    foreach ($professionals as &$professional) {
        if (!empty($professional['picture'])) {
            $professional['picture'] = $baseUrl . str_replace('./', '/', $professional['picture']);
        }
        $professional['bio'] = $professional['bio'] ?? '';
        $professional['worksamples'] = $professional['worksamples'] ?? [];
    }
    unset($professional);

    // Return JSON response
    echo json_encode(['professionals' => $professionals]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>
