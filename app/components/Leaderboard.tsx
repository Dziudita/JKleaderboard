'use client';

import { useEffect, useState } from 'react';
import './Leaderboard.css';

const REFRESH_INTERVAL = 30 * 60 * 1000;

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

function getRewardPool(totalWager) {
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
  const [users, setUsers] = useState([]);
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

  const maskName = (name = '') => {
    if (name.length <= 3) return name[0] + '*';
    if (name.length <= 6) return name.slice(0, 2) + '*';
    return name.slice(0, 3) + '*' + name.slice(-1);
  };

  return (
    <div className="leaderboard-wrapper">
      <div className="jk-coins-background" />
      <div className="dice-background">
        <div className="dice dice-left" />
        <div className="dice dice-right" />
      </div>

      <div className="leaderboard-container">
        <div className="header">
          <h1 className="title">JOHNNYKNOX</h1>
          <h2 className="subtitle">GOATED MONTHLY</h2>
        </div>

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

        <div className="data-section">
          <div className="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>User</th>
                  <th>Wager</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(3, 10).map((user, index) => {
                  const wager = user.total || 0;
                  const payout = wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0 ? (wager / totalEligibleWager) * rewardPool * 0.6 : 0;
                  return (
                    <tr key={index}>
                      <td>{index + 4}.</td>
                      <td>{maskName(user.username)}</td>
                      <td>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>${payout.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="info-box">
            <p>✅ <strong>Minimum Wager:</strong> $10,000</p>
            <p>⏳ <strong>Ends in:</strong> {days}D {hours}H {minutes}M {seconds}S (UTC)</p>
            <p>🔥 <strong>Total Wagered:</strong> ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="join-now">📢 <a href="https://www.goated.com/r/JOHNNYKNOX" target="_blank" rel="noopener noreferrer">JOIN THE TEAM NOW</a></p>
            <p className="refresh-note">⟳ Leaderboard refreshes every time you reload the page.</p>
          </div>
        </div>

        <p className="payout-info">Leaderboard will be paid out within 24 - 48 hours.</p>
        <p className="responsible-gaming">
          ⚠ Gamble Responsibly<br />
          Gambling involves risk — play responsibly. Need help? Visit <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer">BeGambleAware.org</a>.
        </p>
      </div>
    </div>
  );
}
