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
                SELECT id, name, email, mobile, created_at, updated_at, status
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
            $status = $data['status'] ?? null;

            if (!$userId || !$name || !$email || !$mobile) {
                echo json_encode(['error' => 'Invalid input for modification']);
                exit;
            }

            $passwordField = '';
            $params = [
                ':name' => $name,
                ':email' => $email,
                ':mobile' => $mobile,
                ':status' => $status,
                ':user_id' => $userId,
            ];

            if ($password) {
                $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
                $passwordField = ", password = :password";
                $params[':password'] = $hashedPassword;
            }

            $conn->beginTransaction();

            try {
                $stmt = $conn->prepare("
                    UPDATE users
                    SET name = :name, email = :email, mobile = :mobile $passwordField, updated_at = NOW(), status = :status
                    WHERE id = :user_id
                ");
                $stmt->execute($params);

                if ($status == 0) {
                    $stmtDeactivateRequests = $conn->prepare("
                        UPDATE requests
                        SET
                            status = 0,
                            closure_reason = 'activation'
                        WHERE
                            user_id = :user_id
                            AND status = 1
                    ");
                    $stmtDeactivateRequests->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmtDeactivateRequests->execute();

                    $stmtUpdateApplications = $conn->prepare("
                        UPDATE applications a
                        JOIN requests r ON a.request_id = r.id
                        SET
                            a.status = 0
                        WHERE
                            r.user_id = :user_id
                            AND r.closure_reason = 'activation'
                            AND r.status = 0
                    ");
                    $stmtUpdateApplications->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmtUpdateApplications->execute();
                }

                if ($status == 1) {
                    $stmtReactivateRequests = $conn->prepare("
                        UPDATE requests
                        SET
                            status = 1,
                            closure_reason = NULL
                        WHERE
                            user_id = :user_id
                            AND closure_reason = 'activation'
                    ");
                    $stmtReactivateRequests->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $stmtReactivateRequests->execute();
                }

                $conn->commit();

                echo $stmt->rowCount() > 0
                    ? json_encode(['success' => true, 'message' => 'User modified successfully'])
                    : json_encode(['error' => 'No changes detected or modification failed']);

            } catch (PDOException $e) {
                $conn->rollBack();
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
                exit;
            }
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
