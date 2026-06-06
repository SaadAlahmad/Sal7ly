<?php

namespace App\Observers;

use App\Models\CraftsmanRating;
use App\Models\Review;

class ReviewObserver
{
    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        if ($review->direction !== 'client_to_craftsman') return;

        $craftsmanId = $review->project->craftsman_id;
        $rating = CraftsmanRating::where('craftsman_id', $craftsmanId)->first();

        $totalReviews = Review::where('direction', 'client_to_craftsman')
            ->whereHas('project', fn($q) => $q->where('craftsman_id', $craftsmanId))
            ->where('status', 'visible')
            ->count();

        $averageRating = Review::where('direction', 'client_to_craftsman')
            ->whereHas('project', fn($q) => $q->where('craftsman_id', $craftsmanId))
            ->where('status', 'visible')
            ->avg('rating');

        // Bayesian formula: (C * m + R * v) / (C + v)
        // C = global average, m = minimum reviews threshold, R = craftsman average, v = review count
        $globalAverage = 3.0; // neutral middle of 1-5 scale
        $minimumReviews = 5;  // reviews needed before score is trusted

        $bayesianScore = (($minimumReviews * $globalAverage) + ($totalReviews * $averageRating)) / ($minimumReviews + $totalReviews);

        $rating->reviews_count = $totalReviews;
        $rating->average_rating = round($averageRating, 2);
        $rating->bayesian_score = round($bayesianScore, 4);
        $rating->save();
    }
}
