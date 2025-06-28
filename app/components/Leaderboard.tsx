'use client';

import { useEffect, useState } from 'react';
import './Leaderboard.css';

const REFRESH_INTERVAL = 30 * 60 * 1000;

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
    if (name.length <= 3) return name[0] + '*';
    if (name.length <= 6) return name.slice(0, 2) + '*';
    return name.slice(0, 3) + '*' + name.slice(-1);
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center px-4 py-12">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(255,215,0,0.3)',
          padding: '30px',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px', paddingRight: '20px', color: '#fff' }}>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>✅ Minimum Wager: $10,000</p>
          <p style={{ color: '#ff4444', fontWeight: 'bold', marginTop: '10px' }}>Ends in: {days}D {hours}H {minutes}M {seconds}S</p>
          <p style={{ color: '#f7c000', marginTop: '10px' }}>Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 3 })}</p>
          <a
            href="https://www.goated.com/r/JOHNNYKNOX"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'white',
              fontWeight: 'bold',
              textDecoration: 'underline',
              display: 'block',
              marginTop: '20px',
              fontSize: '1.1rem',
            }}
          >
            JOIN THE TEAM NOW
          </a>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#ddd' }}>
            Leaderboard paid in 24–48h
          </p>
        </div>

        <div style={{ flex: 2, minWidth: '300px', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr>
                <th style={{ color: '#f7c000', textAlign: 'left', padding: '8px' }}>Place</th>
                <th style={{ color: '#f7c000', textAlign: 'left', padding: '8px' }}>User</th>
                <th style={{ color: '#f7c000', textAlign: 'right', padding: '8px' }}>Wager</th>
                <th style={{ color: '#f7c000', textAlign: 'right', padding: '8px' }}>Payout</th>
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
                    <td style={{ padding: '6px' }}>{index + 1}.</td>
                    <td style={{ padding: '6px' }}>{maskName(user.username)}</td>
                    <td style={{ textAlign: 'right', padding: '6px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', padding: '6px' }}>${payout.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
