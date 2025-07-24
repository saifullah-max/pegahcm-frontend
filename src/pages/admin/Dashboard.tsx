import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getEmployees } from "../../services/employeeService";
import { getAllAdminLeaveRequests, getLeaveTypes } from "../../services/attendanceService";
import { fetchTodayPresentCount, getTodayAttendance } from "../../services/userService";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface DepartmentData {
  name: string;
  attendance: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [employeeNumber, setemployeeNumber] = useState(0);
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [presentToday, setPresentToday] = useState(0);
  const [absentCount, setabsentCount] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const role = user?.role;
  const departments: DepartmentData[] = [
    { name: "IT", attendance: 95, color: "bg-[#255199]" },
    { name: "HR", attendance: 88, color: "bg-[#255199]" },
    { name: "Finance", attendance: 92, color: "bg-[#255199]" },
    { name: "Marketing", attendance: 85, color: "bg-[#255199]" },
    { name: "Operations", attendance: 90, color: "bg-[#255199]" },
  ];

  const activities = [
    { text: "New employee John Doe joined IT Department", time: "2 hours ago" },
    { text: "Jane Smith requested leave for next week", time: "4 hours ago" },
    { text: "Monthly payroll processing completed", time: "1 day ago" },
  ];

  const fetchEmployee = async () => {
    try {
      const res = await getEmployees();
      console.log(res);
      const length = res.length
      setemployeeNumber(length)
      const totalPay = res.reduce((acc, emp) => {
        return acc + Number(emp.salary); // Convert salary to number
      }, 0);
      setTotalPayroll(totalPay)
    } catch (error) {
      console.error("Error while fetching employees")
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const res = await getLeaveTypes();
      console.log("Leave types:", res.map((leave) => leave.name));
      const types = res.map((leave) => leave.name);
      setLeaveTypes(types)
    } catch (error) {
      console.error("Error while fetching leave types:", error)
    }
  }

  const fetchEmployeeAttendance = async () => {
    try {
      const res = await fetchTodayPresentCount();
      console.log("Attendance:", res.length);
      setPresentToday(res.length)
      setabsentCount(employeeNumber - presentToday);
    } catch (error) {
      console.error("Error while fetching employee attendance")
    }
  }

  useEffect(() => {
    fetchEmployee();
    fetchLeaveTypes();
    fetchEmployeeAttendance();
  }, [])

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes growBar {
        0% { height: 0%; }
        100% { height: var(--target-height); }
      }
      
      @keyframes pulseEffect {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);

    // Set custom property for each bar
    document.querySelectorAll("[data-attendance]").forEach((bar) => {
      const attendance = bar.getAttribute("data-attendance");
      (bar as HTMLElement).style.setProperty(
        "--target-height",
        `${attendance}%`
      );
    });

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 70) return "#255199"; // Blue
    if (percentage >= 50) return "#facc15"; // Yellow (Tailwind's yellow-400)
    return "#ef4444"; // Red (Tailwind's red-500)
  };

  const presentRatio = presentToday / (employeeNumber);
  const presentPercentage = Math.round(presentRatio * 100);
  const absentRatio = employeeNumber - presentToday;
  const absentPercentage = (absentCount / employeeNumber) * 100;
  const progressColor = getProgressColor(presentPercentage);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            Total Employees
          </h3>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {employeeNumber}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            Present Today
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {
              `${presentToday} / ${employeeNumber}`
            }
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            On Leave
          </h3>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {absentCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            Total Payroll
          </h3>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {totalPayroll}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-lg text-gray-500 dark:text-gray-300 font-semibold mb-6">
            Department-wise Attendance
          </h2>
          <div className="h-80 flex items-end space-x-4">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative w-full h-56">
                  <div
                    className={`${dept.color} rounded-t-lg w-full absolute bottom-0 hover:brightness-110 shadow-lg transition-all duration-700 ease-out transform hover:scale-105`}
                    style={{
                      height: `${dept.attendance}%`,
                      animation: `growBar 1.5s ease-out forwards ${departments.indexOf(dept) * 0.2
                        }s`,
                    }}
                    data-attendance={dept.attendance}
                  />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {dept.attendance}%
                  </span>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                  {dept.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-lg text-gray-500 dark:text-gray-300 font-semibold mb-6">
            Employee Status Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Present Employees */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CircularProgressbar
                  value={presentPercentage}
                  text={`${presentToday}/${employeeNumber} (${presentPercentage}%)`}
                  styles={buildStyles({
                    textColor: progressColor,
                    pathColor: progressColor,
                    trailColor: "#e5e7eb",
                    textSize: "12px"
                  })}
                />
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Present
              </span>
            </div>

            {/* On Leave */}

            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CircularProgressbar
                  value={absentPercentage}
                  text={`${absentCount}/${employeeNumber} (${Math.round(absentPercentage)}%)`}
                  styles={buildStyles({
                    textColor: getProgressColor(absentPercentage),
                    pathColor: getProgressColor(absentPercentage),
                    trailColor: "#e5e7eb",
                    textSize: "12px"
                  })}
                />
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                On Leave
              </span>
            </div>

            {/* Absent */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <svg className="transform -rotate-90 w-28 h-28 transition-transform duration-300 group-hover:drop-shadow-lg">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  />
                  <circle
                    className="text-[#255199] dark:text-[#2F66C1] transition-all duration-1000 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={289.0}
                    strokeDashoffset={289.0 * (1 - 0.04)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="289"
                      to={289.0 * (1 - 0.04)}
                      dur="1.5s"
                    />
                  </circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-lg font-bold text-[#255199] dark:text-[#2F66C1]">
                    4%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    6/156
                  </div>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Absent
              </span>
            </div>

            {/* Remote Work */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <svg className="transform -rotate-90 w-28 h-28 transition-transform duration-300 group-hover:drop-shadow-lg">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  />
                  <circle
                    className="text-[#255199] transition-all duration-1000 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={289.0}
                    strokeDashoffset={289.0 * (1 - 0.12)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="289"
                      to={289.0 * (1 - 0.12)}
                      dur="1.5s"
                    />
                  </circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-lg font-bold text-[#255199] dark:text-[#2F66C1]">
                    12%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    19/156
                  </div>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Remote
              </span>
            </div>

            {/* New Hires */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <svg className="transform -rotate-90 w-28 h-28 transition-transform duration-300 group-hover:drop-shadow-lg">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  />
                  <circle
                    className="text-[#255199] dark:text-[#2F66C1] transition-all duration-1000 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={289.0}
                    strokeDashoffset={289.0 * (1 - 0.07)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="289"
                      to={289.0 * (1 - 0.07)}
                      dur="1.5s"
                    />
                  </circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-lg font-bold text-[#255199] dark:text-[#2F66C1]">
                    7%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    11/156
                  </div>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                New Hires
              </span>
            </div>

            {/* Training */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <svg className="transform -rotate-90 w-28 h-28 transition-transform duration-300 group-hover:drop-shadow-lg">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  />
                  <circle
                    className="text-[#255199] dark:text-[#2F66C1] transition-all duration-1000 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={289.0}
                    strokeDashoffset={289.0 * (1 - 0.09)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="56"
                    cy="56"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="289"
                      to={289.0 * (1 - 0.09)}
                      dur="1.5s"
                    />
                  </circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-lg font-bold text-[#255199] dark:text-[#2F66C1]">
                    9%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    14/156
                  </div>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                In Training
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <h2 className="text-lg text-gray-500 dark:text-gray-300 font-semibold mb-6">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b dark:border-gray-700 pb-4"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {activity.text}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
