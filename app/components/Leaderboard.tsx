
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

  const totalWager = users.reduce((sum, user) => sum + (user.total || 0), 0);
  const eligibleUsers = users.filter((user) => (user.total || 0) >= 20000);
  const totalEligibleWager = eligibleUsers.reduce((sum, user) => sum + (user.total || 0), 0);
  const rewardPool = getRewardPool(totalWager);

  const medalEmoji = ['🥇', '🥈', '🥉'];

  const maskName = (name: string = 'N/A') => {
    if (name.length <= 2) return name + '***';
    return name.slice(0, 2) + '***';
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f7c000', textAlign: 'center' }}>Johnny Knox</h1>
      <h2 style={{ fontSize: '2rem', color: '#f7c000', textAlign: 'center' }}>Monthly</h2>
      <h3 style={{ fontSize: '1.5rem', color: 'white', textAlign: 'center', marginBottom: '10px' }}>Goated Leaderboard</h3>
      <p style={{ color: '#f7c000', fontSize: '1rem', textAlign: 'center' }}>
        ✅ Minimum Wager Requirement: Players must wager at least $20,000 within the month to qualify for the leaderboard rewards.
      </p>
      <p style={{ color: '#9eff3e', fontSize: '1rem', textAlign: 'center' }}>
        Ends in: {days} D {hours} H {minutes} M {seconds} S (UTC)
      </p>
      <p style={{ color: '#f7c000', fontSize: '1rem', textAlign: 'center' }}>
        Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p style={{ color: '#f7c000', fontSize: '1rem', textAlign: 'center' }}>
        Eligible Wagered: ${totalEligibleWager.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px' }}>
        This leaderboard refreshes automatically every 10–30 minutes.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '30px' }}>
        {users.slice(0, 3).map((user, index) => {
          const color = index === 0 ? '#f7c000' : index === 1 ? '#ddd' : '#a06a3d';
          const payout = user.total && rewardPool > 0 && totalEligibleWager > 0
            ? (user.total / totalEligibleWager) * rewardPool
            : 0;
          return (
            <div key={index} style={{
              backgroundColor: color,
              color: index === 1 ? '#000' : '#000',
              borderRadius: '30px',
              padding: '20px',
              width: '280px',
              textAlign: 'center',
              flex: '1 1 260px'
            }}>
              <div style={{ fontSize: '2rem' }}>{medalEmoji[index]}</div>
              <h2 style={{ fontWeight: 'bold' }}>{maskName(user.username)}</h2>
              <p>Wager: ${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3 })}</p>
              <p>Payout: ${payout.toFixed(3)}</p>
            </div>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', borderCollapse: 'collapse', fontSize: '1rem' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px', color: '#f7c000' }}>Place</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px', color: '#f7c000' }}>User</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px', color: '#f7c000' }}>Wager</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px', color: '#f7c000' }}>Payout</th>
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
                  <td style={{ borderBottom: '1px solid #444', textAlign: 'center', padding: '10px' }}>{index + 4}.</td>
                  <td style={{ borderBottom: '1px solid #444', textAlign: 'center', padding: '10px' }}>{maskName(user.username)}</td>
                  <td style={{ borderBottom: '1px solid #444', textAlign: 'center', padding: '10px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                  <td style={{ borderBottom: '1px solid #444', textAlign: 'center', padding: '10px' }}>${payout.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', marginTop: '30px' }}>
        Leaderboard will be paid out within 24 - 48 hours.
      </p>
    </div>
  );
}
