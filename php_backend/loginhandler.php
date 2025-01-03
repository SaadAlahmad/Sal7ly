<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

require_once 'DbConnect.php';

$response = ['status' => false];

try {
    $db = new DbConnect();
    $conn = $db->connect();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Only POST is allowed.');
    }

    // Decode the JSON input
    $input = json_decode(file_get_contents("php://input"), true);

    $userType = $input['userType'] ?? null;
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;

    if (!$userType || !$email || !$password) {
        throw new Exception('Missing required fields: userType, email, or password.');
    }

    // Define table and fields based on user type
    $table = '';
    switch ($userType) {
        case 'user':
            $table = 'users';
            break;
        case 'craftsman':
            $table = 'craftspeople';
            break;
        default:
            throw new Exception('Invalid user type. Must be "user" or "craftsman".');
    }

    // Fetch the user's data from the database
    $stmt = $conn->prepare("SELECT * FROM $table WHERE email = :email LIMIT 1");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        throw new Exception('Invalid email or password.');
    }

    // Verify the password
    if (!password_verify($password, $userData['password'])) {
        throw new Exception('Invalid email or password.');
    }

    // Prepare the success response
    $response['status'] = true;
    $response['message'] = 'Login successful.';
    $response['data'] = [
        'id' => $userData['id'],
        'name' => $userData['name'],
        'email' => $userData['email'],
    ];

    // Add additional fields for craftsman
    if ($userType === 'craftsman') {
        $response['data']['mobile'] = $userData['mobile'];
        $response['data']['city'] = $userData['city'];
        $response['data']['category'] = $userData['category'];
        $response['data']['bio'] = $userData['bio'];
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit;
