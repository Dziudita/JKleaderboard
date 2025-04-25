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
  const eligibleUsers = users.filter((u) => (u.total || 0) >= 20000);
  const totalEligibleWager = eligibleUsers.reduce((sum, u) => sum + (u.total || 0), 0);
  const rewardPool = getRewardPool(totalWager);
  const medals = ['🥇', '🥈', '🥉'];

  const maskName = (name: string = '') =>
    name.length < 5 ? name.slice(0, 2) + '***' : name.slice(0, 3) + '***' + name.slice(-1);

  return (
<div style={{
  minHeight: '100vh',
  padding: '20px',
  color: '#fff',
  fontFamily: 'Arial'
}}>


      <h1 style={{ color: '#f7c000', fontSize: '3rem', textAlign: 'center' }}>
    Johnny Knox Goated Monthly
  </h1>
      <p style={{ textAlign: 'center', color: '#f7c000' }}>
        ✅ Minimum Wager Requirement: Players must wager at least $20,000
      </p>
      <p style={{ textAlign: 'center', color: '#9eff3e' }}>
        Ends in: {days}D {hours}H {minutes}M {seconds}S (UTC)
      </p>
      <p style={{ textAlign: 'center', color: '#f7c000' }}>
        Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p style={{ textAlign: 'center', color: '#f7c000' }}>
        Eligible Wagered: ${totalEligibleWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p style={{ textAlign: 'center', color: '#aaa' }}>
        This leaderboard refreshes automatically every 10–30 minutes.
      </p>

      <div className="podium">
        {users.slice(0, 3).map((user, index) => {
          const payout = user.total && rewardPool > 0 && totalEligibleWager > 0
            ? (user.total / totalEligibleWager) * rewardPool
            : 0;
          const classes = ['gold', 'silver', 'bronze'];
          return (
            <div key={index} className={`podium-card ${classes[index]}`}>
              <div className="medal">{medals[index]}</div>
              <h2>{maskName(user.username)}</h2>
              <p>Wager: <strong>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 3 })}</strong></p>
              <p>Payout: <strong>${payout.toFixed(3)}</strong></p>
            </div>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto', marginTop: '40px' }}>
        <table style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', borderCollapse: 'collapse' }}>
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
                  <td style={{ textAlign: 'center', padding: '10px' }}>{index + 4}.</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{maskName(user.username)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>${payout.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px' }}>
        Leaderboard will be paid out within 24 - 48 hours.
      </p>
<p style={{ color: '#ffcc00', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
  ⚠ Gamble Responsibly<br />
  <span style={{ color: '#aaa' }}>
    Gambling involves risk — play responsibly. Need help? Visit <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#f7c000', textDecoration: 'underline' }}>BeGambleAware.org</a>.
  </span>
</p>

    </div>
  );
}
