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
$id = $data['id'] ?? null;
$action = $data['action'] ?? 'fetch';

try {
  switch ($action) {
    case 'fetch':
      $stmt = $conn->prepare("
        SELECT id, name, email, mobile, city, category, bio, verified, created_at
        FROM craftspeople
        ORDER BY created_at DESC
      ");
      $stmt->execute();
      $craftspeople = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode(['success' => true, 'craftspeople' => $craftspeople]);
      break;

    case 'modify':
      $name = $data['name'] ?? null;
      $email = $data['email'] ?? null;
      $mobile = $data['mobile'] ?? null;
      $city = $data['city'] ?? null;
      $category = $data['category'] ?? null;
      $password = $data['password'] ?? null;
      $verified = $data['verified'] ?? null;

      if (!$id || !$name || !$email || !$mobile || !$city || !$category) {
          echo json_encode(['error' => 'Invalid input for modification']);
          exit;
      }

      $passwordField = '';
      $params = [
          ':name' => $name,
          ':email' => $email,
          ':mobile' => $mobile,
          ':city' => $city,
          ':category' => $category,
          ':verified' => $verified,
          ':id' => $id,
      ];

      if ($password) {
          $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
          $passwordField = ", password = :password";
          $params[':password'] = $hashedPassword;
      }

      $conn->beginTransaction();

      try {
        $stmt = $conn->prepare("
          UPDATE craftspeople
          SET name = :name, email = :email, mobile = :mobile, city = :city,
            category = :category, verified = :verified $passwordField
          WHERE id = :id
        ");
        $stmt->execute($params);

        if ($verified == 0) {
          $stmtUpdateApps = $conn->prepare("
            UPDATE applications
            SET
              status = 0,
              closure_reason = 'activation'
            WHERE
              craftsman_id = :id
              AND status = 1
          ");
          $stmtUpdateApps->bindParam(':id', $id, PDO::PARAM_INT);
          $stmtUpdateApps->execute();
        }

        $conn->commit();

        echo $stmt->rowCount() > 0
          ? json_encode(['success' => true, 'message' => 'Craftsperson modified successfully'])
          : json_encode(['error' => 'No changes detected or modification failed']);

      } catch (PDOException $e) {
          $conn->rollBack();
          echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
          exit;
      }
      break;

    case 'delete':
      if (!$id) {
          echo json_encode(['error' => 'Invalid input for deletion']);
          exit;
      }
      try {
          $conn->beginTransaction();

          $stmt = $conn->prepare("DELETE FROM worksamples WHERE craftsperson_id = :id");
          $stmt->bindParam(':id', $id, PDO::PARAM_INT);
          $stmt->execute();

          $stmt = $conn->prepare("DELETE FROM craftspeople WHERE id = :id");
          $stmt->bindParam(':id', $id, PDO::PARAM_INT);
          $stmt->execute();

          $conn->commit();

          echo json_encode([
              'success' => true,
              'message' => 'Craftsperson and associated worksamples deleted successfully'
          ]);
      } catch (PDOException $e) {
          $conn->rollBack();
          echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
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
