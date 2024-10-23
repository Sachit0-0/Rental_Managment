const api = process.env.NEXT_PUBLIC_API_URL;

export async function rentBike(bikeId: string, token: string, rentalDays: number) {
    const res = await fetch(`${api}/rentals/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bike: bikeId, rental_days: rentalDays }),  // Pass rental_days
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Error renting bike:', errorData);  // Log error details
        throw new Error(errorData.error || 'Renting failed');  // Provide meaningful error message
    }

    return res.json();  // Return the rental data
}
