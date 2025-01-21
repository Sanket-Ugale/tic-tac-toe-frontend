'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [gameState, setGameState] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(Array(9).fill('-'));
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('X'); // Start with X
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerX, setPlayerX] = useState(null);
  const [playerO, setPlayerO] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [router]);

  const isMyTurn = () => {
    const myEmail = localStorage.getItem('userEmail');
    // Check if it's this player's turn based on their role
    return (playerRole === 'X' && currentTurn === 'X') || 
           (playerRole === 'O' && currentTurn === 'O');
  };

  const handleCreateGame = async () => {
    setLoading(true);
    setError('');
    const myEmail = localStorage.getItem('userEmail');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/create_game/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setGame(data.data);
        setRoomCode(data.data.room_code);
        setPlayerRole('X');
        setPlayerX(myEmail);
        setCurrentTurn('X'); // First player (X) starts
        setGameState('play');
        setGameStatus('waiting');
        initializeWebSocket(data.data.room_code);
      } else {
        setError(data.message || 'Failed to create game');
      }
    } catch (err) {
      console.error('Create game error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const myEmail = localStorage.getItem('userEmail');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/join_game/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_code: roomCode }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setGame(data.data);
        setPlayerRole('O');
        setPlayerO(myEmail);
        setCurrentTurn('X'); // Game starts with X
        setGameState('play');
        setGameStatus('playing');
        initializeWebSocket(roomCode);
      } else {
        setError(data.message || 'Failed to join game');
      }
    } catch (err) {
      console.error('Join game error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = (roomCode) => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/game/${roomCode}/?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleGameUpdate(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(ws);
  };

  const handleGameUpdate = (data) => {
    console.log('Game update received:', data);
    
    switch (data.action) {
      case 'game_state':
      case 'player_joined':
        setBoard(data.board.split(''));
        setPlayerX(data.player_x);
        setPlayerO(data.player_o);
        setGameStatus('playing');
        // Keep X as first player
        setCurrentTurn('X');
        break;

      case 'move_made':
        setBoard(data.board.split(''));
        // Toggle turn after move
        setCurrentTurn(prevTurn => prevTurn === 'X' ? 'O' : 'X');
        break;

      case 'game_over':
        setBoard(data.board.split(''));
        setGameStatus('finished');
        if (data.winner) {
          alert(`Game Over! Winner: Player ${data.winner}`);
        } else {
          alert('Game Over! It\'s a draw!');
        }
        break;

      case 'error':
        setError(data.message);
        break;
    }
  };

  const handleMove = (position) => {
    if (!isMyTurn()) {
      console.log('Not your turn');
      return;
    }

    if (board[position] !== '-') {
      console.log('Position already taken');
      return;
    }

    if (gameStatus !== 'playing') {
      console.log('Game not in playing state');
      return;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: "make_move",
        position: position
      }));
    }
  };

  const renderBoard = () => (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
      {board.map((cell, index) => {
        const canMove = isMyTurn() && cell === '-' && gameStatus === 'playing';
        return (
          <button
            key={index}
            onClick={() => canMove && handleMove(index)}
            disabled={!canMove}
            className={`w-20 h-20 text-3xl font-bold rounded flex items-center justify-center
              ${cell === '-' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800'}
              ${!canMove ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
              text-white transition-colors duration-200`}
          >
            {cell === '-' ? '' : cell}
          </button>
        );
      })}
    </div>
  );

  const renderGameInfo = () => {
    const myEmail = localStorage.getItem('userEmail');
    const myTurn = isMyTurn();
    
    return (
      <div className="text-white text-center mb-4">
        <p className="text-xl mb-2">Room Code: {roomCode}</p>
        <p className="text-lg mb-2">You are playing as: {playerRole}</p>
        <p className="text-sm mb-2">
          Player X: {playerX || 'Waiting...'} {playerX === myEmail ? '(You)' : ''}
        </p>
        <p className="text-sm mb-2">
          Player O: {playerO || 'Waiting...'} {playerO === myEmail ? '(You)' : ''}
        </p>
        
        {gameStatus === 'waiting' && (
          <p className="text-yellow-400">Waiting for opponent to join...</p>
        )}
        
        {gameStatus === 'playing' && (
          <>
            <p className="text-lg mb-2">Current Turn: Player {currentTurn}</p>
            <p className={myTurn ? "text-green-400" : "text-red-400"}>
              {myTurn ? "Your turn!" : "Opponent's turn"}
            </p>
          </>
        )}
        
        {gameStatus === 'finished' && (
          <p className="text-blue-400">Game Over</p>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tic Tac Toe</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-gray-800 p-8 rounded-lg">
          {gameState === 'menu' && (
            <div className="space-y-4">
              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create New Game'}
              </button>
              <button
                onClick={() => setGameState('join')}
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
              >
                Join Game
              </button>
              <button
                 onClick={() => router.push('/profile')}
                className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700"
              >
                Profile
              </button>
              <button
                 onClick={() => router.push('/history')}
                className="w-full bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700"
              >
                History
              </button>
            </div>
          )}

          {gameState === 'join' && (
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label className="text-white block mb-2">Enter Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Enter room code"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="w-full bg-gray-600 text-white p-3 rounded hover:bg-gray-700"
              >
                Back to Menu
              </button>
            </form>
          )}

          {gameState === 'play' && (
            <div className="space-y-4">
              {renderGameInfo()}
              {renderBoard()}
              <button
                onClick={() => {
                  socket?.close();
                  setGameState('menu');
                  setBoard(Array(9).fill('-'));
                  setGameStatus('waiting');
                  setPlayerRole(null);
                  setCurrentTurn('X');
                  setPlayerX(null);
                  setPlayerO(null);
                }}
                className="w-full bg-gray-600 text-white p-3 rounded hover:bg-gray-700 mt-4"
              >
                Back to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}