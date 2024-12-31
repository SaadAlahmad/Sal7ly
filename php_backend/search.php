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

    // Read the JSON payload from POST request
    $inputData = json_decode(file_get_contents('php://input'), true);

    $category = $inputData['category'] ?? '';
    $name = $inputData['name'] ?? '';
    $city = $inputData['city'] ?? '';

    // Validate required fields
    if (empty($category)) {
        echo json_encode(['error' => 'Category is required']);
        exit;
    }

    // Prepare dynamic SQL query
    $sql = "
        SELECT id, name, picture, city, mobile, bio, worksamples 
        FROM craftspeople 
        WHERE category = :category
    ";

    if (!empty($name)) {
        $sql .= " AND name LIKE :name";
    }

    if (!empty($city)) {
        $sql .= " AND city = :city";
    }

    $stmt = $conn->prepare($sql);

    // Bind parameters
    $stmt->bindParam(':category', $category);

    if (!empty($name)) {
        $nameParam = '%' . $name . '%';
        $stmt->bindParam(':name', $nameParam);
    }

    if (!empty($city)) {
        $stmt->bindParam(':city', $city);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process results to update picture paths and ensure all fields are included
    foreach ($results as &$result) {
        if (!empty($result['picture'])) {
            $result['picture'] = $baseUrl . str_replace('./', '/', $result['picture']);
        }
        $result['bio'] = $result['bio'] ?? '';
        $result['worksamples'] = $result['worksamples'] ?? [];
    }
    unset($result);

    // Send the results as JSON
    echo json_encode(['results' => $results]);

} catch (Exception $e) {
    // Handle errors and send a response
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>
