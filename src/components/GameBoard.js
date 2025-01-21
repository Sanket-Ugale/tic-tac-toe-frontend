'use client';
import { useState, useEffect, useCallback } from 'react';

export default function GameBoard({ initialGame, userEmail, onMoveMade }) {
  const [gameState, setGameState] = useState(initialGame);
  const [error, setError] = useState('');
  const [lastMoveTime, setLastMoveTime] = useState(null);

  // Function to fetch game updates
  const checkForUpdates = useCallback(async () => {
    try {
      const params = lastMoveTime ? `?last_move_after=${lastMoveTime}` : '';
      const res = await fetch(`/api/game/games/${gameState.id}/${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch updates');
      
      const data = await res.json();
      if (data.updated) {
        setGameState(data.game);
        setLastMoveTime(data.game.last_move_time);
        if (onMoveMade) onMoveMade();
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to get game updates');
    }
  }, [gameState.id, lastMoveTime, onMoveMade]);

  // Set up polling for updates
  useEffect(() => {
    setLastMoveTime(initialGame.last_move_time);
    
    // Poll for updates every 2 seconds
    const pollInterval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(pollInterval);
  }, [initialGame, checkForUpdates]);

  const isMyTurn = gameState?.current_turn_email === userEmail;

  const makeMove = async (position) => {
    if (!isMyTurn || gameState.status !== 'IN_PROGRESS') {
      return;
    }

    try {
      const res = await fetch(`/api/game/games/${gameState.id}/move/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to make move');
      } else {
        const data = await res.json();
        setGameState(data);
        setLastMoveTime(data.last_move_time);
        if (onMoveMade) onMoveMade();
      }
    } catch (err) {
      setError('Connection error');
      console.error('Move error:', err);
    }
  };

  const getCellContent = (position) => {
    const symbol = gameState?.board[position];
    if (!symbol || symbol === '_') return null;
    return (
      <span className={`text-4xl ${symbol === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
        {symbol}
      </span>
    );
  };

  return (
    <div>
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
          <button
            key={position}
            onClick={() => makeMove(position)}
            disabled={!isMyTurn || gameState.status !== 'IN_PROGRESS'}
            className={`h-16 bg-gray-700 rounded flex items-center justify-center
              ${isMyTurn && gameState.status === 'IN_PROGRESS' && gameState.board[position] === '_'
                ? 'hover:bg-gray-600 cursor-pointer'
                : 'cursor-not-allowed'
              }`}
          >
            {getCellContent(position)}
          </button>
        ))}
      </div>

      <div className="text-center font-semibold">
        {gameState.status === 'COMPLETED' && (
          <div className="text-green-500">
            Winner: {gameState.winner_email}
          </div>
        )}
        
        {gameState.status === 'DRAW' && (
          <div className="text-yellow-500">
            Game ended in a draw
          </div>
        )}
        
        {gameState.status === 'IN_PROGRESS' && (
          <div className={isMyTurn ? 'text-green-500' : 'text-gray-400'}>
            {isMyTurn ? "Your turn!" : `Waiting for ${gameState.current_turn_email}`}
          </div>
        )}
      </div>
    </div>
  );
}