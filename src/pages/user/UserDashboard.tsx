import React from "react";
import UserInfo from "../../components/UserInfo";
// import AttendanceOverview from "../../components/AttendanceOverview";
import LeavesSummary from "../../components/LeavesSummary";
import PayslipDetails from "../../components/PayslipDetails";
import AttendanceMarker from "../../components/AttendanceMarker";
import { UserRound } from "lucide-react";
import AttendanceCard from "../../components/AttendanceCard";
import AttendanceOverview from "../../components/AttendanceOverview";
import AttendanceChart from "../../components/AttendanceChart";

const UserDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-6 flex items-center gap-1">
        <UserRound />
        Employee Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First two columns: UserInfo + DailyAttendance */}
        <AttendanceMarker />
        <LeavesSummary />
        <AttendanceOverview />
        <div className="md:col-span-2 space-y-6">
          <AttendanceChart />
          {/* DailyAttendance is now inside AttendanceOverview below */}
        </div>

        {/* Third column: AttendanceProgress + DailyAttendance */}


        {/* Extra Cards (below if any space left) */}

        <PayslipDetails />
      </div>
    </div>
  );
};

export default UserDashboard;
