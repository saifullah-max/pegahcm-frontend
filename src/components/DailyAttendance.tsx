import React, { useState, useEffect } from 'react';

interface AttendanceData {
  date: string;
  checkIn: string;
  checkOut: string;
  expectedHours: number;
  actualHours: number;
  shortfall: number;
}

interface WeekData {
  id: string;
  name: string;
  data: AttendanceData[];
}

const DailyAttendance: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>('week1');
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockWeeklyData: WeekData[] = [
      {
        id: 'week1',
        name: 'Week 1',
        data: [
          {
            date: '2025-05-01',
            checkIn: '09:15',
            checkOut: '17:30',
            expectedHours: 8,
            actualHours: 7.25,
            shortfall: 0.75
          },
          {
            date: '2025-05-02',
            checkIn: '09:00',
            checkOut: '17:00',
            expectedHours: 8,
            actualHours: 8,
            shortfall: 0
          },
          {
            date: '2025-05-03',
            checkIn: '09:30',
            checkOut: '17:15',
            expectedHours: 8,
            actualHours: 7.75,
            shortfall: 0.25
          },
          {
            date: '2025-05-04',
            checkIn: '09:00',
            checkOut: '17:45',
            expectedHours: 8,
            actualHours: 8.75,
            shortfall: 0
          },
        ]
      },
      {
        id: 'week2',
        name: 'Week 2',
        data: [
          {
            date: '2025-05-08',
            checkIn: '09:00',
            checkOut: '18:00',
            expectedHours: 8,
            actualHours: 9,
            shortfall: 0
          },
          {
            date: '2025-05-09',
            checkIn: '09:15',
            checkOut: '17:30',
            expectedHours: 8,
            actualHours: 8.25,
            shortfall: 0
          },
          {
            date: '2025-05-10',
            checkIn: '08:45',
            checkOut: '16:30',
            expectedHours: 8,
            actualHours: 7.75,
            shortfall: 0.25
          },
          {
            date: '2025-05-11',
            checkIn: '09:30',
            checkOut: '18:15',
            expectedHours: 8,
            actualHours: 8.75,
            shortfall: 0
          },
        ]
      },
      {
        id: 'week3',
        name: 'Week 3',
        data: [
          {
            date: '2025-05-15',
            checkIn: '08:45',
            checkOut: '17:00',
            expectedHours: 8,
            actualHours: 8.25,
            shortfall: 0
          },
          {
            date: '2025-05-16',
            checkIn: '09:00',
            checkOut: '16:45',
            expectedHours: 8,
            actualHours: 7.75,
            shortfall: 0.25
          },
          {
            date: '2025-05-17',
            checkIn: '09:15',
            checkOut: '18:00',
            expectedHours: 8,
            actualHours: 8.75,
            shortfall: 0
          },
          {
            date: '2025-05-18',
            checkIn: '09:30',
            checkOut: '17:30',
            expectedHours: 8,
            actualHours: 8,
            shortfall: 0
          },
        ]
      },
      {
        id: 'week4',
        name: 'Week 4',
        data: [
          {
            date: '2025-05-22',
            checkIn: '09:00',
            checkOut: '17:15',
            expectedHours: 8,
            actualHours: 8.25,
            shortfall: 0
          },
          {
            date: '2025-05-23',
            checkIn: '08:45',
            checkOut: '16:30',
            expectedHours: 8,
            actualHours: 7.75,
            shortfall: 0.25
          },
          {
            date: '2025-05-24',
            checkIn: '09:15',
            checkOut: '18:00',
            expectedHours: 8,
            actualHours: 8.75,
            shortfall: 0
          },
          {
            date: '2025-05-25',
            checkIn: '09:30',
            checkOut: '17:45',
            expectedHours: 8,
            actualHours: 8.25,
            shortfall: 0
          },
        ]
      }
    ];
    
    setWeeklyData(mockWeeklyData);
    setAttendanceData(mockWeeklyData.find(week => week.id === selectedWeek)?.data || []);
  }, []);

  useEffect(() => {
    const weekData = weeklyData.find(week => week.id === selectedWeek);
    if (weekData) {
      setAttendanceData(weekData.data);
    }
  }, [selectedWeek, weeklyData]);

  const getBarHeight = (hours: number) => {
    const maxHeight = 150; // Increased height for better visibility
    return (hours / 10) * maxHeight; // Using 10 as max scale for better proportion
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(e.target.value);
  };

  return (
    <div className="bg-gradient-to-tr from-slate-50 to-white p-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-gray-800">Daily Attendance</h2>
        <div className="relative">
          <select 
            value={selectedWeek}
            onChange={handleWeekChange}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {weeklyData.map(week => (
              <option key={week.id} value={week.id}>{week.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-grow"></div>

      {/* Time Bars Section - Moved to bottom */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Check-In/Out Times</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end space-x-4 h-[180px] min-w-max pb-2">
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
                    <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2 whitespace-nowrap">
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
                    <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2 whitespace-nowrap">
                      {day.checkOut}
                    </span>
                  </div>
                </div>
                <span className="text-sm mt-2 text-gray-600 whitespace-nowrap">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Simple Legend just for check-in/out */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Check-in</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Check-out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;