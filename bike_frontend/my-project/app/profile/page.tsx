'use client';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import { fetchUserProfile } from '@/lib/api/profile';

export default function Profile() {
  const { isAuthenticated } = useAuth();

  const { data: profile, isLoading } = useQuery(
    'userProfile',
    async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      return fetchUserProfile(token);
    },
    { enabled: isAuthenticated }
  );

  if (isLoading) return <span>Loading...</span>;

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-black mb-8 text-center">User Profile</h2>
        {profile ? (
          <>
            <div className="bg-gray-100 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-black mb-2">User Info</h3>
              <p className="text-gray-600 mb-2">Username: {profile.user_info.username}</p>
              <p className="text-gray-600 mb-2">Email: {profile.user_info.email}</p>
            </div>
            <h2 className="text-2xl font-bold text-black mb-8 text-center mt-10">Rental History</h2>
            <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.rental_history?.length ? (
                profile.rental_history.map((rental) => (
                  <div key={rental.id} className="bg-gray-100 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
                    <h3 className="text-xl font-semibold mb-2">Bike: {rental.bike.name}</h3>
                    <p className="text-gray-600 mb-2">Start Time: {rental.start_time}</p>
                    <p className="text-gray-600 mb-2">End Time: {rental.end_time}</p>
                    <p className="text-gray-600 mb-4">Total Price: Rs.{rental.total_price}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 mb-4">No rental history available.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-600 mb-4">No profile data available.</p>
        )}
      </div>
    </section>
  );
}
