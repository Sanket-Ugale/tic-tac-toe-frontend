'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function History() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/game_history/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setGames(data.data);
        } else {
          setError(data.message || 'Failed to fetch game history');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Game History</h2>
        
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Back
        </button>
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.room_code} className="bg-gray-800 p-6 rounded-lg shadow">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400">Room Code</p>
                  <p className="text-white font-semibold">{game.room_code}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-white font-semibold">{game.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Player 1</p>
                  <p className="text-white">{game.player1}</p>
                </div>
                <div>
                  <p className="text-gray-400">Player 2</p>
                  <p className="text-white">{game.player2}</p>
                </div>
              </div>
              
              {game.winner && (
                <div className="mt-2">
                  <p className="text-gray-400">Winner</p>
                  <p className="text-green-400 font-semibold">{game.winner}</p>
                </div>
              )}
              
              {game.moves.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-2">Moves</p>
                  <div className="grid grid-cols-3 gap-2">
                    {game.moves.map((move) => (
                      <div key={move.id} className="bg-gray-700 p-2 rounded">
                        <p className="text-white text-sm">
                          Position: {move.position}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(move.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}