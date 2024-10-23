const api = process.env.NEXT_PUBLIC_API_URL;

type TUserProfile = {
    user_info: {
        username: string;
        email: string;
    };
    rental_history: {
        id: number;
        bike: {
            name: string;
        };
        start_time: string;
        end_time: string;
        total_price: string;
    }[];
};

export async function fetchUserProfile(token: string): Promise<TUserProfile> {
    const res = await fetch(`${api}/profile/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch user profile.');
    }

    return res.json(); 
}
