"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { loginUser } from '@/lib/api/api';
import { useMutation } from 'react-query';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: { username: string; password: string }) => loginUser(data.username, data.password),
    onSuccess: (data) => {
      login(data.access);
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold text-center text-black">Login</h2>
        
        <div>
          <label htmlFor="username" className="block text-black">Username</label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border text-black p-2 rounded w-full"
            aria-describedby="username-help"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-black">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 text-black rounded w-full"
            aria-describedby="password-help"
          />
        </div>
        
        <Button variant="outline" type="submit" className="w-full text-black p-2 rounded">
          Login
        </Button>

        <div className='flex text-black items-left justify-center pt-4'>
          <Link href="/register" passHref>
            <Button variant="ghost">Register</Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

