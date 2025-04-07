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
    if (totalWager >= tier.threshold) return tier.pool;
  }
  return 0;
}

function useCountdownToEndOfMonthUTC() {
  const calculateTimeLeft = () => {
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

const maskName = (name: string = 'N/A') => {
  if (name.length <= 4) return name.slice(0, 2) + '***';
  return name.slice(0, 3) + '***' + name.slice(-1);
};

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { days, hours, minutes, seconds } = useCountdownToEndOfMonthUTC();

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch('/api/leaderboard')
        .then((res) => res.ok ? res.json() : Promise.reject('API error'))
        .then(setUsers)
        .catch((err) => setError(err.toString()));
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const totalWager = users.reduce((sum, u) => sum + (u.total || 0), 0);
  const eligibleUsers = users.filter((u) => (u.total || 0) >= 20000);
  const totalEligibleWager = eligibleUsers.reduce((sum, u) => sum + (u.total || 0), 0);
  const rewardPool = getRewardPool(totalWager);
  const medalEmoji = ['🥇', '🥈', '🥉'];
  const cardGradients = [
    'linear-gradient(135deg, #FFD700, #FFA500)',
    'linear-gradient(135deg, #C0C0C0, #AAAAAA)',
    'linear-gradient(135deg, #CD7F32, #A0522D)'
  ];

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f7c000', textAlign: 'center' }}>Johnny Knox</h1>
      <h2 style={{ fontSize: '2rem', color: '#f7c000', textAlign: 'center' }}>Monthly</h2>
      <h3 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '10px' }}>Goated Leaderboard</h3>

      <p style={{ color: '#f7c000', textAlign: 'center' }}>
        ✅ Minimum Wager Requirement: Players must wager at least $20,000 within the month to qualify.
      </p>
      <p style={{ color: '#9eff3e', textAlign: 'center' }}>
        Ends in: {days} D {hours} H {minutes} M {seconds} S (UTC)
      </p>
      <p style={{ color: '#f7c000', textAlign: 'center' }}>
        Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p style={{ color: '#f7c000', textAlign: 'center' }}>
        Eligible Wagered: ${totalEligibleWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', marginBottom: '30px' }}>
        This leaderboard refreshes automatically every 10–30 minutes.
      </p>

      {/* Top 3 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
        {users.slice(0, 3).map((user, index) => {
          const payout = user.total && rewardPool > 0 && totalEligibleWager > 0
            ? (user.total / totalEligibleWager) * rewardPool
            : 0;
          return (
            <div key={index} style={{
              background: cardGradients[index],
              borderRadius: '20px',
              padding: '25px',
              width: '260px',
              textAlign: 'center',
              color: '#000',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              flex: '1 1 240px'
            }}>
              <div style={{ fontSize: '2rem' }}>{medalEmoji[index]}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '5px 0' }}>{maskName(user.username)}</h3>
              <p>Wager: <strong>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3 })}</strong></p>
              <p>Payout: <strong>${payout.toFixed(3)}</strong></p>
            </div>
          );
        })}
      </div>

      {/* Table for 4-10 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Place', 'User', 'Wager', 'Payout'].map(header => (
                <th key={header} style={{ padding: '10px', color: '#f7c000', borderBottom: '2px solid #f7c000' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.slice(3, 10).map((user, index) => {
              const wager = user.total || 0;
              const payout = wager >= 20000 && rewardPool > 0 && totalEligibleWager > 0
                ? (wager / totalEligibleWager) * rewardPool
                : 0;
              return (
                <tr key={index}>
                  <td style={cellStyle}>{index + 4}.</td>
                  <td style={cellStyle}>{maskName(user.username)}</td>
                  <td style={cellStyle}>${wager.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                  <td style={cellStyle}>${payout.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px' }}>
        Leaderboard will be paid out within 24–48 hours.
      </p>
    </div>
  );
}

const cellStyle = {
  padding: '10px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #444',
};
