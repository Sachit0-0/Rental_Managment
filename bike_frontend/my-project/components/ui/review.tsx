// components/ui/Review.tsx
"use client";
import React from 'react';
import { useQuery } from 'react-query';
import { fetchReviews } from '@/lib/api/review';
interface ReviewProps {
    bikeId: string; 
  }
  
  const Review: React.FC<ReviewProps> = ({ bikeId }) => {
  const { data: reviews, isLoading: isReviewsLoading, error } = useQuery(
    ['reviews', bikeId],
    () => fetchReviews(bikeId),
    { enabled: !!bikeId }
  );

  if (isReviewsLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading reviews: {(error as any).message}</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Reviews</h3>
      {!reviews || reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id} className="mb-2">
              <p>
                <span className="font-bold"></span>Rating - {review.rating}/5
              </p>
              <p>{review.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Review;

