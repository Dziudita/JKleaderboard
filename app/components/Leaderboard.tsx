'use client';

import { useEffect, useState } from 'react';

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
  const rewardPool = getRewardPool(totalWager);

  const maskName = (name: string = '') => {
    if (!name) return '';
    return name[0] + '*'.repeat(name.length - 1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#f7c000', padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
        GOATED MONTHLY
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '30px' }}>
        Ends in: {days}d {hours}h {minutes}m {seconds}s UTC
      </p>

      <table style={{ width: '100%', maxWidth: '700px', margin: '0 auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', textAlign: 'left' }}>User</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', textAlign: 'right' }}>Wager</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #f7c000', textAlign: 'right' }}>Payout</th>
          </tr>
        </thead>
        <tbody>
          {users.slice(0, 10).map((user, index) => {
            const wager = user.total || 0;
            const payout =
              wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0
                ? (wager / totalEligibleWager) * rewardPool * 0.6
                : 0;

            return (
              <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{index + 1}.</td>
                <td style={{ padding: '12px' }}>{maskName(user.username)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>${payout.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
