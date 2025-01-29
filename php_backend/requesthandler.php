<?php
header("Content-Type: application/json");

/* 
 FOR RUNING ON PORT 5173 AND DATABASE ON LOCALHOST XAMPP
 CTRL + / AFTER NPM RUN BUILD IF EVERYTHING IS RUNNING ON THE SAME PORT 
*/

$allowedOrigins = ['http://localhost:5173'];
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
    $db = new DbConnect();
    $conn = $db->connect();

    $inputData = json_decode(file_get_contents('php://input'), true);

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
            $sql = "SELECT r.*, 
            (SELECT COUNT(*) FROM applications a WHERE a.request_id = r.id AND a.status = 1) AS applicationsCount
            FROM requests r 
            WHERE r.user_id = :user_id AND r.status = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'requests' => $requests]);
    
            break;

        case 'insert':
            if (empty($userId) || empty($service) || empty($details) || empty($city) || empty($location)) {
                echo json_encode(['error' => 'All fields are required for insertion']);
                exit;
            }
        
            function generateUniqueRequestId($conn) {
                do {
                    $randomId = '55' . rand(10000000, 99999999);
                    
                    $sql = "SELECT COUNT(*) FROM requests WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':id', $randomId);
                    $stmt->execute();
                    $count = $stmt->fetchColumn();
                } while ($count > 0);
                
                return $randomId;
            }
        
            $uniqueRequestId = generateUniqueRequestId($conn);
        
            $sql = "INSERT INTO requests (id, user_id, service, details, city, location, created_at, updated_at, status) 
                    VALUES (:id, :user_id, :service, :details, :city, :location, NOW(), NOW(), 1)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $uniqueRequestId);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':service', $service);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':location', $location);
            $stmt->execute();
        
            echo json_encode(['success' => 'Request inserted successfully']);
            break;
        
        case 'update':
            if (empty($requestId) || empty($userId) || empty($service) || empty($details) || empty($city) || empty($location)) {
                echo json_encode(['error' => 'All fields are required for updating']);
                exit;
            }

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
                if (empty($requestId) || empty($userId)) {
                    echo json_encode(['error' => 'ID and user ID are required for deletion']);
                    exit;
                }
            
                $conn->beginTransaction();
                
                try {
                    $sql = "UPDATE requests SET status = 0 WHERE id = :id AND user_id = :user_id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':id', $requestId);
                    $stmt->bindParam(':user_id', $userId);
                    $stmt->execute();
            
                    if ($stmt->rowCount() > 0) {
                        $sql = "UPDATE applications SET status = 0 WHERE request_id = :request_id";
                        $stmt = $conn->prepare($sql);
                        $stmt->bindParam(':request_id', $requestId);
                        $stmt->execute();
            
                        $conn->commit();
                        echo json_encode(['success' => 'Request and related applications status updated successfully']);
                    } else {
                        $conn->rollBack();
                        echo json_encode(['error' => 'Request not found or already updated']);
                    }
                } catch (Exception $e) {
                    $conn->rollBack();
                    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
                }
                break;
                    
        case 'fetchApplications':
            $requestId = $inputData['request_id'] ?? null;
            if (empty($requestId)) {
                echo json_encode(['error' => 'Request ID is required']);
                exit;
            }
        
            $sql = "SELECT a.id, a.message, a.created_at, c.name AS craftsman_name, c.id AS craftsman_id, c.mobile AS craftsman_mobile
                    FROM applications a 
                    JOIN craftspeople c ON a.craftsman_id = c.id 
                    WHERE a.request_id = :request_id AND a.status = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':request_id', $requestId);
            $stmt->execute();
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
            echo json_encode(['success' => true, 'applications' => $applications]);
            break;
            

        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
            
    }

} catch (Exception $e) {
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit;
}
?>
