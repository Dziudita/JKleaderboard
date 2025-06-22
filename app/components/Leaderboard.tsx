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
    if (name.length <= 3) {
      return name[0] + '***';
    }
    if (name.length <= 6) {
      return name.slice(0, 2) + '***';
    }
    return name.slice(0, 3) + '***' + name.slice(-1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="jk-coins-background">
        <div className="jk-coin" style={{ top: '10%', left: '20%', width: '60px', height: '60px', animationDuration: '25s' }} />
        <div className="jk-coin" style={{ top: '30%', left: '70%', width: '40px', height: '40px', animationDuration: '30s' }} />
        <div className="jk-coin" style={{ top: '50%', left: '40%', width: '80px', height: '80px', animationDuration: '20s' }} />
        <div className="jk-coin" style={{ top: '70%', left: '10%', width: '50px', height: '50px', animationDuration: '35s' }} />
        <div className="jk-coin" style={{ top: '80%', left: '80%', width: '70px', height: '70px', animationDuration: '18s' }} />
      </div>

      <div className="dice-background">
        <div className="dice dice-left" />
        <div className="dice dice-right" />
      </div>

      <div className="relative z-10 p-4 text-white font-sans">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-500 to-yellow-400 animate-pulse drop-shadow-[0_0_20px_red] text-center">
          Johnny Knox Goated Monthly
        </h1>

        <p className="text-center text-yellow-400 shadow-md">✅ Minimum Wager Requirement: Players must wager at least $10,000</p>
        <p className="text-center text-lime-300 text-xl uppercase font-bold shadow-md">Ends in: {days}D {hours}H {minutes}M {seconds}S (UTC)</p>
        <p className="text-center text-yellow-400 shadow-md">Total Wagered: ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-center text-yellow-400 text-lg shadow-md">
          If you want to be a part of the action, <a href="https://www.goated.com/r/JOHNNYKNOX" target="_blank" rel="noopener noreferrer" className="text-lime-300 font-bold underline uppercase">JOIN THE TEAM NOW</a>!
        </p>
        <p className="text-center text-gray-400 shadow-md">This leaderboard refreshes automatically every 10–30 minutes.</p>

        <div className="podium">
          {users.slice(0, 3).map((user, index) => {
            const payout = user.total && rewardPool > 0 && totalEligibleWager > 0
              ? (user.total / totalEligibleWager) * rewardPool * 0.6
              : 0;
            const classes = ['gold flaming', 'silver', 'bronze'];
            return (
              <div key={index} className={`podium-card ${classes[index]}`} style={{ transform: 'scale(1.25)' }}>
                <div className="username">{maskName(user.username)}</div>
                <div className="info-section">
                  <div className="wager">Wager: <strong>${user.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                  <div className="payout">Payout: <strong>${payout.toFixed(2)}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto mt-10">
          <table className="w-full max-w-5xl mx-auto border-collapse">
            <thead>
              <tr className="text-yellow-400">
                <th className="border-b-2 border-yellow-400 p-2">Place</th>
                <th className="border-b-2 border-yellow-400 p-2">User</th>
                <th className="border-b-2 border-yellow-400 p-2">Wager</th>
                <th className="border-b-2 border-yellow-400 p-2">Payout</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(3, 10).map((user, index) => {
                const wager = user.total || 0;
                const payout = wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0
                  ? (wager / totalEligibleWager) * rewardPool * 0.6
                  : 0;
                return (
                  <tr key={index}>
                    <td className="text-center p-2">{index + 4}.</td>
                    <td className="text-center p-2">{maskName(user.username)}</td>
                    <td className="text-center p-2">${wager.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-center p-2">${payout.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-yellow-400 text-center mt-8 shadow-md">
          Leaderboard will be paid out within 24 - 48 hours.
        </p>
        <p className="text-yellow-400 text-sm text-center mt-10 shadow-md">
          ⚠ Gamble Responsibly<br />
          Gambling involves risk — play responsibly. Need help? Visit <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" className="underline">BeGambleAware.org</a>.
        </p>
      </div>
    </div>
  );
}
