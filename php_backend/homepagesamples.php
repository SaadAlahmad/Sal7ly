<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require_once 'DbConnect.php';

try {
    $db = new DbConnect();
    $conn = $db->connect();

    $stmt = $conn->prepare("
        SELECT 
            ws.id AS worksample_id,
            ws.craftsperson_id,
            ws.file_data,
            ws.file_type,
            c.name AS craftsperson_name
        FROM bayesian b
        INNER JOIN worksamples ws ON b.craftsman_id = ws.craftsperson_id
        INNER JOIN craftspeople c ON c.id = ws.craftsperson_id
        WHERE b.bayesian IS NOT NULL
        ORDER BY b.bayesian DESC
        LIMIT 5
    ");
    $stmt->execute();

    $workSamples = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($workSamples)) {
        $processedSamples = array_map(function ($sample) {
            return [
                'id' => $sample['worksample_id'],
                'craftsperson_id' => $sample['craftsperson_id'],
                'file_data' => base64_encode($sample['file_data']),
                'file_type' => $sample['file_type'],
                'craftsperson_name' => $sample['craftsperson_name'],
            ];
        }, $workSamples);

        echo json_encode(['workSamples' => $processedSamples]);
    } else {
        echo json_encode(['workSamples' => []]);
    }
} catch (Exception $e) {
    error_log("Error in getTopWorkSamples.php: " . $e->getMessage());
    echo json_encode(['error' => 'An error occurred while fetching work samples.']);
    exit;
}
?>
