const api = process.env.NEXT_PUBLIC_API_URL as string;

export type Review = {
  id: number;
  user: string; // Adjust if user is an object
  bike: string; // Adjust if bike is an object
  text: string;
  rating: number;
};

export async function fetchReviews(bikeID: string): Promise<Review[]> {
    const res = await fetch(`${api}/reviews/?bike_id=${bikeID}`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to fetch reviews.');
    }
  
    return await res.json();
  }
  