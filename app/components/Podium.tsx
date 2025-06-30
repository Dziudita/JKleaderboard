import React from 'react';

const Podium = ({ topThree }: { topThree: { name: string, wager: string, payout: string }[] }) => {
  return (
    <div className="podium-container">
      {topThree.map((user, index) => {
        const position = index + 1;
        const isFirst = index === 0;
        const title = isFirst ? user.name : index === 1 ? 'Runner-Up' : 'Almost There';
        const className = isFirst ? 'gold' : index === 1 ? 'silver' : 'bronze';

        return (
          <div key={index} className={`podium-card ${className}`}>
            <div className="podium-rank">{position}</div>
            <div className="podium-name">{title}</div>
            <div className="podium-wager">Wager: <span>${user.wager}</span></div>
            <div className="podium-payout">Payout: <span>${user.payout}</span></div>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;
