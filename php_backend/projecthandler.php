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
    header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
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

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

if ($method === 'POST') {
    $userId = $data['userId'] ?? null;
    $userType = $data['userType'] ?? null;

    if (!$userId || !$userType) {
        sendResponse(400, ['error' => 'Invalid input. User ID and User Type are required.']);
    }

    try {
        $query = "
          SELECT 
              p.*, 
              r.service AS request_service, 
              r.details AS request_details, 
              r.city AS request_city, 
              r.location AS request_location, 
              r.created_at AS request_created_at, 
              u.name AS user_name, 
              u.email AS user_email, 
              u.mobile AS user_mobile, 
              c.name AS craftsman_name, 
              c.email AS craftsman_email, 
              c.mobile AS craftsman_mobile, 
              c.city AS craftsman_city, 
              c.category AS craftsman_category, 
              a.message AS application_message, 
              a.created_at AS application_created_at
          FROM projects p
          LEFT JOIN requests r ON p.request_id = r.id
          LEFT JOIN users u ON p.user_id = u.id
          LEFT JOIN craftspeople c ON p.craftsman_id = c.id
          LEFT JOIN applications a ON p.application_id = a.id
          WHERE ";

        $query .= ($userType === "craftsman") ? "p.craftsman_id = :userId" : "p.user_id = :userId";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$projects) {
            sendResponse(200, ['activeProjects' => [], 'finishedProjects' => []]);
        }

        $activeProjects = [];
        $finishedProjects = [];

        foreach ($projects as $project) {
            $formattedProject = [
                'id' => $project['id'],
                'status' => $project['status'],
                'display_name' => $userType === "craftsman"
                    ? "Request #{$project['request_id']} - {$project['user_name']}"
                    : "Request #{$project['request_id']} - {$project['craftsman_name']}",
                'request' => [
                    'id' => $project['request_id'],
                    'service' => $project['request_service'],
                    'details' => $project['request_details'],
                    'city' => $project['request_city'],
                    'location' => $project['request_location'],
                    'created_at' => $project['request_created_at'],
                ],
                'user' => [
                    'name' => $project['user_name'],
                    'email' => $project['user_email'],
                    'mobile' => $project['user_mobile'],
                ],
                'craftsman' => [
                    'name' => $project['craftsman_name'],
                    'email' => $project['craftsman_email'],
                    'mobile' => $project['craftsman_mobile'],
                    'city' => $project['craftsman_city'],
                    'category' => $project['craftsman_category'],
                ],
                'application' => [
                    'id' => $project['application_id'],
                    'message' => $project['application_message'],
                    'created_at' => $project['application_created_at'],
                ],
            ];

            if ($project['status'] == 1) {
                $activeProjects[] = $formattedProject;
            } else {
                $finishedProjects[] = $formattedProject;
            }
        }

        sendResponse(200, [
            'activeProjects' => $activeProjects,
            'finishedProjects' => $finishedProjects
        ]);
    } catch (PDOException $e) {
        sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
    } finally {
        $conn = null;
    }
}

if ($method === 'PUT') {
    $projectId = $data['projectId'] ?? null;

    if (!$projectId) {
        sendResponse(400, ['error' => 'Invalid input. Project ID is required.']);
    }

    try {
        $query = "UPDATE projects SET status = 0 WHERE id = :projectId";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            sendResponse(200, ['success' => true]);
        } else {
            sendResponse(500, ['error' => 'Failed to update project status']);
        }
    } catch (PDOException $e) {
        sendResponse(500, ['error' => 'Database error: ' . $e->getMessage()]);
    } finally {
        $conn = null;
    }
}

sendResponse(405, ['error' => 'Method not allowed']);
