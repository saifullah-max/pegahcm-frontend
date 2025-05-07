import React from 'react';

const UserInfo: React.FC = () => {
  const userInfo = {
    name: 'John Doe',
    employeeId: 'EMP001',
    designation: 'Software Engineer',
    department: 'Engineering',
    status: 'Active'
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Name:</span> {userInfo.name}</p>
        <p><span className="font-medium">Employee ID:</span> {userInfo.employeeId}</p>
        <p><span className="font-medium">Designation:</span> {userInfo.designation}</p>
        <p><span className="font-medium">Department:</span> {userInfo.department}</p>
        <p><span className="font-medium">Status:</span> {userInfo.status}</p>
      </div>
    </div>
  );
};

export default UserInfo;