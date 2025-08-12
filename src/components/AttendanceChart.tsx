import React, { useEffect, useState } from "react";
import { getAllMyAttendanceRecords } from "../services/userService";
import { getLeaveRequests } from "../services/attendanceService";

interface AttendanceData {
    date: string;
    checkIn: string;
    checkOut: string;
    actualHours: number;
    isAbsent: boolean;
}

const getBarHeight = (hour: number) => (hour / 24) * 320;

const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-1">
        <span className={`w-2 h-2 rounded-full bg-${color}`} />
        <span>{label}</span>
    </div>
);

const AttendanceChart: React.FC = () => {
    // State to hold attendance data
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    // State to hold selected month option
    const [selectedMonth, setSelectedMonth] = useState<"current" | "last">("current");

    // Helper: get start and end dates for selected month
    const getMonthRange = (type: "current" | "last") => {
        const today = new Date();
        if (type === "current") {
            return {
                start: new Date(today.getFullYear(), today.getMonth(), 1),
                end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            };
        } else {
            return {
                start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                end: new Date(today.getFullYear(), today.getMonth(), 0),
            };
        }
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

                const today = new Date();
                const { start: monthStart, end: monthEnd } = getMonthRange(selectedMonth);

                // Map records by date within selected month
                const attendanceByDate = new Map<string, any>();
                attendanceRecords.forEach((r: any) => {
                    const dateKey = new Date(r.date).toISOString().split("T")[0];
                    const recordDate = new Date(dateKey);
                    if (recordDate >= monthStart && recordDate <= monthEnd) {
                        attendanceByDate.set(dateKey, r);
                    }
                });

                const dailyData: AttendanceData[] = [];

                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const day = d.getDay();
                    if (day === 0 || day === 6) continue; // Skip weekends

                    const dateKey = d.toISOString().split("T")[0];
                    const record = attendanceByDate.get(dateKey);

                    if (record) {
                        const clockInHour = new Date(record.clockIn).getHours();
                        const checkIn = `${clockInHour.toString().padStart(2, "0")}:00`;
                        const checkOutHour = record.clockOut ? new Date(record.clockOut).getHours() : null;
                        const checkOut =
                            checkOutHour !== null ? `${checkOutHour.toString().padStart(2, "0")}:00` : "--:--";

                        dailyData.push({
                            date: dateKey,
                            checkIn,
                            checkOut,
                            actualHours: checkOutHour !== null ? checkOutHour - clockInHour : 0,
                            isAbsent: false,
                        });
                    } else if (leaveDates.has(dateKey)) {
                        dailyData.push({
                            date: dateKey,
                            checkIn: "--:--",
                            checkOut: "--:--",
                            actualHours: 0,
                            isAbsent: false,
                        });
                    } else if (d <= today) {
                        dailyData.push({
                            date: dateKey,
                            checkIn: "--:--",
                            checkOut: "--:--",
                            actualHours: 0,
                            isAbsent: true,
                        });
                    }
                }

                setAttendanceData(dailyData);
            } catch (err) {
                console.error("Error fetching attendance chart data:", err);
            }
        };

        fetchData();
    }, [selectedMonth]);

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6 min-h-[560px] relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
                    Daily Attendance ({selectedMonth === "current" ? "Current Month" : "Last Month"})
                </h2>

                {/* Dropdown for month selection */}
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value as "current" | "last")}
                    className="border rounded px-2 py-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
                >
                    <option value="current">Current Month</option>
                    <option value="last">Last Month</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <div className="flex items-end space-x-4 h-[320px] min-w-max pb-2">
                    {attendanceData.map((day, index) => (
                        <div key={index} className="flex flex-col items-center relative w-16">

                            {/* This wrapper will anchor bars at bottom */}
                            <div className="relative w-full h-[300px]">
                                {day.isAbsent ? (
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-600 rounded"></div>
                                ) : (
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end">
                                        <div
                                            className="w-6 bg-[#255199] rounded-t relative"
                                            style={{ height: `${getBarHeight(parseInt(day.checkIn))}px` }}
                                        >
                                            <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2">
                                                {day.checkIn}
                                            </span>
                                        </div>
                                        <div
                                            className="w-6 bg-green-500 rounded-t relative"
                                            style={{ height: `${getBarHeight(parseInt(day.checkOut))}px` }}
                                        >
                                            <span className="absolute -top-6 text-xs left-1/2 transform -translate-x-1/2">
                                                {day.checkOut}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <span className="text-sm mt-2 text-gray-600">{day.date.slice(8)}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6">
                <LegendDot color="[#255199]" label="Check-in" />
                <LegendDot color="green-500" label="Check-out" />
                <LegendDot color="red-600" label="Absent" />
            </div>
        </div>
    );
};

export default AttendanceChart;
