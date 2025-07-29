import React, { useEffect, useState } from 'react';
import { getAllMyAttendanceRecords } from '../services/userService';
import { getLeaveRequests } from '../services/attendanceService';

const AttendanceProgress: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: 0,
  });

  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const attendanceRecords = await getAllMyAttendanceRecords();
        const leaveRequests = await getLeaveRequests();

        const approvedLeaves = leaveRequests.filter((leave: any) => leave.status === 'Approved');

        const leaveDates = new Set<string>();
        approvedLeaves.forEach((leave: any) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const current = new Date(start);
          while (current <= end) {
            leaveDates.add(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        });

        const today = new Date();
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        let endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        if (activeTab === 'lastMonth') {
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (activeTab === 'quarter') {
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }

        const attendanceByDate = new Map<string, any>();
        attendanceRecords.forEach((record: any) => {
          const dateKey = new Date(record.date).toISOString().split('T')[0];
          attendanceByDate.set(dateKey, record);
        });

        let present = 0;
        let late = 0;
        let absent = 0;
        let leave = 0;

        const current = new Date(startDate);
        while (current <= endDate) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateKey = current.toISOString().split('T')[0];
            const record = attendanceByDate.get(dateKey);

            if (record) {
              if (record.status === 'Present') {
                present++;
                if (new Date(record.clockIn).getHours() > 10) late++;
              } else if (record.status === 'Absent') {
                absent++;
              }
            } else if (leaveDates.has(dateKey)) {
              leave++;
            } else if (current <= today) {
              absent++;
            }
          }
          current.setDate(current.getDate() + 1);
        }

        const total = present + late + leave + absent;

        setAttendanceData({ present, absent, late, leave, total });
      } catch (error) {
        console.error('Error fetching attendance or leave data:', error);
      }
    };

    fetchAllData();
  }, [activeTab]);

  const switchPeriod = (period: string) => setActiveTab(period);

  const percentage = attendanceData.total
    ? Math.round((attendanceData.present / attendanceData.total) * 100)
    : 0;

  const getColorClass = (percent: number) => {
    if (percent >= 90) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderAttendanceDots = () => {
    const dots = [];
    for (let i = 0; i < attendanceData.total; i++) {
      let colorClass = 'bg-gray-300 dark:bg-gray-600';

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
          className={`w-3 h-3 rounded-full ${colorClass} transition-all hover:scale-125 duration-150 cursor-pointer`}
          title={`Day ${i + 1}`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Attendance Overview</h2>
        <div className="flex space-x-2">
          {['current', 'lastMonth', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => switchPeriod(period)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeTab === period
                  ? 'bg-[#255199] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              {period === 'current' ? 'Current' : period === 'lastMonth' ? 'Last Month' : 'Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <StatBox label="Present" value={attendanceData.present} color="green" />
          <StatBox label="Absent" value={attendanceData.absent} color="red" />
          <StatBox label="Late" value={attendanceData.late} color="yellow" />
          <StatBox label="Leave" value={attendanceData.leave} color="blue" />
        </div>

        {/* Circular Graph */}
        <div className="flex justify-center items-center">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                className="text-gray-300 dark:text-gray-600"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={`${getColorClass(percentage)} stroke-current`}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800 dark:text-white">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Overview */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Daily Attendance Overview
        </h3>
        <div className="flex flex-wrap gap-1">{renderAttendanceDots()}</div>

        <div className="flex justify-center mt-4 space-x-4 text-sm text-gray-700 dark:text-gray-300">
          <LegendDot color="green-500" label="Present" />
          <LegendDot color="yellow-400" label="Late" />
          <LegendDot color="blue-400" label="Leave" />
          <LegendDot color="red-400" label="Absent" />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'green' | 'red' | 'yellow' | 'blue';
}) => (
  <div className={`bg-${color}-100 dark:bg-${color}-800 bg-opacity-50 p-3 rounded-lg text-center`}>
    <p className={`text-sm text-${color}-800 dark:text-${color}-100`}>{label}</p>
    <p className={`text-2xl font-bold text-${color}-800 dark:text-${color}-100`}>{value}</p>
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center space-x-1">
    <span className={`w-2 h-2 rounded-full bg-${color}`} />
    <span>{label}</span>
  </div>
);

export default AttendanceProgress;
