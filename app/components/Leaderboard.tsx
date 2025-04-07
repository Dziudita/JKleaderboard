'use client';

import { useEffect, useState } from 'react';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

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
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { days, hours, minutes, seconds } = useCountdownToEndOfMonthUTC();

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        setUsers(data || []);
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

  const topThree = users.slice(0, 3);
  const others = users.slice(3, 10);

  const medalColors = ['#f7c000', '#ccc', '#a66a32'];

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '40px 20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f7c000' }}>Johnny Knox</h1>
      <h2 style={{ fontSize: '2rem', color: '#f7c000' }}>Monthly</h2>
      <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>Goated Leaderboard</h3>

      <p style={{ color: '#f7c000', fontSize: '0.95rem', marginBottom: '20px' }}>
        ✅ Minimum Wager Requirement: Players must wager at least $20,000 within the month to qualify for the leaderboard rewards.
      </p>
      <p style={{ color: '#9eff3e', fontSize: '1rem', marginBottom: '20px' }}>
        Ends in: {days} D {hours} H {minutes} M {seconds} S (UTC)
      </p>
      <p style={{ color: '#ccc', fontSize: '0.95rem', marginBottom: '30px' }}>
        This leaderboard refreshes automatically every 10–30 minutes.
      </p>

      <p style={{ color: '#f7c000' }}>Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      <p style={{ color: '#f7c000' }}>Eligible Wagered: ${totalEligibleWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      <p style={{ color: '#f7c000', marginBottom: '40px' }}>Reward Pool: ${rewardPool.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        {topThree.map((user, index) => (
          <div key={index} style={{ backgroundColor: medalColors[index], padding: '20px', borderRadius: '24px', width: '240px', color: '#000' }}>
            <div style={{ fontSize: '2rem' }}>🥇🥈🥉.split('')[index]</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.3rem', margin: '10px 0' }}>{user.username}</div>
            <div>Wager: ${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3 })}</div>
            <div>
              Payout: ${
                user.total && user.total >= 20000 && totalEligibleWager > 0
                  ? ((user.total / totalEligibleWager) * rewardPool).toLocaleString(undefined, { minimumFractionDigits: 3 })
                  : '0.000'
              }
            </div>
          </div>
        ))}
      </div>

      {others.length > 0 && (
        <table style={{ margin: '0 auto', width: '90%', maxWidth: '900px', borderCollapse: 'collapse', fontSize: '1rem' }}>
          <thead>
            <tr>
              <th style={{ color: '#f7c000', paddingBottom: '8px' }}>Place</th>
              <th style={{ color: '#f7c000', paddingBottom: '8px' }}>User</th>
              <th style={{ color: '#f7c000', paddingBottom: '8px' }}>Wager</th>
              <th style={{ color: '#f7c000', paddingBottom: '8px' }}>Payout</th>
            </tr>
          </thead>
          <tbody>
            {others.map((user, i) => (
              <tr key={i}>
                <td style={{ padding: '10px', borderTop: '1px solid #333' }}>{i + 4}.</td>
                <td style={{ padding: '10px', borderTop: '1px solid #333' }}>{user.username}</td>
                <td style={{ padding: '10px', borderTop: '1px solid #333' }}>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                <td style={{ padding: '10px', borderTop: '1px solid #333' }}>
                  ${
                    user.total && user.total >= 20000 && totalEligibleWager > 0
                      ? ((user.total / totalEligibleWager) * rewardPool).toLocaleString(undefined, { minimumFractionDigits: 3 })
                      : '0.000'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '40px' }}>Leaderboard will be paid out within 24 - 48 hours.</p>
    </div>
  );
}
