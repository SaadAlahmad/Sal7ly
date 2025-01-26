<?php
function updateBayesianData($conn) {
    try {
        $globalAvgQuery = "SELECT AVG(rating) AS global_avg FROM reviews WHERE status = 1";
        $stmt = $conn->prepare($globalAvgQuery);
        $stmt->execute();
        $globalData = $stmt->fetch(PDO::FETCH_ASSOC);
        $globalAverage = $globalData['global_avg'] ?? 0.0;

        $m = 3;

        $insertQuery = "
            INSERT INTO bayesian (craftsman_id, reviews_num, average_rating, bayesian)
            SELECT p.craftsman_id, 0, 0, 0
            FROM projects p
            LEFT JOIN bayesian b ON p.craftsman_id = b.craftsman_id
            WHERE b.craftsman_id IS NULL
            GROUP BY p.craftsman_id
        ";
        $conn->prepare($insertQuery)->execute();

        $updateAllQuery = "
            UPDATE bayesian b
            JOIN (
                SELECT p.craftsman_id, COUNT(r.id) AS reviews_count, AVG(r.rating) AS average_rating
                FROM projects p
                JOIN reviews r ON p.id = r.project_id
                WHERE r.status = 1
                GROUP BY p.craftsman_id
            ) sub ON b.craftsman_id = sub.craftsman_id
            SET b.reviews_num = sub.reviews_count,
                b.average_rating = sub.average_rating,
                b.bayesian = ((:m * :globalAverage) + (sub.reviews_count * sub.average_rating)) / (:m + sub.reviews_count)
        ";
        $updateStmt = $conn->prepare($updateAllQuery);
        $updateStmt->bindParam(':m', $m, PDO::PARAM_INT);
        $updateStmt->bindParam(':globalAverage', $globalAverage, PDO::PARAM_STR);
        $updateStmt->execute();

        return true;
    } catch (PDOException $e) {
        error_log("Bayesian update error: " . $e->getMessage());
        return false;
    }
}