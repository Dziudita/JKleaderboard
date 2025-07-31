'use client';

import { useEffect, useState } from 'react';
import './Leaderboard.css';

export default function Leaderboard() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Backgrounds */}
      <div className="jk-coins-background" />
      <div className="dice-background">
        <div className="dice dice-left" />
        <div className="dice dice-right" />
      </div>

      {/* Message */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
        }}
      >
        <h1
          style={{
            color: '#f7c000',
            fontSize: '2.2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 0 12px #f7c000, 0 0 20px #ff9900',
            animation: 'pulseGlow 2s ease-in-out infinite',
            lineHeight: '1.6',
            maxWidth: '90%',
          }}
        >
          I’m very grateful you all were here,<br />
          but our leaderboard is saying goodbye.<br />
          Good luck and enjoy the game!
        </h1>

        {/* Animation */}
        <style jsx>{`
          @keyframes pulseGlow {
            0% {
              text-shadow: 0 0 12px #f7c000, 0 0 20px #ff9900;
            }
            50% {
              text-shadow: 0 0 20px #fff700, 0 0 32px #ff6600;
            }
            100% {
              text-shadow: 0 0 12px #f7c000, 0 0 20px #ff9900;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
