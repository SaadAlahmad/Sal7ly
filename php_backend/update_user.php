<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'DbConnect.php';
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->id) || empty($data->id)) {
        echo json_encode(["error" => "User ID is required."]);
        exit;
    }

    $userId = $data->id;
    $name = $data->name;
    $email = $data->email;
    $mobile = $data->mobile;
    $currentPassword = $data->currentPassword;
    $newPassword = $data->newPassword;

    $db = new DbConnect();
    $conn = $db->connect();

    // 🔹 Check if user exists in `users` or `craftspeople`
    $query = "SELECT id, password FROM users WHERE id = :id 
              UNION 
              SELECT id, password FROM craftspeople WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["error" => "User not found."]);
        exit;
    }

    // 🔹 Verify current password before updating
    if (!empty($newPassword)) {
        if (!password_verify($currentPassword, $user['password'])) {
            echo json_encode(["error" => "Current password is incorrect."]);
            exit;
        }

        // 🔹 Hash new password before updating
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    } else {
        $hashedPassword = $user['password']; // Keep old password if not changing
    }

    // 🔹 Determine the correct table (`users` or `craftspeople`)
    $table = ($userId < 9000000000) ? "users" : "craftspeople"; 

    // 🔹 Update user profile
    $updateQuery = "UPDATE $table SET name = :name, email = :email, mobile = :mobile, password = :password WHERE id = :id";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bindParam(':name', $name);
    $updateStmt->bindParam(':email', $email);
    $updateStmt->bindParam(':mobile', $mobile);
    $updateStmt->bindParam(':password', $hashedPassword);
    $updateStmt->bindParam(':id', $userId);
    
    if ($updateStmt->execute()) {
        echo json_encode(["success" => "Profile updated successfully!"]);
    } else {
        echo json_encode(["error" => "Failed to update profile."]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>
