<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

try {
    $db = new DbConnect();
    $conn = $db->connect();

    $category = isset($_GET['category']) ? htmlspecialchars($_GET['category']) : '';

    if (empty($category)) {
        echo json_encode(['error' => 'Category is required']);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT c.id, c.name, c.picture, c.city, c.mobile, COALESCE(b.bayesian, 0) AS bayesian
        FROM craftspeople c
        LEFT JOIN bayesian b ON c.id = b.craftsman_id
        WHERE c.category = :category AND c.verified = 1
        ORDER BY b.bayesian DESC, b.bayesian IS NULL
    ");
    $stmt->bindParam(':category', $category);
    $stmt->execute();

    $professionals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($professionals as &$professional) {
        if (!empty($professional['picture'])) {
            $professional['picture'] = 'data:image/jpeg;base64,' . base64_encode($professional['picture']);
        } else {
            $professional['picture'] = '/pictures/userjpg.jpg';
        }
    }
    unset($professional);

    echo json_encode(['professionals' => $professionals]);

} catch (Exception $e) {
    error_log("Error in category.php: " . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching professionals.']);
    exit;
}
?>
