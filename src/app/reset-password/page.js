'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    resetToken: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('resetEmail');
    const resetToken = localStorage.getItem('resetToken');
    if (!email || !resetToken) {
      router.push('/forgot-password');
      return;
    }
    setFormData(prev => ({ ...prev, email, resetToken }));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resetPassword/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetToken');
        router.push('/login');
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white text-center">Reset Password</h2>
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white">OTP</label>
            <input
              type="text"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={formData.otp}
              onChange={(e) => setFormData({...formData, otp: e.target.value})}
              maxLength={6}
            />
          </div>
          <div>
            <label className="text-white">New Password</label>
            <input
              type="password"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="text-white">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full p-2 rounded bg-gray-700 text-white mt-1"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}