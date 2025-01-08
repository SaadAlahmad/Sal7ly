<?php
session_start(); // Start the session
header("Content-Type: application/json");
$allowedOrigins = ['http://localhost:5173']; // Add your allowed origins here
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
} else {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}


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

    // Store user session data
  
    if ($userType === 'craftsman') {
        $_SESSION['user'] = [
            'id' => $userData['id'],
            'name' => $userData['name'],
            'email' => $userData['email'],
            'category' => $userData['category'],
            'city' => $userData['city'],
            'userType' => $userType,
        ];
        } else {
        $_SESSION['user'] = [
            'id' => $userData['id'],
            'name' => $userData['name'],
            'email' => $userData['email'],
            'userType' => $userType,
        ];
      
    }

    // Debugging log
    error_log('Session Data: ' . print_r($_SESSION, true));

    
    } catch (Exception $e) {
        error_log($e->getMessage());
        $response['error'] = $e->getMessage();
    }

    echo json_encode($response);
    exit;
