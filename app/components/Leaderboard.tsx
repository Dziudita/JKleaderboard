'use client';

import { useEffect, useState } from 'react';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard', {
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '60px', fontFamily: 'Arial, sans-serif', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px', color: '#f7c000' }}>Leaderboard</h1>

      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>Loading or no data available...</p>
      ) : (
        <table style={{ width: '100%', maxWidth: '900px', margin: '0 auto', borderCollapse: 'collapse', fontSize: '1.2rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', borderBottom: '2px solid #f7c000', color: '#f7c000' }}>User</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #f7c000', color: '#f7c000' }}>Wager</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, i) => (
              <tr key={i}>
                <td style={{ padding: '10px', borderBottom: '1px solid #333', textAlign: 'center' }}>{user.username}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #333', textAlign: 'center' }}>
                  ${user.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
