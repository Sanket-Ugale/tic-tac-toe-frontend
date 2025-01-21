'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('registerEmail');
    if (!storedEmail) {
      router.push('/register');
    }
    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyOTP/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.removeItem('registerEmail');
        router.push('/login');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white text-center">Verify OTP</h2>
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white">Enter OTP</label>
            <input
              type="text"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}