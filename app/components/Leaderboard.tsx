'use client';

import { useEffect, useState } from 'react';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

type User = {
  username?: string;
  total?: number;
};

const rewardTiers = [
  { threshold: 5000000, pool: 11400 },
  { threshold: 4500000, pool: 10260 },
  { threshold: 4000000, pool: 9120 },
  { threshold: 3500000, pool: 7980 },
  { threshold: 3000000, pool: 6840 },
  { threshold: 2500000, pool: 5700 },
  { threshold: 2000000, pool: 4560 },
  { threshold: 1750000, pool: 3990.4 },
  { threshold: 1500000, pool: 3420 },
  { threshold: 1250000, pool: 2850.4 },
  { threshold: 1000000, pool: 2280 },
  { threshold: 750000, pool: 1710.4 },
  { threshold: 500000, pool: 1140 },
  { threshold: 400000, pool: 912 },
  { threshold: 300000, pool: 684 },
  { threshold: 200000, pool: 456 },
  { threshold: 100000, pool: 228 },
  { threshold: 50000, pool: 114.4 },
];

function getRewardPool(totalWager: number) {
  for (const tier of rewardTiers) {
    if (totalWager >= tier.threshold) {
      return tier.pool;
    }
  }
  return 0;
}

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
  const [error, setError] = useState<string | null>(null);
  const { days, hours, minutes, seconds } = useCountdownToEndOfMonthUTC();

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (data?.length) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3, 10);

  const totalWager = users.reduce((sum, user) => sum + (user.total ?? 0), 0);
  const eligibleUsers = users.filter((user) => (user.total ?? 0) >= 20000);
  const totalEligibleWager = eligibleUsers.reduce((sum, user) => sum + (user.total ?? 0), 0);
  const rewardPool = getRewardPool(totalWager);

  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ fontSize: '2rem', color: '#f7c000' }}>Goated Leaderboard</h2>
      <p style={{ color: '#f7c000' }}>Reward Pool: ${rewardPool.toFixed(3)}</p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {topThree.map((user, i) => (
          <div
            key={i}
            style={{
              backgroundColor: i === 0 ? '#f7c000' : i === 1 ? '#ddd' : '#b3773a',
              padding: '20px',
              borderRadius: '20px',
              width: '280px',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '2rem' }}>{medalEmojis[i]}</div>
            <h3 style={{ margin: '10px 0', color: '#000' }}>{user.username}</h3>
            <p style={{ color: '#000' }}>
              Wager: ${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </p>
            <p style={{ color: '#000' }}>
              Payout: $
              {user.total && rewardPool > 0 && totalEligibleWager > 0 && user.total >= 20000
                ? ((user.total / totalEligibleWager) * rewardPool).toFixed(3)
                : '0.000'}
            </p>
          </div>
        ))}
      </div>

      <table style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        borderCollapse: 'collapse',
        fontSize: '1rem',
      }}>
        <thead>
          <tr>
            <th style={headerCell}>Place</th>
            <th style={headerCell}>User</th>
            <th style={headerCell}>Wager</th>
            <th style={headerCell}>Payout</th>
          </tr>
        </thead>
        <tbody>
          {rest.map((user, index) => {
            const payout =
              user.total && rewardPool > 0 && totalEligibleWager > 0 && user.total >= 20000
                ? (user.total / totalEligibleWager) * rewardPool
                : 0;

            return (
              <tr key={index}>
                <td style={tableCell}>{index + 4}.</td>
                <td style={tableCell}>{user.username || 'N/A'}</td>
                <td style={tableCell}>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                <td style={tableCell}>${payout.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '30px' }}>
        Leaderboard will be paid out within 24 - 48 hours.
      </p>
    </div>
  );
}

const headerCell = {
  padding: '12px',
  borderBottom: '2px solid #f7c000',
  color: '#f7c000',
  textAlign: 'center' as const,
};

const tableCell = {
  padding: '12px',
  borderBottom: '1px solid #444',
  color: 'white',
  textAlign: 'center' as const,
};
