import React from 'react';

const LeavesSummary: React.FC = () => {
  const leavesData = {
    annual: { total: 20, used: 5, remaining: 15 },
    sick: { total: 10, used: 2, remaining: 8 },
    casual: { total: 5, used: 1, remaining: 4 }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Leaves Summary</h2>
      <div className="space-y-4">
        {Object.entries(leavesData).map(([type, data]) => (
          <div key={type} className="space-y-1">
            <p className="capitalize font-medium">{type} Leave</p>
            <div className="flex justify-between text-sm">
              <span>Total: {data.total}</span>
              <span>Used: {data.used}</span>
              <span>Remaining: {data.remaining}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeavesSummary;