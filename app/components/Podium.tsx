type User = {
  username?: string;
  total?: number;
};

type PodiumProps = {
  topThree: User[];
  rewardPool: number;
  totalEligibleWager: number;
};

const maskName = (name: string = '') => {
  if (name.length <= 3) return name[0] + '***';
  if (name.length <= 6) return name.slice(0, 2) + '***';
  return name.slice(0, 2) + '***' + name.slice(-1);
};

export default function Podium({ topThree, rewardPool, totalEligibleWager }: PodiumProps) {
  const getTitle = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return 'Runner-Up';
    return 'Almost There';
  };

  const getDisplayName = (index: number, user: User) => {
    if (index === 0) return user.username || '';
    const initial = (user.username || '')[0]?.toUpperCase() || '?';
    return `${getTitle(index)}²${initial}`;
  };

  return (
    <div className="podium">
      {topThree.map((user, index) => {
        const payout = (user.total ?? 0) >= 10000 && rewardPool > 0 && totalEligibleWager > 0
          ? ((user.total ?? 0) / totalEligibleWager) * rewardPool * 0.6
          : 0;

        const classes = ['gold', 'silver', 'bronze'];

        return (
          <div key={index} className={`podium-card ${classes[index]}`}>
            <div className="place-title">
              {index === 0 ? '🥇' : getDisplayName(index, user)}
            </div>
            <div className="username">
              {index === 0 ? user.username : 'Secret'}
            </div>
            <div className="info-section">
              <div className="wager">
                Wager: <strong>${(user.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="payout">
                Payout: <strong>${payout.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
