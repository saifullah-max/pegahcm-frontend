import React, { useState, useEffect } from 'react';

interface AttendanceData {
  date: string;
  checkIn: string;
  checkOut: string;
  expectedHours: number;
  actualHours: number;
  shortfall: number;
}

const DailyAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockData = [
      {
        date: '2025-05-07',
        checkIn: '09:15',
        checkOut: '17:30',
        expectedHours: 8,
        actualHours: 7.25,
        shortfall: 0.75
      },
      {
        date: '2025-05-08',
        checkIn: '09:00',
        checkOut: '17:00',
        expectedHours: 8,
        actualHours: 8,
        shortfall: 0
      },
      {
        date: '2025-05-09',
        checkIn: '09:30',
        checkOut: '17:15',
        expectedHours: 8,
        actualHours: 7.75,
        shortfall: 0.25
      },
      {
        date: '2025-05-10',
        checkIn: '09:00',
        checkOut: '17:45',
        expectedHours: 8,
        actualHours: 8.75,
        shortfall: 0
      },
    ];
    setAttendanceData(mockData);
  }, []);

  const getBarHeight = (hours: number) => {
    const maxHeight = 10; 
    return (hours / 8) * maxHeight;
  };

  return (
    <div className="bg-gradient-to-tr from-slate-50 to-white p-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <h2 className="text-2xl mb-6 text-gray-800">Daily Attendance Overview</h2>

      {/* Time Bars Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Check-In/Out Times</h3>
        <div className="flex items-end space-x-8 h-[200px]">
          {attendanceData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-16 h-full flex items-end">
                {/* Check-in bar */}
                <div 
                  className="w-6 bg-blue-400 rounded-t absolute left-0"
                  style={{ 
                    height: `${getBarHeight(parseInt(day.checkIn.split(':')[0]))}px`,
                    bottom: 0 
                  }}
                >
                  <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2">
                    {day.checkIn}
                  </span>
                </div>
                {/* Check-out bar */}
                <div 
                  className="w-6 bg-green-400 rounded-t absolute right-0"
                  style={{ 
                    height: `${getBarHeight(parseInt(day.checkOut.split(':')[0]))}px`,
                    bottom: 0 
                  }}
                >
                  <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2">
                    {day.checkOut}
                  </span>
                </div>
              </div>
              <span className="text-sm mt-2 text-gray-600">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hours Summary Section */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Hours Summary</h3>
        <div className="flex items-end space-x-8 h-[200px]">
          {attendanceData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-24 h-full flex items-end justify-center space-x-1">
                {/* Expected Hours */}
                <div 
                  className="w-6 bg-purple-400 rounded-t"
                  style={{ height: `${getBarHeight(day.expectedHours)}px` }}
                >
                  <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2">
                    {/* {day.expectedHours}h */}
                  </span>
                </div>
                {/* Actual Hours */}
                <div 
                  className="w-6 bg-indigo-400 rounded-t"
                  style={{ height: `${getBarHeight(day.actualHours)}px` }}
                >
                  <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2">
                    {day.actualHours}h
                  </span>
                </div>

                {/* Shortfall */}
                {day.shortfall > 0 && (
                  <div 
                    className="w-6 bg-red-400 rounded-t"
                    style={{ height: `${getBarHeight(day.shortfall)}px` }}
                  >
                    <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2">
                      {/* -{day.shortfall}h */}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm mt-2 text-gray-600">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Check-in</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Check-out</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Expected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Actual</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Shortfall</span>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;