<?php
header("Content-Type: application/json");

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
$action = $data['action'] ?? 'fetch';

try {
    switch ($action) {
      case 'fetch':
          $stmt = $conn->prepare("
              SELECT r.id, r.rating, r.review_text, r.created_at, r.status, 
                      p.request_id, u.name AS user_name
              FROM reviews r
              JOIN projects p ON r.project_id = p.id
              JOIN users u ON p.user_id = u.id
              ORDER BY r.created_at DESC
          ");
          $stmt->execute();
          $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

          echo json_encode(['success' => true, 'reviews' => $reviews]);
          break;
          
      case 'modify':
        $reviewId = $data['id'] ?? null;
        $rating = $data['rating'] ?? null;
        $reviewText = $data['review_text'] ?? null;
        $status = $data['status'] ?? 1;
    
        if (!$reviewId || !$rating || $rating < 1 || $rating > 5) {
            echo json_encode(['error' => 'Invalid input for modification']);
            exit;
        }
        try {
            $stmt = $conn->prepare("
                UPDATE reviews
                SET rating = :rating, 
                    review_text = :review_text, 
                    status = :status
                WHERE id = :id
            ");
    
            $stmt->bindParam(':rating', $rating, PDO::PARAM_INT);
            $stmt->bindParam(':review_text', $reviewText);
            $stmt->bindParam(':status', $status, PDO::PARAM_INT);
            $stmt->bindParam(':id', $reviewId, PDO::PARAM_INT);
            if ($stmt->execute()) {
                require_once 'bayesianupdater.php';
                $bayesianSuccess = updateBayesianData($conn);
    
                if ($bayesianSuccess) {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Review updated & Bayesian scores recalculated'
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'warning' => 'Review updated but Bayesian recalculation failed'
                    ]);
                }
            } else {
                echo json_encode(['error' => 'Failed to update review']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
      case 'delete':
          $reviewId = $data['id'] ?? null;
      
          if (!$reviewId) {
              echo json_encode(['error' => 'Invalid review ID']);
              exit;
          }
          try {
              $stmt = $conn->prepare("DELETE FROM reviews WHERE id = :id");
              $stmt->bindParam(':id', $reviewId, PDO::PARAM_INT);
      
              if ($stmt->execute()) {
                  require_once 'BayesianUpdater.php';
                  $bayesianSuccess = updateBayesianData($conn);
      
                  if ($bayesianSuccess) {
                      echo json_encode([
                          'success' => true, 
                          'message' => 'Review deleted & Bayesian scores recalculated'
                      ]);
                  } else {
                      echo json_encode([
                          'success' => true,
                          'warning' => 'Review deleted but Bayesian recalculation failed'
                      ]);
                  }
              } else {
                  echo json_encode(['error' => 'Failed to delete review']);
              }
          } catch (PDOException $e) {
              echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
          }
          break;
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
?>