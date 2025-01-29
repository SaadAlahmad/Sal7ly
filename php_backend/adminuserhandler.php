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
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
} else {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'DbConnect.php';
$db = new DbConnect();
$conn = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['user_id'] ?? null;
$action = $data['action'] ?? 'fetch';

try {
    switch ($action) {
        case 'fetch':
            $stmt = $conn->prepare("
                SELECT id, name, email, mobile, password, created_at, updated_at 
                FROM users
                WHERE id > 100
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'users' => $users]);
            break;

            case 'modify':
              $userId = $data['id'] ?? null;
              $name = $data['name'] ?? null;
              $email = $data['email'] ?? null;
              $mobile = $data['mobile'] ?? null;
              $password = $data['password'] ?? null;
          
              if (!$userId || !$name || !$email || !$mobile) {
                  echo json_encode(['error' => 'Invalid input for modification']);
                  exit;
              }
          
              $passwordField = '';
              $params = [
                  ':name' => $name,
                  ':email' => $email,
                  ':mobile' => $mobile,
                  ':user_id' => $userId,
              ];
          
              if ($password) {
                  $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
                  $passwordField = ", password = :password";
                  $params[':password'] = $hashedPassword;
              }
          
              $stmt = $conn->prepare("
                  UPDATE users
                  SET name = :name, email = :email, mobile = :mobile $passwordField, updated_at = NOW()
                  WHERE id = :user_id
              ");
              $stmt->execute($params);
          
              echo $stmt->rowCount() > 0
                  ? json_encode(['success' => true, 'message' => 'User modified successfully'])
                  : json_encode(['error' => 'No changes detected or modification failed']);
              break;
                    
        case 'delete':
            $userId = $data['user_id'] ?? null;

            if (!$userId) {
                echo json_encode(['error' => 'Invalid input for deletion']);
                exit;
            }

            $stmt = $conn->prepare("DELETE FROM users WHERE id = :user_id");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                echo json_encode(['error' => 'Failed to delete user']);
            }
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
?>
