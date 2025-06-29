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
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <div className="jk-coins-background">
        {/* Floating coins */}
      </div>

      <div className="dice-background">
        <div className="dice dice-left" />
        <div className="dice dice-right" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px', color: '#fff', fontFamily: 'Arial' }}>
        <div className="w-full flex justify-center">
          <div>
           <div style={{ textAlign: 'center', marginBottom: '20px' }}>
  <h1 style={{
    color: '#f7c000',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
    margin: 0,
    letterSpacing: '1px',
  }}>
    JOHNNYKNOX
  </h1>
  <h2 style={{
    color: '#f7c000',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadow: '0 0 8px #f7c000, 0 0 12px #ff9900',
    animation: 'pulseGlow 2s ease-in-out infinite',
    marginTop: '2px',
    letterSpacing: '2px'
  }}>
    GOATED MONTHLY
  </h2>
</div>

<style jsx>{
  @keyframes pulseGlow {
    0% {
      text-shadow: 0 0 8px #f7c000, 0 0 12px #ff9900;
    }
    50% {
      text-shadow: 0 0 16px #fff700, 0 0 24px #ff6600;
    }
    100% {
      text-shadow: 0 0 8px #f7c000, 0 0 12px #ff9900;
    }
  }
`}</style>


            <div className="podium">
              {users.slice(0, 3).map((user, index) => {
                const payout = user.total && rewardPool > 0 && totalEligibleWager > 0 ? (user.total / totalEligibleWager) * rewardPool * 0.6 : 0;
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

            {/* Flex layout: table (left) + info box (right) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px', flexWrap: 'wrap' }}>
              <div style={{ width: '480px', background: 'rgba(0,0,0,0.5)', border: '2px solid gold', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
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
                      const payout = wager >= 10000 && rewardPool > 0 && totalEligibleWager > 0 ? (wager / totalEligibleWager) * rewardPool * 0.6 : 0;
                      return (
                        <tr key={index}>
                          <td style={{ textAlign: 'center', padding: '10px' }}>{index + 4}.</td>
                          <td style={{ textAlign: 'center', padding: '10px' }}>{maskName(user.username)}</td>
                          <td style={{ textAlign: 'center', padding: '10px' }}>${wager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ textAlign: 'center', padding: '10px' }}>${payout.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ width: '480px', background: 'linear-gradient(to bottom, #222, #000)', border: '2px solid #f7c000', borderRadius: '12px', padding: '20px', color: '#f7c000', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
                <p>✅ <strong>Minimum Wager:</strong> $10,000</p>
                <p>⏳ <strong>Ends in:</strong> {days}D {hours}H {minutes}M {seconds}S (UTC)</p>
                <p>🔥 <strong>Total Wagered:</strong> ${totalWager.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p style={{ marginTop: '10px' }}>📢 <a href="https://www.goated.com/r/JOHNNYKNOX" target="_blank" rel="noopener noreferrer" style={{ color: '#ff2a2a', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>JOIN THE TEAM NOW</a></p>
                <p style={{ color: '#aaa', marginTop: '10px' }}>⟳ Leaderboard refreshes every 10–30 minutes</p>
              </div>
            </div>

            <p style={{ color: '#f7c000', textAlign: 'center', marginTop: '30px', textShadow: '2px 2px 5px rgba(0,0,0,0.8)' }}>
              Leaderboard will be paid out within 24 - 48 hours.
            </p>
            <p style={{ color: '#f7c000', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px', textShadow: '2px 2px 5px rgba(0,0,0,0.8)' }}>
              ⚠ Gamble Responsibly<br />
              <span style={{ color: '#f7c000', textShadow: '2px 2px 5px rgba(0,0,0,0.8)' }}>
                Gambling involves risk — play responsibly. Need help? Visit <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#f7c000', textDecoration: 'underline' }}>BeGambleAware.org</a>.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
