<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Include database connection
include 'DbConnect.php';
header('Content-Type: application/json');

try {
    // Get user ID from request
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode(["error" => "User ID is required."]);
        exit;
    }

    $userId = $_GET['id'];
    $db = new DbConnect();
    $conn = $db->connect();

    // Check both 'users' and 'craftspeople' tables
    $query = "SELECT id, name, email, mobile FROM users WHERE id = :id
              UNION 
              SELECT id, name, email, mobile FROM craftspeople WHERE id = :id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["error" => "User not found."]);
    } else {
        echo json_encode($user);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>
