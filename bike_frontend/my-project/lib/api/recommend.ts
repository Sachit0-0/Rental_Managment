const api = process.env.NEXT_PUBLIC_API_URL;

type TBike = {
    id: number;
    bike_type: 'bike' | 'scooter';
    availability: boolean;
    name: string;
    model: string;
    price_per_hour: string;
    image: string | null;
    description: string;    
};

export async function fetchRecommendedBikes(token: string) {
    const res = await fetch(`${api}/recommend`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch recommended bikes');
    }
    
    const data: TBike[] = await res.json();
    return data;
}

