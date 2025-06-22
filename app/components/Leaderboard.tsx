'use client';

import { useEffect, useState } from 'react';
import './Leaderboard.css';

type User = {
  username?: string;
  total?: number;
};

function useCountdownToEndOfMonthUTC() {
  const calculateTimeLeft = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
    const diff = end.getTime() - now.getTime();
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const { days, hours, minutes, seconds } = useCountdownToEndOfMonthUTC();

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => setUsers(data || []))
      .catch(() => setUsers([]));
  }, []);

  const totalWager = users.reduce((sum, user) => sum + (user.total || 0), 0);
  const eligibleUsers = users.filter((u) => (u.total || 0) >= 10000);
  const totalEligibleWager = eligibleUsers.reduce((sum, u) => sum + (u.total || 0), 0);
  const rewardPool = 1140;
  const maskName = (name: string = '') => {
    if (name.length <= 3) return name[0] + '*';
    if (name.length <= 6) return name.slice(0, 2) + '*';
    return name.slice(0, 3) + '*' + name.slice(-1);
  };

  return (
    <div style={{ backgroundColor: 'black', color: '#FFD700', minHeight: '100vh', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '20px' }}>Johnny Knox Goated Monthly</h1>
      <p style={{ textAlign: 'center', marginBottom: '10px' }}>
        ✅ Players must wager at least $10,000 to qualify
      </p>
      <p style={{ textAlign: 'center', marginBottom: '30px' }}>
        Ends in: {days}D {hours}H {minutes}M {seconds}S (UTC)
      </p>

      {/* Top 3 cards */}
      <div className="podium">
        {users.slice(0, 3).map((user, index) => {
          const payout = user.total && rewardPool > 0 && totalEligibleWager > 0
            ? (user.total / totalEligibleWager) * rewardPool * 0.6
            : 0;
          const classes = ['gold', 'silver', 'bronze'];
          return (
            <div key={index} className={`podium-card ${classes[index]}`}>
              <div className="username">{maskName(user.username)}</div>
              <div className="info-section">
                <div className="wager">Wager: <strong>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
                <div className="payout">Payout: <strong>${payout.toFixed(2)}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table for 4–10 */}
      <table style={{ width: '100%', maxWidth: '800px', margin: '40px auto 0', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '2px solid #FFD700', padding: '10px' }}>Place</th>
            <th style={{ borderBottom: '2px solid #FFD700', padding: '10px' }}>User</th>
            <th style={{ borderBottom: '2px solid #FFD700', padding: '10px' }}>Wager</th>
            <th style={{ borderBottom: '2px solid #FFD700', padding: '10px' }}>Payout</th>
          </tr>
        </thead>
        <tbody>
          {users.slice(3, 10).map((user, index) => {
            const wager = user.total || 0;
            const payout = wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0
              ? (wager / totalEligibleWager) * rewardPool * 0.6
              : 0;
            return (
              <tr key={index}>
                <td style={{ padding: '10px' }}>{index + 4}.</td>
                <td style={{ padding: '10px' }}>{maskName(user.username)}</td>
                <td style={{ padding: '10px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '10px' }}>${payout.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>⚠ Gamble Responsibly</p>
    </div>
  );
}
