<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'DbConnect.php';

$response = ['status' => false];

try {
    $db = new DbConnect();
    $conn = $db->connect();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Only POST is allowed.');
    }

    // Validate required fields
    $requiredFields = ['name', 'email', 'mobile', 'city', 'category', 'bio', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("The field '$field' is required.");
        }
    }

    // Extract form data
    $name = htmlspecialchars($_POST['name']);
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $mobile = htmlspecialchars($_POST['mobile']);
    $city = htmlspecialchars($_POST['city']);
    $category = htmlspecialchars($_POST['category']);
    $bio = htmlspecialchars($_POST['bio']);
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    if (!$email) {
        throw new Exception('Invalid email address.');
    }

    // Handle profile picture upload
    $picture = null;
    if (isset($_FILES['picture']) && $_FILES['picture']['error'] === UPLOAD_ERR_OK) {
        $picture = file_get_contents($_FILES['picture']['tmp_name']);
    }

    // Insert user data into the database
    $stmt = $conn->prepare("
        INSERT INTO craftspeople (name, email, mobile, city, category, bio, picture, password)
        VALUES (:name, :email, :mobile, :city, :category, :bio, :picture, :password)
    ");
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':mobile', $mobile, PDO::PARAM_INT);
    $stmt->bindParam(':city', $city);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':bio', $bio);
    $stmt->bindParam(':picture', $picture, PDO::PARAM_LOB);
    $stmt->bindParam(':password', $password);

    $stmt->execute();
    $userId = $conn->lastInsertId();

    // Handle work samples upload
    $workSamples = [];
    if (isset($_FILES['workSamples']['tmp_name']) && is_array($_FILES['workSamples']['tmp_name'])) {
        foreach ($_FILES['workSamples']['tmp_name'] as $key => $tmpName) {
            if (is_uploaded_file($tmpName)) {
                $fileContent = file_get_contents($tmpName);
                $fileType = $_FILES['workSamples']['type'][$key];

                $workStmt = $conn->prepare("
                    INSERT INTO worksamples (craftsperson_id, file_data, file_type)
                    VALUES (:craftsperson_id, :file_data, :file_type)
                ");
                $workStmt->bindParam(':craftsperson_id', $userId);
                $workStmt->bindParam(':file_data', $fileContent, PDO::PARAM_LOB);
                $workStmt->bindParam(':file_type', $fileType);
                $workStmt->execute();

                $workSamples[] = $conn->lastInsertId();
            }
        }
    }

    $response['status'] = true;
    $response['message'] = 'User registered successfully.';
    $response['userId'] = $userId;
    $response['workSamples'] = $workSamples;
} catch (Exception $e) {
    error_log($e->getMessage()); // Log the error to server logs
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit;
?>
