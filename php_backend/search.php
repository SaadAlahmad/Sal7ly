<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

try {
    $db = new DbConnect();
    $conn = $db->connect();

    $inputData = json_decode(file_get_contents('php://input'), true);

    $category = $inputData['category'] ?? '';
    $name = $inputData['name'] ?? '';
    $city = $inputData['city'] ?? '';

    if (empty($category)) {
        echo json_encode(['error' => 'Category is required']);
        exit;
    }

    $sql = "
        SELECT c.id, c.name, c.picture, c.city, c.mobile, COALESCE(b.bayesian, 0) AS bayesian
        FROM craftspeople c
        LEFT JOIN bayesian b ON c.id = b.craftsman_id
        WHERE c.category = :category AND c.verified = 1
    ";

    if (!empty($name)) {
        $sql .= " AND c.name LIKE :name";
    }

    if (!empty($city)) {
        $sql .= " AND c.city = :city";
    }

    $sql .= " ORDER BY b.bayesian DESC, b.bayesian IS NULL";
    $stmt = $conn->prepare($sql);
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

    foreach ($results as &$result) {
        if (!empty($result['picture'])) {
            $result['picture'] = 'data:image/jpeg;base64,' . base64_encode($result['picture']);
        } else {
            $result['picture'] = '/pictures/userjpg.jpg';
        }
    }
    unset($result);
    echo json_encode(['results' => $results]);

} catch (Exception $e) {
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit;
}
?>
