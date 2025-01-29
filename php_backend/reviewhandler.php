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
    header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
} else {
    http_response_code(403);
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'DbConnect.php';
$db = new DbConnect();
$conn = $db->connect();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

if ($method === 'GET') {
  $projectId = $_GET['projectId'] ?? null;

  if (!$projectId) {
      sendResponse(400, ['error' => 'Invalid input. Project ID is required.']);
  }

  try {
      $query = "
          SELECT id, rating, review_text 
          FROM reviews 
          WHERE project_id = :projectId AND status = 1
          LIMIT 1
      ";
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
      $stmt->execute();
      $review = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($review) {
          sendResponse(200, ['exists' => true, 'review' => $review]);
      } else {
          sendResponse(200, ['exists' => false]);
      }
  } catch (PDOException $e) {
      sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
  } finally {
      $conn = null;
  }
}

if ($method === 'POST') {
    $projectId = $data['projectId'] ?? null;
    $rating = $data['rating'] ?? null;
    $reviewText = $data['reviewText'] ?? null;

    if (!$projectId || !$rating) {
        sendResponse(400, ['error' => 'Invalid input. Project ID and rating are required.']);
    }

    try {
        $checkQuery = "
            SELECT id 
            FROM reviews 
            WHERE project_id = :projectId AND status = 1
            LIMIT 1
        ";
        $stmt = $conn->prepare($checkQuery);
        $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
        $stmt->execute();
        $existingReview = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingReview) {
            $updateQuery = "
                UPDATE reviews 
                SET rating = :rating, review_text = :reviewText 
                WHERE id = :reviewId
            ";
            $updateStmt = $conn->prepare($updateQuery);
            $updateStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
            $updateStmt->bindParam(':reviewText', $reviewText, PDO::PARAM_STR);
            $updateStmt->bindParam(':reviewId', $existingReview['id'], PDO::PARAM_INT);
            $updateStmt->execute();

            sendResponse(200, ['success' => true, 'message' => 'Review updated successfully']);
        } else {
            $insertQuery = "
                INSERT INTO reviews (project_id, rating, review_text) 
                VALUES (:projectId, :rating, :reviewText)
            ";
            $insertStmt = $conn->prepare($insertQuery);
            $insertStmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $insertStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
            $insertStmt->bindParam(':reviewText', $reviewText, PDO::PARAM_STR);
            $insertStmt->execute();

            sendResponse(201, ['success' => true, 'message' => 'Review submitted successfully']);
        }
    } catch (PDOException $e) {
        sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
    } finally {
        $conn = null;
    }
}

if ($method === 'PUT') {
    $projectId = $data['projectId'] ?? null;
    $rating = $data['rating'] ?? null;
    $reviewText = $data['reviewText'] ?? null;

    if (!$projectId || !$rating) {
        sendResponse(400, ['error' => 'Invalid input. Project ID and rating are required.']);
    }

    try {
        $updateQuery = "
            UPDATE reviews 
            SET rating = :rating, review_text = :reviewText 
            WHERE project_id = :projectId AND status = 1
        ";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
        $updateStmt->bindParam(':reviewText', $reviewText, PDO::PARAM_STR);
        $updateStmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
        $updateStmt->execute();

        sendResponse(200, ['success' => true, 'message' => 'Review updated successfully']);
    } catch (PDOException $e) {
        sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
    } finally {
        $conn = null;
    }
}
