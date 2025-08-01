import React, { useEffect, useState } from 'react';
import {
  checkInAttendance,
  checkOutAttendance,
  endBreak,
  getEmployeeById,
  getTodayAttendance,
  startBreak,
} from '../services/userService';
import { LogIn, LogOut, Check } from 'lucide-react';
import { useSelector } from 'react-redux';

const AttendanceMarker: React.FC = () => {
  const userId = useSelector((state: any) => state.auth?.user?.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [currentBreakType, setCurrentBreakType] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [breakSegments, setBreakSegments] = useState<{ start: Date; end?: Date }[]>([]);
  const [barPercent, setBarPercent] = useState(0);


  useEffect(() => {

    const fetchEmployee = async () => {
      try {
        if (!userId) return;
        const { employee } = await getEmployeeById(userId);
        if (employee.shiftId) setShiftId(employee.shiftId);
      } catch (error) {
        console.error("Failed to fetch employee shiftId");
      }
    };

    fetchEmployee();
  }, [userId]);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!userId) return;
      try {
        const today = await getTodayAttendance();

        if (today.checkedIn) {
          setIsCheckedIn(true);
          if (today.attendance?.clockIn) {
            const clockIn = new Date(today.attendance.clockIn);
            setCheckInTime(clockIn.toLocaleTimeString());
            setSessionStartTime(clockIn);
          }
        }

        if (today.checkedOut) {
          setIsCheckedOut(true);
          if (today.attendance?.clockOut) {
            setCheckOutTime(new Date(today.attendance.clockOut).toLocaleTimeString());
          }
        }

        const pastBreaks = today.attendance?.breaks || [];
        const formattedBreaks = pastBreaks
          .filter((b: any) => b.breakStart && b.breakEnd)
          .map((b: any) => ({
            start: new Date(b.breakStart),
            end: new Date(b.breakEnd),
          }));

        setBreakSegments(formattedBreaks);

        if (today.activeBreak) {
          setIsOnBreak(true);
          setCurrentBreakType(today.activeBreak.breakType.name);
          setBreakStartTime(new Date(today.activeBreak.breakStart).toLocaleTimeString());

          // Append ongoing break segment
          setBreakSegments(prev => [
            ...formattedBreaks,
            { start: new Date(today.activeBreak!.breakStart) },
          ]);
        }

      } catch (error) {
        console.error('Error fetching today attendance:', error);
      }
    };
    fetchTodayAttendance();
  }, [userId]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCheckedIn || !sessionStartTime) return;

      const now = new Date().getTime();
      const sessionStart = sessionStartTime.getTime();
      const elapsed = now - sessionStart;

      const maxDuration = 9 * 60 * 60 * 1000; // 9 hours in ms
      const percent = (elapsed / maxDuration) * 100;

      setBarPercent(Math.min(percent, 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, sessionStartTime]);




  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    const formattedTime = new Date().toLocaleTimeString();
    try {
      setErrorMessage(null);
      if (!userId || !shiftId) throw new Error("Missing userId or shiftId");
      await checkInAttendance(userId, shiftId);
      setCheckInTime(formattedTime);
      setSessionStartTime(new Date());
      setIsCheckedIn(true);
    } catch (error: any) {
      console.error("Check-in failed:", error);
      if (error.response?.status === 400 && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Already checked in today");
        setTimeout(() => setErrorMessage(null), 4000);
      }
    }
  };

  const handleCheckOut = async () => {
    const formattedTime = new Date().toLocaleTimeString();
    try {
      await checkOutAttendance();
      setCheckOutTime(formattedTime);
      setIsCheckedOut(true);
    } catch (error) {
      console.error("Check-out failed:", error);
    }
  };

  const handleStartBreak = async (breakType: string) => {
    try {
      if (isOnBreak) {
        setErrorMessage("You are already on a break.");
        return;
      }
      await startBreak(breakType);
      setIsOnBreak(true);
      setCurrentBreakType(breakType);
      setBreakStartTime(new Date().toLocaleTimeString());
      setBreakSegments(prev => [...prev, { start: new Date() }]);
    } catch (error) {
      console.error("Failed to start break", error);
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreak();
      setIsOnBreak(false);
      setCurrentBreakType(null);
      setBreakStartTime(null);
      setBreakSegments(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && !last.end) last.end = new Date();
        return updated;
      });

    } catch (error) {
      console.error("Failed to end break", error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Attendance</h2>
        <div className="text-right">
          <p className="font-medium">{currentDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentTime}</p>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-100 text-sm text-red-800 dark:bg-red-200 dark:text-red-900">
          {errorMessage}
        </div>
      )}

      {/* Check In / Check Out Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Check-In */}
        <div className={`p-5 rounded-xl transition-all duration-300 ${isCheckedIn ? 'bg-blue-100 dark:bg-blue-950 border-2 border-blue-600' : 'bg-gray-50 dark:bg-gray-800 border'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Check In</h3>
              {checkInTime && <p className="text-blue-600 dark:text-blue-400 text-sm">Recorded at {checkInTime}</p>}
            </div>
            <div>
              {isCheckedIn ? (
                <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                  <LogIn />
                </div>
              ) : (
                <button onClick={handleCheckIn} className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow">
                  <LogOut />
                </button>
              )}
            </div>
          </div>
          {!isCheckedIn && (
            <button onClick={handleCheckIn} className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              <LogIn className="h-5 w-5 inline-block mr-2" /> Check In Now
            </button>
          )}
        </div>

        {/* Check-Out */}
        <div className={`p-5 rounded-xl transition-all duration-300 ${isCheckedOut ? 'bg-amber-100 dark:bg-amber-950 border-2 border-amber-500' : 'bg-gray-50 dark:bg-gray-800 border'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Check Out</h3>
              {checkOutTime && <p className="text-amber-600 dark:text-amber-400 text-sm">Recorded at {checkOutTime}</p>}
            </div>
            <div>
              {isCheckedOut ? (
                <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <Check />
                </div>
              ) : (
                <button onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut} className={`h-10 w-10 rounded-full flex items-center justify-center ${!isCheckedIn || isCheckedOut ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow'}`}>
                  <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <button onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut} className={`mt-4 w-full py-2 rounded-lg transition ${!isCheckedIn || isCheckedOut ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow'}`}>
            Check Out Now
          </button>
        </div>
      </div>

      {/* Break Management */}
      <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 mb-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">Break Management</h3>
        {isOnBreak ? (
          <div className="space-y-2">
            <p>On break: <span className="font-medium">{currentBreakType}</span> since {breakStartTime}</p>
            <button
              onClick={handleEndBreak}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow"
            >
              End Break
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Start a break:</p>
            <button
              onClick={() => handleStartBreak("Lunch")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
            >
              Start Lunch Break
            </button>
          </>
        )}

      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-6 relative">
        {(() => {
          const now = isCheckedOut && checkOutTime
            ? (() => {
              const [h, m, s] = checkOutTime.split(":").map(Number);
              const d = new Date();
              d.setHours(h, m, s, 0);
              return d;
            })()
            : new Date();

          const segments = [];
          const breaks = [...breakSegments];

          if (isOnBreak && breaks.length > 0) {
            breaks[breaks.length - 1] = {
              ...breaks[breaks.length - 1],
              end: now,
            };
          }

          let pointer = sessionStartTime;
          if (!pointer) return null;

          for (let i = 0; i < breaks.length; i++) {
            const b = breaks[i];
            if (b.start > pointer) {
              segments.push({
                type: 'work',
                start: pointer,
                end: b.start,
              });
            }
            if (b.end) {
              segments.push({
                type: 'break',
                start: b.start,
                end: b.end,
              });
              pointer = b.end;
            }
          }

          if (pointer < now) {
            segments.push({
              type: 'work',
              start: pointer,
              end: now,
            });
          }

          const shiftDuration = 9 * 60 * 60 * 1000;
          const totalDuration = shiftDuration;
          const sessionStartMs = sessionStartTime!.getTime();

          return segments.map((seg, idx) => {
            const segStart = seg.start.getTime();
            const segEnd = seg.end!.getTime();
            const leftPct = ((segStart - sessionStartMs) / totalDuration) * 100;
            const widthPct = ((segEnd - segStart) / totalDuration) * 100;

            const color = seg.type === 'work' ? 'bg-green-500' : 'bg-yellow-400';

            // Rounded edges only on first and last segments
            const roundedClass = [
              idx === 0 ? 'rounded-l-full' : '',
              idx === segments.length - 1 ? 'rounded-r-full' : ''
            ].join(' ');

            return (
              <div
                key={idx}
                className={`absolute top-0 h-full ${color} ${roundedClass}`}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
              />
            );
          });
        })()}
      </div>


      {/* Status */}
      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Today's Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCheckedIn ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
            Check-in status: {isCheckedIn ? 'Completed' : 'Pending'}
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCheckedOut ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
            Check-out status: {isCheckedOut ? 'Completed' : 'Pending'}
          </div>
          {isCheckedIn && checkInTime && (
            <div className="flex items-center pt-2">
              <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session: {isCheckedOut
                ? (() => {
                  const [h1, m1, s1] = checkInTime.split(":").map(Number);
                  const [h2, m2, s2] = checkOutTime!.split(":").map(Number);
                  const start = new Date();
                  const end = new Date();
                  start.setHours(h1, m1, s1, 0);
                  end.setHours(h2, m2, s2, 0);
                  const diff = end.getTime() - start.getTime();
                  const hrs = Math.floor(diff / 3600000);
                  const mins = Math.floor((diff % 3600000) / 60000);
                  return `${checkInTime} - ${checkOutTime} (${hrs} hrs ${mins} mins)`;
                })()
                : `Started at ${checkInTime}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarker;
