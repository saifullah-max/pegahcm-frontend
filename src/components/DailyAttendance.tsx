import React, { useState, useEffect } from 'react';
import { getAllMyAttendanceRecords, getTodayAttendance } from '../services/userService';

interface AttendanceData {
  date: string;
  checkIn: string;
  checkOut: string;
  actualHours: number;
  isAbsent: boolean;
}
interface WeekData {
  id: string;
  name: string;
  data: AttendanceData[];
}
interface RawAttendance {
  date: Date;
  clockIn: string;
  clockOut: string | null;
  status: string;
}



const DailyAttendance: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);


  useEffect(() => {
    // Mock data - Replace with actual API call
    // const mockWeeklyData: WeekData[] = [
    //   {
    //     id: 'week1',
    //     name: 'Week 1',
    //     data: [
    //       {
    //         date: '2025-05-01',
    //         checkIn: '09:15',
    //         checkOut: '17:30',
    //         expectedHours: 8,
    //         actualHours: 7.25,
    //         shortfall: 0.75
    //       },
    //       {
    //         date: '2025-05-02',
    //         checkIn: '09:00',
    //         checkOut: '17:00',
    //         expectedHours: 8,
    //         actualHours: 8,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-03',
    //         checkIn: '09:30',
    //         checkOut: '17:15',
    //         expectedHours: 8,
    //         actualHours: 7.75,
    //         shortfall: 0.25
    //       },
    //       {
    //         date: '2025-05-04',
    //         checkIn: '09:00',
    //         checkOut: '17:45',
    //         expectedHours: 8,
    //         actualHours: 8.75,
    //         shortfall: 0
    //       },
    //     ]
    //   },
    //   {
    //     id: 'week2',
    //     name: 'Week 2',
    //     data: [
    //       {
    //         date: '2025-05-08',
    //         checkIn: '09:00',
    //         checkOut: '18:00',
    //         expectedHours: 8,
    //         actualHours: 9,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-09',
    //         checkIn: '09:15',
    //         checkOut: '17:30',
    //         expectedHours: 8,
    //         actualHours: 8.25,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-10',
    //         checkIn: '08:45',
    //         checkOut: '16:30',
    //         expectedHours: 8,
    //         actualHours: 7.75,
    //         shortfall: 0.25
    //       },
    //       {
    //         date: '2025-05-11',
    //         checkIn: '09:30',
    //         checkOut: '18:15',
    //         expectedHours: 8,
    //         actualHours: 8.75,
    //         shortfall: 0
    //       },
    //     ]
    //   },
    //   {
    //     id: 'week3',
    //     name: 'Week 3',
    //     data: [
    //       {
    //         date: '2025-05-15',
    //         checkIn: '08:45',
    //         checkOut: '17:00',
    //         expectedHours: 8,
    //         actualHours: 8.25,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-16',
    //         checkIn: '09:00',
    //         checkOut: '16:45',
    //         expectedHours: 8,
    //         actualHours: 7.75,
    //         shortfall: 0.25
    //       },
    //       {
    //         date: '2025-05-17',
    //         checkIn: '09:15',
    //         checkOut: '18:00',
    //         expectedHours: 8,
    //         actualHours: 8.75,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-18',
    //         checkIn: '09:30',
    //         checkOut: '17:30',
    //         expectedHours: 8,
    //         actualHours: 8,
    //         shortfall: 0
    //       },
    //     ]
    //   },
    //   {
    //     id: 'week4',
    //     name: 'Week 4',
    //     data: [
    //       {
    //         date: '2025-05-22',
    //         checkIn: '09:00',
    //         checkOut: '17:15',
    //         expectedHours: 8,
    //         actualHours: 8.25,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-23',
    //         checkIn: '08:45',
    //         checkOut: '16:30',
    //         expectedHours: 8,
    //         actualHours: 7.75,
    //         shortfall: 0.25
    //       },
    //       {
    //         date: '2025-05-24',
    //         checkIn: '09:15',
    //         checkOut: '18:00',
    //         expectedHours: 8,
    //         actualHours: 8.75,
    //         shortfall: 0
    //       },
    //       {
    //         date: '2025-05-25',
    //         checkIn: '09:30',
    //         checkOut: '17:45',
    //         expectedHours: 8,
    //         actualHours: 8.25,
    //         shortfall: 0
    //       },
    //     ]
    //   }
    // ];

    // setWeeklyData(mockWeeklyData);
    // setAttendanceData(mockWeeklyData.find(week => week.id === selectedWeek)?.data || []);
  }, []);

  const fetchAttendance = async () => {
    try {
      const records = await getAllMyAttendanceRecords();

      const groupedByWeek: Record<string, AttendanceData[]> = {};
      const presentDates: Record<string, RawAttendance> = {};

      for (const record of records) {
        const d = new Date(record.date);
        const dateKey = d.toISOString().slice(0, 10);
        presentDates[dateKey] = record;

        const dayOfMonth = d.getDate();
        const week =
          dayOfMonth <= 7 ? 'week1' :
            dayOfMonth <= 14 ? 'week2' :
              dayOfMonth <= 21 ? 'week3' : 'week4';

        const checkInHour = new Date(record.clockIn).getHours();
        const checkOutHour = record.clockOut ? new Date(record.clockOut).getHours() : null;

        if (!groupedByWeek[week]) {
          groupedByWeek[week] = [];
        }

        groupedByWeek[week].push({
          date: dateKey,
          checkIn: checkInHour !== null ? `${checkInHour.toString().padStart(2, '0')}:00` : '--:--',
          checkOut: checkOutHour !== null ? `${checkOutHour.toString().padStart(2, '0')}:00` : '--:--',
          actualHours: checkOutHour !== null && checkInHour !== null ? checkOutHour - checkInHour : 0,
          isAbsent: false,
        });
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const currentDay = today.getDate();
      const currentWeek =
        currentDay <= 7 ? 'week1' :
          currentDay <= 14 ? 'week2' :
            currentDay <= 21 ? 'week3' : 'week4';

      const weeklyData = [];

      for (let w = 0; w < 4; w++) {
        const days: AttendanceData[] = [];

        for (let d = 1 + w * 7; d <= Math.min((w + 1) * 7, 31); d++) {
          const date = new Date(year, month, d);
          const dateKey = date.toISOString().slice(0, 10);

          const dayName = date.getDay(); // 0 = Sun, 6 = Sat
          if (dayName === 0 || dayName === 6) continue;

          if (date > today) continue; // 🛑 Skip future dates

          if (presentDates[dateKey]) {
            const rec = presentDates[dateKey];
            const checkIn = new Date(rec.clockIn).getHours();
            const checkOut = rec.clockOut ? new Date(rec.clockOut).getHours() : null;

            days.push({
              date: dateKey,
              checkIn: `${checkIn.toString().padStart(2, '0')}:00`,
              checkOut: checkOut !== null ? `${checkOut.toString().padStart(2, '0')}:00` : '--:--',
              actualHours: checkOut !== null ? checkOut - checkIn : 0,
              isAbsent: false,
            });
          } else {
            days.push({
              date: dateKey,
              checkIn: '--:--',
              checkOut: '--:--',
              actualHours: 0,
              isAbsent: true,
            });
          }
        }

        weeklyData.push({
          id: `week${w + 1}`,
          name: `Week ${w + 1}`,
          data: days,
        });
      }

      setWeeklyData(weeklyData);
      setSelectedWeek(currentWeek); // ✅ Auto select current week
      setAttendanceData(weeklyData.find(w => w.id === currentWeek)?.data || []);
    } catch (error) {
      console.error("Error fetching user's attendance", error);
    }
  };


  useEffect(() => {
    fetchAttendance();
  }, [])


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
                {day.isAbsent ? (
                  <div className="w-16 h-full flex flex-col items-center justify-end">
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                  </div>
                ) : (
                  <div className="relative w-16 h-full flex items-end">
                    <div
                      className="w-6 bg-[#255199] rounded-t absolute left-0"
                      style={{
                        height: `${getBarHeight(parseInt(day.checkIn.split(':')[0]))}px`,
                        bottom: 0
                      }}
                    >
                      <span className="absolute -top-6 text-xs transform -translate-x-1/2 left-1/2 whitespace-nowrap">
                        {day.checkIn}
                      </span>
                    </div>
                    <div
                      className="w-6 bg-green-500 rounded-t absolute right-0"
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
                )}
                <span className="text-sm mt-2 text-gray-600 whitespace-nowrap">{day.date}</span>
              </div>
            ))}


          </div>
        </div>

        {/* Simple Legend just for check-in/out */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#255199] rounded mr-2"></div>
            <span className="text-sm text-gray-600">Check-in</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Check-out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;