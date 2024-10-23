// lib/api/recommend.ts
const api = process.env.NEXT_PUBLIC_API_URL;

type TBike = {
    id: number;
    bike_type: 'bike' | 'scooter';
    availability: boolean;
    name: string;
    model: string;
    price_per_hour: string;
    image: string | null;
    
};

export async function fetchRecommendedBikes(token: string) {
    const res = await fetch(`${api}/recommend`, {
        method: 'GET', // Specify the method
        headers: {
            'Content-Type': 'application/json', // Set Content-Type to application/json
            'Authorization': `Bearer ${token}`, // Include the Authorization token
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch recommended bikes');
    }
    
    const data: TBike[] = await res.json(); // Await the JSON response
    return data; // Return the fetched data
}
