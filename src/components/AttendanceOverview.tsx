import React, { useEffect, useState } from "react";
import { getAllMyAttendanceRecords } from "../services/userService";
import { getLeaveRequests } from "../services/attendanceService";

interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    leave: number;
    total: number;
}

const AttendanceOverview: React.FC = () => {
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
    });

    const [totalDays, setTotalDays] = useState(0);

    const renderAttendanceDots = () => {
        const dots = [];
        for (let i = 0; i < attendanceStats.total; i++) {
            let colorClass = "bg-gray-300 dark:bg-gray-600";

            if (i < attendanceStats.present) colorClass = "bg-green-500";
            else if (i < attendanceStats.present + attendanceStats.late) colorClass = "bg-yellow-400";
            else if (i < attendanceStats.present + attendanceStats.late + attendanceStats.leave)
                colorClass = "bg-blue-400";
            else colorClass = "bg-red-400";

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

                const approvedLeaves = leaveRequests.filter((l: any) => l.status === "Approved");
                const leaveDates = new Set<string>();
                approvedLeaves.forEach((leave: any) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        leaveDates.add(d.toISOString().split("T")[0]);
                    }
                });

                // Calculate last month start/end
                const today = new Date();
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

                // Filter records only for last month and weekdays
                const filteredRecords = attendanceRecords.filter((r: any) => {
                    const date = new Date(r.date);
                    const day = date.getDay();
                    return date >= lastMonthStart && date <= lastMonthEnd && day !== 0 && day !== 6;
                });

                // Calculate stats
                let present = 0,
                    late = 0,
                    absent = 0,
                    leave = 0;
                const total = filteredRecords.length; // This might need adjustment to include leaves & absent days

                // We should calculate total working days excluding weekends in last month:
                let workingDays = 0;
                for (
                    let d = new Date(lastMonthStart);
                    d <= lastMonthEnd;
                    d.setDate(d.getDate() + 1)
                ) {
                    const day = d.getDay();
                    if (day !== 0 && day !== 6) workingDays++;
                }
                setTotalDays(workingDays);

                // Count present, late, leaves, absent
                filteredRecords.forEach((record: any) => {
                    const clockInHour = new Date(record.clockIn).getHours();
                    present++;
                    if (clockInHour > 10) late++;
                });

                // Count leaves
                for (
                    let d = new Date(lastMonthStart);
                    d <= lastMonthEnd;
                    d.setDate(d.getDate() + 1)
                ) {
                    const dateKey = d.toISOString().split("T")[0];
                    const day = d.getDay();
                    if (day === 0 || day === 6) continue; // Skip weekends
                    if (!filteredRecords.some((r: any) => r.date.startsWith(dateKey))) {
                        if (leaveDates.has(dateKey)) leave++;
                        else absent++;
                    }
                }

                setAttendanceStats({ present, absent, late, leave, total: workingDays });
            } catch (err) {
                console.error("Error fetching attendance overview data:", err);
            }
        };

        fetchData();
    }, []);

    const percentage = attendanceStats.total
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : 0;

    const getColorClass = (percent: number) => {
        if (percent > 80) return "stroke-green-500";
        if (percent >= 65) return "stroke-yellow-400";
        return "stroke-red-500";
    };

    const StatBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div
            className={`bg-${color}-100 dark:bg-${color}-800 bg-opacity-50 p-2 rounded-lg text-center w-full`}
        >
            <p className={`text-xs font-medium text-${color}-800 dark:text-${color}-100 truncate`}>
                {label}
            </p>
            <p className={`text-base font-bold text-${color}-800 dark:text-${color}-100`}>{value}</p>
        </div>
    );

    const LegendDot = ({ color, label }: { color: string; label: string }) => (
        <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full bg-${color}`} />
            <span>{label}</span>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Attendance Overview</h2>

            <div className="grid md:grid-cols-3 gap-2">
                <div className="grid grid-cols-4 gap-2 md:col-span-2">
                    <StatBox label="Present" value={attendanceStats.present} color="green" />
                    <StatBox label="Absent" value={attendanceStats.absent} color="red" />
                    <StatBox label="Late" value={attendanceStats.late} color="yellow" />
                    <StatBox label="Leave" value={attendanceStats.leave} color="blue" />
                </div>
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
        </div>
    );
};

export default AttendanceOverview;
