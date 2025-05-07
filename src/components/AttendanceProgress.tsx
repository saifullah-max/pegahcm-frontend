import React from 'react';

const AttendanceProgress: React.FC = () => {
  const monthlyAttendance = {
    present: 18,
    absent: 2,
    total: 20,
    percentage: 90
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Monthly Attendance</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Present Days:</span> {monthlyAttendance.present}</p>
        <p><span className="font-medium">Absent Days:</span> {monthlyAttendance.absent}</p>
        <p><span className="font-medium">Attendance:</span> {monthlyAttendance.percentage}%</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${monthlyAttendance.percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProgress;