<?php

namespace App\Observers;

use App\Models\CraftsmanRating;
use App\Models\Review;

class ReviewObserver
{
    private function recalculateRating(int $craftsmanId): void
    {
        $rating = CraftsmanRating::where('craftsman_id', $craftsmanId)->first();

        $totalReviews = Review::where('direction', 'client_to_craftsman')
            ->whereHas('project', fn($q) => $q->where('craftsman_id', $craftsmanId))
            ->where('status', 'visible')
            ->count();

        $averageRating = Review::where('direction', 'client_to_craftsman')
            ->whereHas('project', fn($q) => $q->where('craftsman_id', $craftsmanId))
            ->where('status', 'visible')
            ->avg('rating') ?? 0;

        $globalAverage = 3.0;
        $minimumReviews = 5;

        $bayesianScore = $totalReviews > 0
            ? (($minimumReviews * $globalAverage) + ($totalReviews * $averageRating)) / ($minimumReviews + $totalReviews)
            : 0;

        $rating->reviews_count = $totalReviews;
        $rating->average_rating = round($averageRating, 2);
        $rating->bayesian_score = round($bayesianScore, 4);
        $rating->save();
    }

    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        if ($review->direction !== 'client_to_craftsman') return;
        $this->recalculateRating($review->project->craftsman_id);
    }

    /**
     * Handle the Review "updated" event.
     */
    public function updated(Review $review): void
    {
        if ($review->direction !== 'client_to_craftsman') return;
        if (!$review->wasChanged('status')) return;
        $this->recalculateRating($review->project->craftsman_id);
    }
}
