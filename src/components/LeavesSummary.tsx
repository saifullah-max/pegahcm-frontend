import React from 'react';

const LeavesSummary: React.FC = () => {
  const leavesData = {
    annual: { total: 20, used: 5, remaining: 15, color: 'emerald' },
    sick: { total: 10, used: 2, remaining: 8, color: 'blue' },
    casual: { total: 5, used: 1, remaining: 4, color: 'amber' }
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-800 dark:text-white">Leaves Summary</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          FY 2023-24
        </span>
      </div>
      
      <div className="grid gap-6">
        {Object.entries(leavesData).map(([type, data]) => {
          const usedPercentage = calculatePercentage(data.used, data.total);
          return (
            <div key={type} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="capitalize font-semibold text-gray-700 dark:text-gray-200">
                  {type} Leave
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-${data.color}-100 text-${data.color}-800 dark:bg-${data.color}-900 dark:text-${data.color}-200`}>
                    {data.remaining} remaining
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${data.color}-500 rounded-full`} 
                    style={{ width: `${usedPercentage}%` }}
                  ></div>
                </div>
                <div className="w-20 text-right text-sm text-gray-500 dark:text-gray-400">
                  {data.used}/{data.total}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full bg-${data.color}-500`}></div>
                  <span>Used: {data.used} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <span>Remaining: {data.remaining} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Total: {data.total} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">Last updated: Today</span>
          <button className="text-[#255199] dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-300 font-medium transition-colors">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeavesSummary;