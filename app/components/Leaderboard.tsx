'use client';

import { useEffect, useState } from 'react';

export default function Leaderboard() {
  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center' as const,
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f7c000' }}>
        Johnny Knox
      </h1>
      <h2 style={{ fontSize: '2rem', color: '#f7c000' }}>Monthly</h2>
      <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>
        Goated Leaderboard
      </h3>

      <p style={{ color: '#f7c000', fontSize: '1.3rem', marginTop: '50px' }}>
        ❄️ The leaderboard is currently in hibernation mode.
      </p>
      <p style={{ color: '#aaa', fontSize: '1rem', marginTop: '10px' }}>
        We are currently updating or taking a break. Please check back soon.
      </p>

      <p style={{ fontSize: '2rem', marginTop: '40px' }}>
        🐑
      </p>
    </div>
  );
}
