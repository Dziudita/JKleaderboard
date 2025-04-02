'use client';

import Leaderboard from '../components/Leaderboard';

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#FFD700',
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      {/* Leaderboard rodomas tik vieną kartą */}
      <Leaderboard />
    </div>
  );
}
