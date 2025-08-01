import React, { useEffect, useState } from 'react';
import { getAllMyAttendanceRecords } from '../services/userService';
import { getLeaveRequests } from '../services/attendanceService';

// Interfaces
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

const AttendanceCard: React.FC = () => {
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [attendanceStats, setAttendanceStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
    });
    const [activeTab, setActiveTab] = useState('current');

const getBarHeight = (hour: number) => (hour / 24) * 100;

    const switchPeriod = (period: string) => setActiveTab(period);

    const percentage = attendanceStats.total
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : 0;

    const getColorClass = (percent: number) => {
        if (percent > 80) return 'stroke-green-500';
        if (percent >= 65) return 'stroke-yellow-400';
        return 'stroke-red-500';
    };

    const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWeek(e.target.value);
    };

    const renderAttendanceDots = () => {
        const dots = [];
        for (let i = 0; i < attendanceStats.total; i++) {
            let colorClass = 'bg-gray-300 dark:bg-gray-600';

            if (i < attendanceStats.present) colorClass = 'bg-green-500';
            else if (i < attendanceStats.present + attendanceStats.late) colorClass = 'bg-yellow-400';
            else if (i < attendanceStats.present + attendanceStats.late + attendanceStats.leave) colorClass = 'bg-blue-400';
            else colorClass = 'bg-red-400';

            dots.push(
                <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${colorClass} hover:scale-125 transition-all cursor-pointer`}
                    title={`Day ${i + 1}`}
                />
            );
        }
        return dots;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const attendanceRecords = await getAllMyAttendanceRecords();
                const leaveRequests = await getLeaveRequests();

                // -------------------- Progress Stats --------------------
                const approvedLeaves = leaveRequests.filter((l: any) => l.status === 'Approved');
                const leaveDates = new Set<string>();
                approvedLeaves.forEach((leave: any) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        leaveDates.add(d.toISOString().split('T')[0]);
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
                attendanceRecords.forEach((r: any) => {
                    const dateKey = new Date(r.date).toISOString().split('T')[0];
                    attendanceByDate.set(dateKey, r);
                });

                let present = 0, late = 0, absent = 0, leave = 0;
                const current = new Date(startDate);
                while (current <= endDate) {
                    const day = current.getDay();
                    if (day !== 0 && day !== 6) {
                        const key = current.toISOString().split('T')[0];
                        const record = attendanceByDate.get(key);
                        if (record) {
                            if (record.status === 'Present') {
                                present++;
                                if (new Date(record.clockIn).getHours() > 10) late++;
                            }
                        } else if (leaveDates.has(key)) {
                            leave++;
                        } else if (current <= today) {
                            absent++;
                        }
                    }
                    current.setDate(current.getDate() + 1);
                }

                const total = present + late + leave + absent;
                setAttendanceStats({ present, absent, late, leave, total });

                // -------------------- Weekly Data --------------------
                const groupedByWeek: Record<string, AttendanceData[]> = {};
                const presentDates: Record<string, any> = {};

                for (const record of attendanceRecords) {
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

                    if (!groupedByWeek[week]) groupedByWeek[week] = [];

                    groupedByWeek[week].push({
                        date: dateKey,
                        checkIn: checkInHour ? `${checkInHour.toString().padStart(2, '0')}:00` : '--:--',
                        checkOut: checkOutHour ? `${checkOutHour.toString().padStart(2, '0')}:00` : '--:--',
                        actualHours: checkOutHour !== null ? checkOutHour - checkInHour : 0,
                        isAbsent: false,
                    });
                }

                const currentDay = today.getDate();
                const currentWeek =
                    currentDay <= 7 ? 'week1' :
                        currentDay <= 14 ? 'week2' :
                            currentDay <= 21 ? 'week3' : 'week4';

                const year = today.getFullYear();
                const month = today.getMonth();
                const lastDay = new Date(year, month + 1, 0).getDate();
                const weekly: WeekData[] = [];

                for (let w = 0; w < 4; w++) {
                    const days: AttendanceData[] = [];
                    const start = 1 + w * 7;
                    const end = w === 3 ? lastDay : (w + 1) * 7;

                    for (let d = start; d <= end; d++) {
                        const date = new Date(year, month, d);
                        const dateKey = date.toISOString().slice(0, 10);
                        const dayName = date.getDay();
                        if (dayName === 0 || dayName === 6 || date > today) continue;

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

                    weekly.push({ id: `week${w + 1}`, name: `Week ${w + 1}`, data: days });
                }

                setWeeklyData(weekly);
                setSelectedWeek(currentWeek);
                setAttendanceData(weekly.find(w => w.id === currentWeek)?.data || []);

            } catch (err) {
                console.error("Error:", err);
            }
        };

        fetchData();
    }, [activeTab]);

    useEffect(() => {
        const week = weeklyData.find(w => w.id === selectedWeek);
        if (week) setAttendanceData(week.data);
    }, [selectedWeek]);

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Attendance Overview</h2>
            <div className="flex justify-between items-center">
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

            {/* Stats + Graph */}
            <div className="grid md:grid-cols-3 gap-2">
                <div className="grid grid-cols-4 gap-2 md:col-span-2">
                    <div className="min-w-0">
                        <StatBox label="Present" value={attendanceStats.present} color="green" />
                    </div>
                    <div className="min-w-0">
                        <StatBox label="absent" value={attendanceStats.absent} color="red" />
                    </div>
                    <div className="min-w-0">
                        <StatBox label="late" value={attendanceStats.late} color="yellow" />
                    </div>
                    <div className="min-w-0">
                        <StatBox label="leave" value={attendanceStats.leave} color="blue" />
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="relative w-28 h-28">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle className="text-gray-300 dark:text-gray-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                            <circle
                                className={getColorClass(percentage)}
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

            {/* Dots */}
            <div className="flex flex-wrap gap-1">{renderAttendanceDots()}</div>
            <div className="flex justify-center mt-4 space-x-4 text-sm text-gray-700 dark:text-gray-300">
                <LegendDot color="green-500" label="Present" />
                <LegendDot color="yellow-400" label="Late" />
                <LegendDot color="blue-400" label="Leave" />
                <LegendDot color="red-400" label="Absent" />
            </div>

            {/* Week Selector & Bar Chart */}
            <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Daily Attendance</h2>
                    <select
                        value={selectedWeek}
                        onChange={handleWeekChange}
                        className="appearance-none bg-white border dark:bg-gray-800 border-gray-300 dark:text-gray-100 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none"
                    >
                        {weeklyData.map(week => (
                            <option key={week.id} value={week.id}>{week.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <div className="flex items-end space-x-4 h-[130px] min-w-max pb-2 pt-2">
                        {attendanceData.map((day, index) => (
                            <div key={index} className="flex flex-col items-center relative">
                                {day.isAbsent ? (
                                    <div className="w-16 h-[200px] flex flex-col items-center justify-end">
                                        <div className="w-6 h-6 bg-red-600 rounded"></div>
                                    </div>
                                ) : (
                                    <div className="relative w-16 h-[200px] flex justify-between items-end">
                                        <div className="w-6 bg-[#255199] rounded-t relative" style={{ height: `${getBarHeight(parseInt(day.checkIn))}px` }}>
                                            <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2">{day.checkIn}</span>
                                        </div>
                                        <div className="w-6 bg-green-500 rounded-t relative" style={{ height: `${getBarHeight(parseInt(day.checkOut))}px` }}>
                                            <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2">{day.checkOut}</span>
                                        </div>
                                    </div>
                                )}
                                <span className="text-sm mt-2 text-gray-600">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center space-x-6">
                    <LegendDot color="[#255199]" label="Check-in" />
                    <LegendDot color="green-500" label="Check-out" />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className={`bg-${color}-100 dark:bg-${color}-800 bg-opacity-50 p-2 rounded-lg text-center w-full`}>
        <p className={`text-xs font-medium text-${color}-800 dark:text-${color}-100 truncate`}>
            {label}
        </p>
        <p className={`text-base font-bold text-${color}-800 dark:text-${color}-100`}>
            {value}
        </p>
    </div>
);


const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-1">
        <span className={`w-2 h-2 rounded-full bg-${color}`} />
        <span>{label}</span>
    </div>
);

export default AttendanceCard;
