'use client';

import { useEffect, useState } from 'react';
import './Leaderboard.css';

type User = {
  username: string;
  total: number;
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
      .then((data) => {
        console.log('API atsakymas:', data);
        const mapped = (data.data || []).map((item: any) => ({
          username: item.name,
          total: item.wagered?.all_time || 0,
        }));
        setUsers(mapped);
      })
      .catch((err) => {
        console.error('Klaida su API:', err);
        setUsers([]);
      });
  }, []);

  const totalWager = users.reduce((sum, user) => sum + (user.total || 0), 0);
  const eligibleUsers = users.filter((u) => u.total >= 10000);
  const totalEligibleWager = eligibleUsers.reduce((sum, u) => sum + u.total, 0);
  const rewardPool = getRewardPool(totalWager);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#f7c000', fontFamily: 'Arial', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '10px' }}>
        Johnny Knox Goated Monthly
      </h1>

      <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Ends in: {days}D {hours}H {minutes}M {seconds}S (UTC)
      </p>

      <p style={{ textAlign: 'center' }}>
        Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>

      <div style={{ overflowX: 'auto', marginTop: '40px' }}>
        <table style={{ width: '100%', maxWidth: '800px', margin: '0 auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px' }}>•</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px' }}>User</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px' }}>Wager</th>
              <th style={{ borderBottom: '2px solid #f7c000', padding: '10px' }}>Payout</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((user, index) => {
              const wager = user.total || 0;
              const payout = wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0
                ? (wager / totalEligibleWager) * rewardPool * 0.6
                : 0;
              return (
                <tr key={index}>
                  <td style={{ textAlign: 'center', padding: '10px' }}>•</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{user.username}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>${payout.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
