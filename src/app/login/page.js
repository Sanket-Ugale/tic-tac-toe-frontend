'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/signIn/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok && data.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('userEmail', formData.email);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white text-center">Login</h2>
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-white">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center space-y-2">
          <Link href="/forgot-password" className="text-blue-400 hover:underline block">
            Forgot Password?
          </Link>
          <Link href="/register" className="text-blue-400 hover:underline block">
            Dont have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}