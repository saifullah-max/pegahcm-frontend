import React, { useState } from 'react';

const AttendanceProgress: React.FC = () => {
  // Sample data for the current month
  const defaultAttendance = {
    present: 18,
    absent: 2,
    late: 3,
    leave: 1,
    total: 24,
  };

  const [attendanceData, setAttendanceData] = useState(defaultAttendance);
  const [activeTab, setActiveTab] = useState('current');

  // Calculate percentage
  const percentage = Math.round((attendanceData.present / attendanceData.total) * 100);
  
  // Demo data for different time periods
  const switchPeriod = (period: string) => {
    setActiveTab(period);
    
    if (period === 'current') {
      setAttendanceData(defaultAttendance);
    } else if (period === 'lastMonth') {
      setAttendanceData({
        present: 20,
        absent: 1,
        late: 2,
        leave: 0,
        total: 23,
      });
    } else if (period === 'quarter') {
      setAttendanceData({
        present: 58,
        absent: 5,
        late: 7,
        leave: 2,
        total: 72,
      });
    }
  };

  // Get color based on percentage
  const getColorClass = (percent: number) => {
    if (percent >= 90) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Generate day dots for visual calendar representation
  const renderAttendanceDots = () => {
    const dots = [];
    for (let i = 0; i < attendanceData.total; i++) {
      let colorClass = 'bg-gray-200';
      
      if (i < attendanceData.present) {
        colorClass = 'bg-green-500';
      } else if (i < attendanceData.present + attendanceData.late) {
        colorClass = 'bg-yellow-400';
      } else if (i < attendanceData.present + attendanceData.late + attendanceData.leave) {
        colorClass = 'bg-blue-400';
      } else {
        colorClass = 'bg-red-400';
      }
      
      dots.push(
        <div 
          key={i}
          className={`w-3 h-3 rounded-full ${colorClass} transition-all hover:scale-150 cursor-pointer`}
          title={`Day ${i+1}`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl  text-gray-800">Attendance Overview</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => switchPeriod('current')}
            className={`px-3 py-1 text-sm rounded-full ${activeTab === 'current' 
              ? 'bg-[#255199] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Current
          </button>
          <button 
            onClick={() => switchPeriod('lastMonth')}
            className={`px-3 py-1 text-sm rounded-full ${activeTab === 'lastMonth' 
              ? 'bg-[#255199] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Month
          </button>
          <button 
            onClick={() => switchPeriod('quarter')}
            className={`px-3 py-1 text-sm rounded-full ${activeTab === 'quarter' 
              ? 'bg-[#255199] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Quarter
          </button>
        </div>
      </div>
      
      {/* Main attendance card */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Stats */}
          <div className="space-y-4 mb-4 md:mb-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-green-100 p-2 rounded-lg text-center">
                <p className="text-sm text-green-800">Present</p>
                <p className="text-xl font-bold text-green-800">{attendanceData.present}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg text-center">
                <p className="text-sm text-red-800">Absent</p>
                <p className="text-xl font-bold text-red-800">{attendanceData.absent}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg text-center">
                <p className="text-sm text-yellow-800">Late</p>
                <p className="text-xl font-bold text-yellow-800">{attendanceData.late}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg text-center">
                <p className="text-sm text-blue-800">Leave</p>
                <p className="text-xl font-bold text-blue-800">{attendanceData.leave}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-700">Attendance Rate</p>
                <p className="text-sm font-bold text-[#255199]">{percentage}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${getColorClass(percentage)} h-3 rounded-full transition-all duration-500 ease-in-out`} 
                  style={{ width: `${percentage}%` }}
                >
                </div>
              </div>
            </div>
          </div>
          
          {/* Circular progress */}
          <div className="relative w-32 h-32 mx-auto md:mx-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200" 
                strokeWidth="10" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className={`text-${getColorClass(percentage).substring(3)}`} 
                strokeWidth="10" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance visualization */}
      <div className="bg-white border border-gray-100 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Daily Attendance Overview</h3>
        <div className="flex flex-wrap gap-1.5">
          {renderAttendanceDots()}
        </div>
        <div className="flex justify-center mt-3 text-xs space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div>
            <span>Late</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
            <span>Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
            <span>Absent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProgress;