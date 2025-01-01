<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

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

    // Build the SQL query
    $sql = "
        SELECT id, name, picture, city, mobile 
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

    // Execute query and fetch results
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process results to convert picture from BLOB to Base64
    foreach ($results as &$result) {
        if (!empty($result['picture'])) {
            $result['picture'] = 'data:image/jpeg;base64,' . base64_encode($result['picture']);
        } else {
            $result['picture'] = '/pictures/userjpg.jpg'; // Default picture
        }
    }
    unset($result);

    // Return the results as JSON
    echo json_encode(['results' => $results]);

} catch (Exception $e) {
    // Handle errors and return a JSON response
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit;
}
?>
