import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Employee, EmployeeData, getEmployees } from "../../services/employeeService";
import { getAllAdminLeaveRequests, getLeaveTypes, LeaveRequest } from "../../services/attendanceService";
import { fetchTodayPresentCount, getTodayAttendance } from "../../services/userService";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getDepartments } from "../../services/departmentService";

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
  const [onLeave, setOnLeave] = useState(0);
  const [remoteEmployee, setRemoteEmployee] = useState(0);
  const [onSiteEmployee, setOnSiteEmployee] = useState(0);
  const [newHires, setNewHires] = useState(0);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [departmentWiseAttendance, setDepartmentWiseAttendance] = useState<Record<string, number>>({});

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

  const calculateAbsentEmployees = (leaveRequest: LeaveRequest[]) => {
    const today = new Date().setHours(0, 0, 0, 0);

    const absentToday = leaveRequest.filter((leave: LeaveRequest) => {
      if (leave.status !== "Approved") return false;

      const start = new Date(leave.startDate).setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate).setHours(0, 0, 0, 0);

      return today >= start && today <= end;
    });

    const uniqueEmployeeIds = new Set(absentToday.map((lr: LeaveRequest) => lr.id));

    return uniqueEmployeeIds.size;
  };

  const getNewHires = (employees: Employee[]) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newHires = employees.filter((emp: Employee) => {
      const hireDate = new Date(emp.hireDate);
      return hireDate >= oneMonthAgo;
    });

    return newHires.length;
  };


  const fetchEmployee = async () => {
    try {
      const res = await getEmployees();
      console.log("all employees:", res);

      const length = res.length;
      setemployeeNumber(length);

      const totalPay = res.reduce((acc, emp) => acc + Number(emp.salary), 0);
      setTotalPayroll(totalPay);

      const remoteCount = res.filter(emp => emp.workLocation === "Remote").length;
      const onsiteCount = res.filter(emp => emp.workLocation === "Onsite").length;

      setRemoteEmployee(remoteCount);
      setOnSiteEmployee(onsiteCount);

      const newHireCount = getNewHires(res);
      setNewHires(newHireCount); // Assuming you have a state for new hires
    } catch (error) {
      console.error("Error while fetching employees", error);
    }
  };


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
      setabsentCount(employeeNumber - presentToday - onLeave);
      console.log(employeeNumber, presentToday, onLeave, absentCount);
    } catch (error) {
      console.error("Error while fetching employee attendance")
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const res = await getAllAdminLeaveRequests();
      const totalAbsent = calculateAbsentEmployees(res);
      console.log("Total absent employees today:", totalAbsent);
      setOnLeave(totalAbsent)
    } catch (error) {
      console.error("Error while fetching leave requests", error);
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      console.log("Departments:", res);
    } catch (error) {
      console.error("Error while fetching departments:", departments)
    }
  }

  const fetchDepartmentWiseAttendance = async () => {
    try {
      // Fetch departments and today's present employees
      const [departmentsRes, presentRes] = await Promise.all([
        getDepartments(),
        fetchTodayPresentCount()
      ]);
      console.log("departmentRes:", departmentsRes, "presentRes:", presentRes);

      setDepartmentsData(departmentsRes); // Save for UI rendering

      // Count attendance per departmentId
      const attendanceMap: Record<string, number> = {};

      presentRes.forEach((record: any) => {
        const deptId = record.employee?.departmentId;
        if (deptId) {
          attendanceMap[deptId] = (attendanceMap[deptId] || 0) + 1;
        }
      });
      setDepartmentWiseAttendance(attendanceMap);
      console.log("Dept-wise attendance:", attendanceMap);
    } catch (error) {
      console.error("Error fetching department-wise attendance", error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      fetchEmployee();
      fetchLeaveTypes();
      fetchLeaveRequests();
      fetchEmployeeAttendance();
      fetchDepartments();
      fetchDepartmentWiseAttendance();
    }

    fetchData()
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

  const absentPercentage = (absentCount / employeeNumber) * 100;

  const remotePercentage = (remoteEmployee / employeeNumber) * 100;
  const onSitePercentage = (onSiteEmployee / employeeNumber) * 100;

  const onLeavePercentage = (onLeave / employeeNumber) * 100;

  const newHirePercentage = (newHires / employeeNumber) * 100;

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
            {onLeave}
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
          <div className="h-80">
            <div className="flex items-end justify-between h-full w-full gap-12">
              {departmentsData.map((dept) => {
                const attendanceCount = departmentWiseAttendance[dept.id] || 0;

                // Max height scaling
                const maxBarHeight = 200; // px
                const maxAttendance = Math.max(...Object.values(departmentWiseAttendance), 1); // avoid divide-by-zero
                const barHeight = (attendanceCount / maxAttendance) * maxBarHeight;

                return (
                  <div key={dept.id} className="flex-1 flex flex-col items-center min-w-[40px]">
                    <div className="relative w-full h-[200px] flex items-end">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500`}
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: attendanceCount === 0 ? "#ccc" : "#255199",
                        }}
                      />
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {attendanceCount}
                      </span>
                    </div>
                    <span className="mt-2 text-sm text-center text-gray-700 dark:text-gray-300 break-words">
                      {dept.name}
                    </span>
                  </div>
                );
              })}
            </div>
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
                  value={onLeavePercentage}
                  text={`${onLeave}/${employeeNumber} (${Math.round(onLeavePercentage)}%)`}
                  styles={buildStyles({
                    textColor: getProgressColor(onLeavePercentage),
                    pathColor: getProgressColor(onLeavePercentage),
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
                Absent
              </span>
            </div>

            {/* Remote Work */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CircularProgressbar
                  value={remotePercentage}
                  text={`${remoteEmployee}/${employeeNumber} (${Math.round(remotePercentage)}%)`}
                  styles={buildStyles({
                    textColor: getProgressColor(remotePercentage),
                    pathColor: getProgressColor(remotePercentage),
                    trailColor: "#e5e7eb",
                    textSize: "12px"
                  })}
                />

              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Remote
              </span>
            </div>

            {/* Onsite Work */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CircularProgressbar
                  value={onSitePercentage}
                  text={`${onSiteEmployee}/${employeeNumber} (${Math.round(onSitePercentage)}%)`}
                  styles={buildStyles({
                    textColor: getProgressColor(onSitePercentage),
                    pathColor: getProgressColor(onSitePercentage),
                    trailColor: "#e5e7eb",
                    textSize: "12px"
                  })}
                />

              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                On site
              </span>
            </div>

            {/* New Hires */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CircularProgressbar
                  value={newHirePercentage}
                  text={`${newHires}/${employeeNumber} (${Math.round(newHirePercentage)}%)`}
                  styles={buildStyles({
                    textColor: getProgressColor(newHirePercentage),
                    pathColor: getProgressColor(newHirePercentage),
                    trailColor: "#e5e7eb",
                    textSize: "12px"
                  })}
                />

              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                New Hire
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
