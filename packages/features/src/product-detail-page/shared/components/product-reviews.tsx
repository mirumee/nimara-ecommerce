import { Star } from "lucide-react";

import { Skeleton } from "@nimara/ui/components/skeleton";

const REVIEWS = [
  {
    id: 1,
    content: "Great product!",
    rating: 5,
    author: "John Doe",
    date: "2023-10-01",
  },
  {
    id: 2,
    content: "Very satisfied with my purchase. Would recommend!",
    rating: 4,
    author: "Jane Smith",
    date: "2023-10-02",
  },
  {
    id: 3,
    content: "Not what I expected. The quality could be better. Disappointed.",
    rating: 2,
    author: "Alice Johnson",
    date: "2023-10-03",
  },
  {
    id: 4,
    content: "Excellent quality and fast shipping. Will buy again. Thanks!",
    rating: 5,
    author: "Bob Brown",
    date: "2023-10-04",
  },
  {
    id: 5,
    content:
      "Would buy again, highly recommend! Excellent service and quality. I'm very satisfied. Will definitely return for more purchases.",
    rating: 5,
    author: "Charlie Davis",
    date: "2023-10-05",
  },
  {
    id: 6,
    content:
      "Decent product, but could be improved. Not bad overall. Good value for the price.",
    rating: 3,
    author: "Emily White",
    date: "2023-10-06",
  },
  {
    id: 7,
    content:
      "Amazing experience, love it! Highly recommend to others. Will definitely purchase again.",
    rating: 5,
    author: "David Wilson",
    date: "2023-10-07",
  },
  {
    id: 8,
    content:
      "Not worth the price. Expected better quality for the cost. Disappointed.",
    rating: 1,
    author: "Laura Green",
    date: "2023-10-08",
  },
];

/**
 * This is just a placeholder for the product reviews component.
 * In a real application, this would fetch and display actual product reviews.
 * @returns A list of product reviews.
 * This component simulates fetching product reviews and displays them in a list format.
 */
export const ProductReviews = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate data fetching

  return (
    <div className="bg-background">
      <div className="flex justify-between">
        <h2 className="text-primary mb-4 text-xl">Reviews</h2>
        <p className="text-muted-foreground mb-6">{REVIEWS.length} reviews</p>
      </div>
      <ul className="space-y-4">
        {REVIEWS.map((review) => (
          <li key={review.id} className="rounded-lg border p-4">
            <p className="text-primary">{review.content}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center text-yellow-500">
                {[...Array(review.rating)].map((_, index) => (
                  <Star
                    key={index}
                    fill="currentColor"
                    className="inline h-4 w-4"
                    strokeWidth={0}
                  />
                ))}
              </span>
              <span className="text-foreground text-sm">
                by {review.author} on{" "}
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProductReviewsSkeleton = () => {
  return (
    <div className="bg-background mt-8">
      <h2 className="text-primary mb-4 text-xl">Reviews</h2>
      <ul className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <li key={index} className="rounded-lg border p-4">
            <div className="mb-2">
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground flex items-center">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    fill="currentColor"
                    className="inline h-4 w-4"
                    strokeWidth={0}
                  />
                ))}
              </span>
              <Skeleton className="h-4 w-1/4" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
