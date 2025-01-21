'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile/${email}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setProfile(data.payload[0]);
          setEditedName(data.payload[0].name);
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('name', editedName);
      formData.append('user_id', profile.user_id.toString()); // Added user_id to form data

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.payload);
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Connection error while updating profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Back
        </button>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        
        {profile && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                <Image
                  src={imagePreview || `${process.env.NEXT_PUBLIC_API_URL}/auth${profile.image}`}
                  alt="Profile"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-gray-400 mb-2">Update Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-gray-400"
                />
              </div>
            )}
            
            <div>
              <label className="text-gray-400 block">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
              ) : (
                <p className="text-white text-lg">{profile.name}</p>
              )}
            </div>
            
            {/* <div>
              <label className="text-gray-400 block">User ID</label>
              <p className="text-white">{profile.user_id}</p>
            </div>
            
            <div>
              <label className="text-gray-400 block">Profile ID</label>
              <p className="text-white">{profile.user_profile_id}</p>
            </div> */}
            
            {isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setEditedName(profile.name);
                  }}
                  className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                router.push('/login');
              }}
              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}