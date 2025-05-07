import React from 'react';
import UserInfo from '../../components/UserInfo';
import AttendanceMarker from '../../components/AttendanceMarker';
import AttendanceProgress from '../../components/AttendanceProgress';
import LeavesSummary from '../../components/LeavesSummary';
import PayslipDetails from '../../components/PayslipDetails';
import { User, UserRound } from 'lucide-react';

const UserDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-6 flex items-center gap-1">
        <UserRound/>
        Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserInfo />
        <AttendanceMarker />
        <AttendanceProgress />
        <LeavesSummary />
        <PayslipDetails />
      </div>
    </div>
  );
};

export default UserDashboard;