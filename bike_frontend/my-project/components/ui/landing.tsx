"use client";
import Image from "next/image";
import { useQuery } from "react-query";
import { Button } from "./button";
import Link from "next/link";
import { fetchRecommendedBikes } from "@/lib/api/recommend";
import { useAuth } from "@/app/context/AuthContext";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const { data: recommendedBikes, isLoading, isError } = useQuery(
    'recommendedBikes',
    async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      return fetchRecommendedBikes(token);
    },
    { enabled: isAuthenticated }
  );

  if (isLoading) return <span>Loading...</span>;

  return (
    <>
      {/* Hero Section */}
      <div className="bg-black">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 flex items-center justify-center text-center lg:text-left lg:pr-8">
              <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Boost your productivity.
                  <br />
                  Start renting bikes today.
                </h2>
                <p className="mt-6 text-lg text-gray-300">
                  Discover the most affordable bike rentals and start your next adventure on two wheels. Flexible rates, modern bikes, and great service.
                </p>
                <div className="mt-10 flex justify-center gap-x-6 lg:justify-start">
                  <a
                    href="#"
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100"
                    aria-label="Get started with bike rentals"
                  >
                    Get started
                  </a>
                  <a href="#" className="text-sm font-semibold text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-1 mt-16 lg:mt-0">
              <Image
                src="/images/MotocrossDARK.gif"
                width={1000}
                height={860}
                alt="Motocross Image"
                className="object-cover w-full h-full rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <h3 className="text-xl font-semibold text-gray-900">Affordable Rates</h3>
              <p className="mt-4 text-gray-600">Enjoy flexible, competitive prices for every ride.</p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <h3 className="text-xl font-semibold text-gray-900">Modern Bikes</h3>
              <p className="mt-4 text-gray-600">Choose from a range of modern bikes suited for all terrains.</p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              <h3 className="text-xl font-semibold text-gray-900">24/7 Support</h3>
              <p className="mt-4 text-gray-600">We’re always here to assist you, no matter the time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bikes List Section */}
      <section className="bg-white py-16">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-black mb-8 text-center">Recommended Rides</h2>
    <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-8">
      {isLoading ? (
        <span className="text-center text-gray-500">Loading bikes...</span>
      ) : isError ? (
        <span className="text-red-500 text-center">Oops! Unable to load bikes. Please try again later.</span>
      ) : (
        recommendedBikes?.map(bike => (
          <div key={bike.id} className="bg-gray-100 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
            <img 
              src={bike.image || "/media/images/jujutsu-kaisen-5k-2024-1l-2560x1440_OQY4Yt6.jpg"} 
              alt={bike.name} 
              className="w-full h-40 object-cover rounded-full mb-4" 
            />
            <h3 className="text-xl font-semibold mb-2">{bike.name}</h3>
            <p className="text-gray-600 mb-2">Model: {bike.model}</p>
            <p className="text-gray-600 mb-2">Type: {bike.bike_type}</p>
            <p className="text-gray-600 mb-2">Availability: {bike.availability ? 'Available' : 'Not Available'}</p>
            <p className="text-gray-600 mb-4">Price per hour: Rs.{bike.price_per_hour}</p>
            <Link href={`/bike/${bike.id}`} passHref>
              <Button className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-black transition">See More</Button>
            </Link>
          </div>
        ))
      )}
    </div>
  </div>
</section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { text: "Great service, fantastic bikes, and affordable prices!", name: "John Doe" },
              { text: "I rented a bike for a whole day and it was perfect!", name: "Jane Smith" },
              { text: "The staff is super friendly and the bikes are top-notch!", name: "Mark Wilson" },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 bg-white shadow rounded-lg text-center">
                <p className="text-gray-700">"{testimonial.text}"</p>
                <p className="mt-4 text-gray-900 font-semibold">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-black py-16 text-white text-center">
        <h2 className="text-3xl font-bold">Start Your Adventure Today!</h2>
        <p className="mt-4">Sign up and rent your bike now to explore the city at your own pace.</p>
        <div className="mt-8">
          <a href="#" className="rounded-md bg-white px-5 py-3 text-gray-900 font-semibold" aria-label="Sign up to rent a bike">
            Get Started
          </a>
        </div>
      </section>
    </>
  );
}
