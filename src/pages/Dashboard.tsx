import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface DepartmentData {
  name: string;
  attendance: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const departments: DepartmentData[] = [
    { name: 'IT', attendance: 95, color: 'bg-blue-500' },
    { name: 'HR', attendance: 88, color: 'bg-green-500' },
    { name: 'Finance', attendance: 92, color: 'bg-purple-500' },
    { name: 'Marketing', attendance: 85, color: 'bg-yellow-500' },
    { name: 'Operations', attendance: 90, color: 'bg-red-500' },
  ];

  const activities = [
    { text: 'New employee John Doe joined IT Department', time: '2 hours ago' },
    { text: 'Jane Smith requested leave for next week', time: '4 hours ago' },
    { text: 'Monthly payroll processing completed', time: '1 day ago' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
          <div className="text-2xl font-bold text-blue-600 mt-2">156</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Present Today</h3>
          <div className="text-2xl font-bold text-green-600 mt-2">142/156</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">On Leave</h3>
          <div className="text-2xl font-bold text-yellow-600 mt-2">8</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Payroll</h3>
          <div className="text-2xl font-bold text-red-600 mt-2">----</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg text-gray-500 font-semibold mb-6">Department-wise Attendance</h2>
          <div className="h-64 flex items-end space-x-4">
            {departments.map((dept) => (
              <div key={dept.name} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div 
                    className={`${dept.color} rounded-t-lg w-full transition-all duration-300`}
                    style={{ height: `${dept.attendance}%` }}
                  />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-gray-600">
                    {dept.attendance}%
                  </span>
                </div>
                <span className="mt-2 text-sm text-gray-600">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Status Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg text-gray-500 font-semibold mb-6">Employee Status Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    className="text-gray-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.91)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">
                  91%
                </span>
              </div>
              <span className="mt-2 text-sm text-gray-600">Present</span>
            </div>
            {/* Similar circles for On Leave and Absent */}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-gray-500 font-semibold mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-700">{activity.text}</span>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;