<?php
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

try {
    // Initialize database connection
    $db = new DbConnect();
    $conn = $db->connect();

    // Read the JSON payload from POST request
    $inputData = json_decode(file_get_contents('php://input'), true);

    // Determine the action: insert, update, or delete
    $action = $inputData['action'] ?? '';
    $requestId = $inputData['id'] ?? null;
    $userId = $inputData['user_id'] ?? null;
    $service = $inputData['service'] ?? '';
    $details = $inputData['details'] ?? '';
    $city = $inputData['city'] ?? '';
    $location = $inputData['location'] ?? '';

    if (empty($action)) {
        echo json_encode(['error' => 'Action is required']);
        exit;
    }

    switch ($action) {
        case 'fetch':
            if (empty($userId)) {
                echo json_encode(['error' => 'User ID is required']);
                exit;
            }
            $sql = "SELECT * FROM requests WHERE user_id = :user_id AND status = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'requests' => $requests]);
            break;

        case 'insert':
            // Validate required fields
            if (empty($userId) || empty($service) || empty($details) || empty($city) || empty($location)) {
                echo json_encode(['error' => 'All fields are required for insertion']);
                exit;
            }
        
            // Function to generate random request ID with the format 55xxxxxxxx
            function generateUniqueRequestId($conn) {
                do {
                    $randomId = '55' . rand(10000000, 99999999); // Generate a random 8-digit number with '55'
                    
                    // Check if the generated ID already exists
                    $sql = "SELECT COUNT(*) FROM requests WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':id', $randomId);
                    $stmt->execute();
                    $count = $stmt->fetchColumn(); // Get the count of rows with the same ID
                } while ($count > 0); // If the ID exists, generate a new one
                
                return $randomId; // Return the unique request ID
            }
        
            // Generate unique request ID
            $uniqueRequestId = generateUniqueRequestId($conn);
        
            // Insert query with the new unique request ID
            $sql = "INSERT INTO requests (id, user_id, service, details, city, location, created_at, updated_at, status) 
                    VALUES (:id, :user_id, :service, :details, :city, :location, NOW(), NOW(), 1)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $uniqueRequestId); // Bind the unique request ID
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':service', $service);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':location', $location);
            $stmt->execute();
        
            echo json_encode(['success' => 'Request inserted successfully']);
            break;
        
        case 'update':
            // Validate required fields
            if (empty($requestId) || empty($userId) || empty($service) || empty($details) || empty($city) || empty($location)) {
                echo json_encode(['error' => 'All fields are required for updating']);
                exit;
            }

            // Update query
            $sql = "UPDATE requests SET service = :service, details = :details, city = :city, location = :location, updated_at = NOW() 
                    WHERE id = :id AND user_id = :user_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $requestId);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':service', $service);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':location', $location);
            $stmt->execute();

            echo json_encode(['success' => 'Request updated successfully']);
            break;

        case 'delete':
            // Validate required fields
            if (empty($requestId) || empty($userId)) {
                echo json_encode(['error' => 'ID and user ID are required for deletion']);
                exit;
            }
        
            // Update query to change status from 1 to 0 (mark as inactive)
            $sql = "UPDATE requests SET status = 0 WHERE id = :id AND user_id = :user_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $requestId);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
        
            // Check if any row was affected
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => 'Request status updated successfully']);
            } else {
                echo json_encode(['error' => 'Request not found or already updated']);
            }
            break;
        
        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
            
    }

} catch (Exception $e) {
    // Handle errors and return a JSON response
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit;
}
?>
