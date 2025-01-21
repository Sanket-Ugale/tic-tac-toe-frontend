'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgotPassword/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store necessary data in localStorage
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('resetToken', data.resetToken);
        // Add a small delay before redirect
        setTimeout(() => {
          router.push('/reset-password');
        }, 100);
      } else {
        setError(data.message || 'Request failed');
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
        <h2 className="text-3xl font-bold text-white text-center">Forgot Password</h2>
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}