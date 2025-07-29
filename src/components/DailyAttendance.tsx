import React, { useState, useEffect } from 'react';
import { getAllMyAttendanceRecords } from '../services/userService';

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
      const lastDay = new Date(year, month + 1, 0).getDate();

      const currentWeek =
        currentDay <= 7 ? 'week1' :
          currentDay <= 14 ? 'week2' :
            currentDay <= 21 ? 'week3' : 'week4';

      const weeklyData: WeekData[] = [];

      for (let w = 0; w < 4; w++) {
        const days: AttendanceData[] = [];
        const startDay = 1 + w * 7;
        const endDay = w === 3 ? lastDay : (w + 1) * 7;

        for (let d = startDay; d <= endDay; d++) {
          const date = new Date(year, month, d);
          const dateKey = date.toISOString().slice(0, 10);
          const dayName = date.getDay(); // 0 = Sun, 6 = Sat

          if (dayName === 0 || dayName === 6) continue;
          if (date > today) continue;

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
      setSelectedWeek(currentWeek);
      setAttendanceData(weeklyData.find(w => w.id === currentWeek)?.data || []);
    } catch (error) {
      console.error("Error fetching user's attendance", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    const weekData = weeklyData.find(week => week.id === selectedWeek);
    if (weekData) {
      setAttendanceData(weekData.data);
    }
  }, [selectedWeek, weeklyData]);

  const getBarHeight = (hour: number) => {
    const maxVisualHeight = 200;
    return (hour / 24) * maxVisualHeight;
  };


  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(e.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Daily Attendance</h2>
        <div className="relative">
          <select
            value={selectedWeek}
            onChange={handleWeekChange}
            className="appearance-none bg-white border dark:bg-gray-800 border-gray-300 dark:text-gray-100 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-100">Check-In/Out Times</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end space-x-4 h-[440px] min-w-max pb-4 pt-6">
            {attendanceData.map((day, index) => (
              <div key={index} className="flex flex-col items-center relative">
                {day.isAbsent ? (
                  <div className="w-16 h-[200px] flex flex-col items-center justify-end">
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                  </div>
                ) : (
                  <div className="relative w-16 h-[200px] flex justify-between items-end">
                    {/* Check-in (Blue) */}
                    <div
                      className="w-6 bg-[#255199] rounded-t relative"
                      style={{
                        height: `${getBarHeight(parseInt(day.checkIn.split(':')[0]))}px`,
                      }}
                    >
                      <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        {day.checkIn}
                      </span>
                    </div>

                    {/* Check-out (Green) */}
                    <div
                      className="w-6 bg-green-500 rounded-t relative"
                      style={{
                        height: `${getBarHeight(parseInt(day.checkOut.split(':')[0]))}px`,
                      }}
                    >
                      <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2 whitespace-nowrap">
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



        {/* Legend */}
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