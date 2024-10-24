"use client";
import { useQuery } from 'react-query';
import { fetchBikes } from '@/lib/api/bikes';
import Image from 'next/image';
import Link from 'next/link';

export default function Bikes() {
  const { data: bikes, isLoading, isError } = useQuery('bikes', fetchBikes);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading bikes.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-4 mx-12">
      {bikes?.map((bike) => (
        <Link 
          key={bike.id} 
          href={`/bike/${bike.id}`} 
          className="block p-6 max-w-sm bg-secondary rounded-lg border border-primary shadow-md"
        >
          {bike.image ? (
            <Image 
              src={bike.image}
              alt={bike.name}
              width={300}
              height={200}
              className="rounded-full"
              priority
            />
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center rounded-full">
              <span>No Image Available</span>
            </div>
          )}
          <h5 className="text-xl font-bold text-secondary-foreground">{bike.name}</h5>
          <p className="font-light text-secondary-foreground">{bike.model}</p>
          <p className="text-lg font-semibold text-secondary-foreground">{bike.price_per_hour} per hour</p>
        </Link>
      ))}
    </div>
  );
}

