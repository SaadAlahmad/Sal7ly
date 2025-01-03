<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

try {
    // Initialize database connection
    $db = new DbConnect();
    $conn = $db->connect();

    // Get the professional ID from the request
    $id = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';

    if (empty($id)) {
        echo json_encode(['error' => 'Professional ID is required']);
        exit;
    }

    // Fetch the professional's details if verified
    $stmt = $conn->prepare("
        SELECT id, name, picture, city, mobile, bio 
        FROM craftspeople 
        WHERE id = :id AND verified = 1
    ");
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $professional = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($professional) {
        // Process the picture (convert BLOB to base64 if needed)
        if (!empty($professional['picture'])) {
            $professional['picture'] = 'data:image/jpeg;base64,' . base64_encode($professional['picture']);
        } else {
            $professional['picture'] = '/pictures/userjpg.jpg'; // Default picture
        }

        // Add worksamples
        $worksamplesStmt = $conn->prepare("
            SELECT id, file_type, file_data 
            FROM worksamples 
            WHERE craftsperson_id = :craftsperson_id
        ");
        $worksamplesStmt->bindParam(':craftsperson_id', $id);
        $worksamplesStmt->execute();
        $worksamples = $worksamplesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Process worksamples (convert BLOBs to base64 strings)
        $professional['worksamples'] = array_map(function ($sample) {
            return [
                'id' => $sample['id'],
                'type' => $sample['file_type'],
                'data' => 'data:' . $sample['file_type'] . ';base64,' . base64_encode($sample['file_data']),
            ];
        }, $worksamples);
    } else {
        echo json_encode(['error' => 'Craftsperson not found or not verified']);
        exit;
    }

    // Return JSON response
    echo json_encode(['professional' => $professional]);

} catch (Exception $e) {
    error_log("Error in profile.php: " . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching the profile.']);
    exit;
}
?>
