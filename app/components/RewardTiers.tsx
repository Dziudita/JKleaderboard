import React from "react";

const rewardData = [
  { wager: 50000, reward: 143 },
  { wager: 100000, reward: 285 },
  { wager: 200000, reward: 570 },
  { wager: 300000, reward: 855 },
  { wager: 400000, reward: 1140 },
  { wager: 500000, reward: 1425 },
  { wager: 750000, reward: 2138 },
  { wager: 1000000, reward: 2850 },
  { wager: 1250000, reward: 3563 },
  { wager: 1500000, reward: 4275 },
  { wager: 1750000, reward: 4988 },
  { wager: 2000000, reward: 5700 },
  { wager: 2500000, reward: 7125 },
  { wager: 3000000, reward: 8550 },
  { wager: 3500000, reward: 9975 },
  { wager: 4000000, reward: 11400 },
  { wager: 4500000, reward: 12825 },
  { wager: 5000000, reward: 14250 },
];

const RewardTiers = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">Monthly Wager Rewards</h2>
      <table className="min-w-full bg-black text-white border border-yellow-400">
        <thead>
          <tr className="text-yellow-400 border-b border-yellow-400">
            <th className="py-2 px-4 text-left">Monthly Wager</th>
            <th className="py-2 px-4 text-left">Reward</th>
          </tr>
        </thead>
        <tbody>
          {rewardData.map((item, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="py-2 px-4">${item.wager.toLocaleString()}</td>
              <td className="py-2 px-4">${item.reward.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardTiers;
