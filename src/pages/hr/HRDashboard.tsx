import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { UserRound, ShieldCheck, Building2 } from "lucide-react";
import UserInfo from "../../components/UserInfo";
import DailyAttendance from "../../components/DailyAttendance";
import AttendanceProgress from "../../components/AttendanceProgress";
import LeavesSummary from "../../components/LeavesSummary";
import PayslipDetails from "../../components/PayslipDetails";
import { getDepartments } from "../../services/departmentService";
import { fetchTodayPresentCount } from "../../services/userService";
import AttendanceMarker from "../../components/AttendanceMarker";
// import DepartmentAttendanceChart from "../../components/DepartmentAttendanceChart"; // Create this reusable
// import RecentActivity from "../../components/RecentActivity"; // Extract from admin Dashboard
// import TotalStatsCard from "../../components/TotalStatsCard"; // Optional - show total employees, payroll etc

const HRDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [departmentsData, setDepartmentsData] = useState<any[]>([]);
    const [departmentWiseAttendance, setDepartmentWiseAttendance] = useState<Record<string, number>>({});

    const fetchDepartmentWiseAttendance = async () => {
        try {
            // Fetch departments and today's present employees
            const [departmentsRes, presentRes] = await Promise.all([
                getDepartments(),
                fetchTodayPresentCount()
            ]);
            console.log("departmentRes:", departmentsRes, "presentRes:", presentRes);

            setDepartmentsData(departmentsRes); // Save for UI rendering

            if (departmentsRes.length > 0 && presentRes.length > 0) {
                const attendanceMap: Record<string, number> = {};

                // Step 1: Map each subDepartment ID to its main department ID
                const subDeptToMainDept: Record<string, string> = {};
                departmentsRes.forEach((dept) => {
                    dept.subDepartments.forEach((subDept: any) => {
                        subDeptToMainDept[subDept.id] = dept.id;
                    });
                });

                // Step 2: Count attendance per main department
                presentRes.forEach((record: any) => {
                    const subDeptId = record.employee?.subDepartmentId;
                    const mainDeptId = subDeptToMainDept[subDeptId];
                    if (mainDeptId) {
                        attendanceMap[mainDeptId] = (attendanceMap[mainDeptId] || 0) + 1;
                    }
                });

                // Step 3: Create final data to feed to the chart
                const departmentWise = departmentsRes.map((dept: any) => ({
                    name: dept.name,
                    presentCount: attendanceMap[dept.id] || 0,
                }));

                // setDepartmentWiseAttendance(departmentWise);
                setDepartmentWiseAttendance(attendanceMap);
                console.log("Dept-wise attendance:", attendanceMap);
            }
        } catch (error) {
            console.error("Error fetching department-wise attendance", error);
        }
    };


    useEffect(() => {
        // Optional: Fetch HR-specific data if needed
        fetchDepartmentWiseAttendance()
    }, []);


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <ShieldCheck />
                HR Dashboard
            </h1>

            {/* Basic Stats Cards */}
            {/* <TotalStatsCard /> */}

            {/* Employee Info and Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                <UserInfo />
                <DailyAttendance />
                <AttendanceProgress />
                <AttendanceMarker />
                <LeavesSummary />
                <PayslipDetails />
            </div>

            {/* ✅ Department-wise Attendance (Moved outside the grid) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-1">
                    <Building2 className="w-5 h-5" />
                    Department-wise Attendance
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                    <h2 className="text-lg text-gray-500 dark:text-gray-300 font-semibold mb-6">
                        Department-wise Attendance
                    </h2>
                    <div className="h-80">
                        <div className="flex items-end justify-between h-full w-full gap-12">
                            {departmentsData?.length > 0 ? (
                                departmentsData.map((dept) => {
                                    const attendanceCount = departmentWiseAttendance[dept.id] || 0;
                                    const maxBarHeight = 200;
                                    const maxAttendance = Math.max(...Object.values(departmentWiseAttendance), 1);
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
                                })
                            ) : (
                                <p className="text-gray-500">Loading departments or no data to show.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            {/* <RecentActivity /> */}
        </div>
    );

};

export default HRDashboard;