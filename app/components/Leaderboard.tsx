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

  const getMedal = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}.`;
    }
  };

  const topThree = users.slice(0, 3);
  const rest = users.slice(3, 10);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '40px 20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f7c000' }}>Johnny Knox</h1>
      <h2 style={{ fontSize: '2rem', color: '#f7c000' }}>Monthly</h2>
      <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>Goated Leaderboard</h3>
      <p style={{ color: '#f7c000', fontSize: '0.95rem', marginBottom: '20px' }}>✅ Minimum Wager Requirement: Players must wager at least $20,000 within the month to qualify for the leaderboard rewards.</p>
      <p style={{ color: '#9eff3e', fontSize: '1rem', marginBottom: '30px' }}>Ends in: {days} D {hours} H {minutes} M {seconds} S (UTC)</p>
      <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '30px' }}>This leaderboard refreshes twice daily.</p>

      <p style={{ color: '#f7c000', fontSize: '1rem' }}>Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
      <p style={{ color: '#f7c000', fontSize: '1rem' }}>Eligible Wagered: ${totalEligibleWager.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
      <p style={{ color: '#f7c000', fontSize: '1rem', marginBottom: '30px' }}>Reward Pool: ${rewardPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        {topThree.map((user, index) => {
          const background = index === 0 ? '#f7c000' : index === 1 ? '#d3d3d3' : '#cd7f32';
          const medal = getMedal(index);
          const payout = user.total && rewardPool > 0 && totalEligibleWager > 0 ? (user.total / totalEligibleWager) * rewardPool : 0;
          return (
            <div key={index} style={{ background, padding: '20px', borderRadius: '20px', minWidth: '250px' }}>
              <div style={{ fontSize: '2rem' }}>{medal}</div>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{user.username || 'N/A'}</h3>
              <p>Wager: ${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
              <p>Payout: ${payout.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
            </div>
          );
        })}
      </div>

      <table style={{ width: '100%', maxWidth: '900px', margin: '0 auto', borderCollapse: 'collapse', fontSize: '1.2rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', color: '#f7c000', textAlign: 'center' }}>Place</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', color: '#f7c000', textAlign: 'center' }}>User</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', color: '#f7c000', textAlign: 'center' }}>Wager</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', color: '#f7c000', textAlign: 'center' }}>Payout</th>
          </tr>
        </thead>
        <tbody>
          {rest.map((user, index) => {
            const payout = user.total && rewardPool > 0 && totalEligibleWager > 0 ? (user.total / totalEligibleWager) * rewardPool : 0;
            return (
              <tr key={index + 3}>
                <td style={{ padding: '12px', borderBottom: '1px solid #444', color: 'white', textAlign: 'center' }}>{index + 4}.</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #444', color: 'white', textAlign: 'center' }}>{user.username}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #444', color: 'white', textAlign: 'center' }}>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #444', color: 'white', textAlign: 'center' }}>${payout.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '20px' }}>Leaderboard will be paid out within 24 - 48 hours.</p>
    </div>
  );
}
