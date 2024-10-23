"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username, gender }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      router.push('/login'); // Redirect to login after registration
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }                                 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-100">
      <form onSubmit={handleSubmit} className="bg-black p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold text-center text-white">Register</h2>
        <div>
          <label htmlFor="username" className="block text-white">Username</label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-white">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-white">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-white">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="border p-2 rounded w-full text-black"
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        <Button type="submit" className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-primary-500 hover:bg-gray-600'}`} disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
