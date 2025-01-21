import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8">Tic-Tac-Toe Online</h1>
      <div className="space-y-4">
        <Link href="/login" 
              className="block w-64 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
          Login
        </Link>
        <Link href="/register"
              className="block w-64 text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
          Register
        </Link>
      </div>
    </div>
  );
}