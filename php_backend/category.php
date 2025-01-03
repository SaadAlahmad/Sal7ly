<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

try {
    $db = new DbConnect();
    $conn = $db->connect();

    // Get the category from the request
    $category = isset($_GET['category']) ? htmlspecialchars($_GET['category']) : '';

    if (empty($category)) {
        echo json_encode(['error' => 'Category is required']);
        exit;
    }

    // Fetch professionals for the given category
    $stmt = $conn->prepare("
        SELECT id, name, picture, city, mobile 
        FROM craftspeople 
        WHERE category = :category AND verified = 1
    ");
    $stmt->bindParam(':category', $category);
    $stmt->execute();

    $professionals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process the results
    foreach ($professionals as &$professional) {
        // Base64-encode picture if it exists
        if (!empty($professional['picture'])) {
            $professional['picture'] = 'data:image/jpeg;base64,' . base64_encode($professional['picture']);
        } else {
            $professional['picture'] = '/pictures/userjpg.jpg'; // Default picture
        }
    }
    unset($professional);

    // Return JSON response
    echo json_encode(['professionals' => $professionals]);

} catch (Exception $e) {
    error_log("Error in category.php: " . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching professionals.']);
    exit;
}
?>
