# Tic-Tac-Toe Frontend

This is the frontend for the **Tic-Tac-Toe** game built using Next.js. It integrates with the backend to provide real-time gameplay, user authentication, and game history features.

## Features

- Real-time Tic-Tac-Toe gameplay with WebSocket
- User registration, login, and profile management
- Game history tracking and responsive design

## Tech Stack

- **Framework:** Next.js  
- **Styling:** TailwindCSS  
- **Real-time:** WebSocket  

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Sanket-Ugale/tic-tac-toe-frontend.git
   cd tic-tac-toe-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env.local` file and add:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws/game/
```

## Deployment

Deploy easily with Vercel.
