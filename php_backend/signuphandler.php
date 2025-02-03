<?php
header("Content-Type: application/json");

/*
 FOR RUNING ON PORT 5173 AND DATABASE ON LOCALHOST XAMPP
 CTRL + / AFTER NPM RUN BUILD IF EVERYTHING IS RUNNING ON THE SAME PORT
*/

header("Access-Control-Allow-Origin: *");

require_once 'DbConnect.php';

$response = ['status' => false];

try {
    $db = new DbConnect();
    $conn = $db->connect();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Only POST is allowed.');
    }

    $userType = $_POST['userType'] ?? null;

    if ($userType === 'user') {
        function generateUserId($conn) {
            do {
                $prefix = '8800';
                $randomPart = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $uniqueId = $prefix . $randomPart;

                $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE id = :id");
                $stmt->bindParam(':id', $uniqueId);
                $stmt->execute();
                $exists = $stmt->fetchColumn() > 0;
            } while ($exists);

            return $uniqueId;
        }

        $userId = generateUserId($conn);

        $requiredFields = ['name', 'email', 'mobile', 'password'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("The field '$field' is required.");
            }
        }

        $name = htmlspecialchars($_POST['name']);
        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        $mobile = htmlspecialchars($_POST['mobile']);
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $created_at = date('Y-m-d H:i:s');
        $updated_at = $created_at;

        $checkEmailStmt = $conn->prepare("
            SELECT email FROM users WHERE email = :email
            UNION
            SELECT email FROM craftspeople WHERE email = :email
        ");
        $checkEmailStmt->bindParam(':email', $email);
        $checkEmailStmt->execute();
        if ($checkEmailStmt->rowCount() > 0) {
            throw new Exception('Email already registered.');
        }


        if (!$email) {
            throw new Exception('Invalid email address.');
        }

        $stmt = $conn->prepare("
            INSERT INTO users (id, name, email, mobile, password, created_at, updated_at)
            VALUES (:id, :name, :email, :mobile, :password, :created_at, :updated_at)
        ");
        $stmt->bindParam(':id', $userId);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':mobile', $mobile, PDO::PARAM_INT);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':created_at', $created_at);
        $stmt->bindParam(':updated_at', $updated_at);

        $stmt->execute();

        $response['status'] = true;
        $response['message'] = 'User registered successfully.';
        $response['userId'] = $userId;
    } elseif ($userType === 'craftsman') {
        function generateCraftsmanId($conn) {
            do {
                $datePart = date('Ymd');
                $randomPart = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $uniqueId = $datePart . $randomPart;

                $stmt = $conn->prepare("SELECT COUNT(*) FROM craftspeople WHERE id = :id");
                $stmt->bindParam(':id', $uniqueId);
                $stmt->execute();
                $exists = $stmt->fetchColumn() > 0;
            } while ($exists);

            return $uniqueId;
        }

        $craftsmanId = generateCraftsmanId($conn);

        $requiredFields = ['name', 'email', 'mobile', 'city', 'category', 'bio', 'password'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("The field '$field' is required.");
            }
        }

        $name = htmlspecialchars($_POST['name']);
        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        $mobile = htmlspecialchars($_POST['mobile']);
        $city = htmlspecialchars($_POST['city']);
        $category = htmlspecialchars($_POST['category']);
        $bio = htmlspecialchars($_POST['bio']);
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

        $checkEmailStmt = $conn->prepare("
            SELECT email FROM users WHERE email = :email
            UNION
            SELECT email FROM craftspeople WHERE email = :email
        ");
        $checkEmailStmt->bindParam(':email', $email);
        $checkEmailStmt->execute();
        if ($checkEmailStmt->rowCount() > 0) {
            throw new Exception('Email already registered.');
        }

        if (!$email) {
            throw new Exception('Invalid email address.');
        }

        $picture = null;

        if (isset($_FILES['picture']) && $_FILES['picture']['error'] === UPLOAD_ERR_OK) {
            $picture = file_get_contents($_FILES['picture']['tmp_name']);
        } else {
            $defaultPicturePath = __DIR__ . "/pictures/userjpg.jpg";
            if (file_exists($defaultPicturePath)) {
                $picture = file_get_contents($defaultPicturePath);
            } else {
                throw new Exception("Default picture not found.");
            }
        }

        $stmt = $conn->prepare("
            INSERT INTO craftspeople (id, name, email, mobile, city, category, bio, picture, password)
            VALUES (:id, :name, :email, :mobile, :city, :category, :bio, :picture, :password)
        ");
        $stmt->bindParam(':id', $craftsmanId);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':mobile', $mobile, PDO::PARAM_INT);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':bio', $bio);
        $stmt->bindParam(':picture', $picture, PDO::PARAM_LOB);
        $stmt->bindParam(':password', $password);

        $stmt->execute();

        $workSamples = [];
        if (isset($_FILES['workSamples']['tmp_name']) && is_array($_FILES['workSamples']['tmp_name'])) {
            foreach ($_FILES['workSamples']['tmp_name'] as $key => $tmpName) {
                if (is_uploaded_file($tmpName)) {
                    $fileContent = file_get_contents($tmpName);
                    $fileType = $_FILES['workSamples']['type'][$key];

                    $workStmt = $conn->prepare("
                        INSERT INTO worksamples (craftsperson_id, file_data, file_type)
                        VALUES (:craftsperson_id, :file_data, :file_type)
                    ");
                    $workStmt->bindParam(':craftsperson_id', $craftsmanId);
                    $workStmt->bindParam(':file_data', $fileContent, PDO::PARAM_LOB);
                    $workStmt->bindParam(':file_type', $fileType);
                    $workStmt->execute();

                    $workSamples[] = $conn->lastInsertId();
                }
            }
        }

        $response['status'] = true;
        $response['message'] = 'Craftsman registered successfully.';
        $response['craftsmanId'] = $craftsmanId;
        $response['workSamples'] = $workSamples;
    } else {
        throw new Exception("Invalid user type.");
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit;
