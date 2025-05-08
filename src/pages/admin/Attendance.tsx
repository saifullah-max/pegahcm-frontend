import { Check, ClockFading, X } from 'lucide-react';
import React, { useState } from 'react';


interface AttendanceRecord {
  key: string;
  date: string;
  employeeId: number;
  name: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day';
  requestType?: 'Leave' | 'WFH' | 'Late' | 'Early Departure';
  reason?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    // Sample data
    {
      key: '2025-05-08',
      date: '2025-05-08',
      employeeId: 102,
      name: 'Jane Smith',
      checkIn: '09:30:00',
      checkOut: '17:30:00',
      status: 'Present',
      requestType: 'Late',
      reason: 'Traffic delay',
      approvalStatus: 'Pending'
    },
  ]);


  const showNotification = (type: 'success' | 'error', message: string) => {

    console.log(`${type}: ${message}`);
  };

  const handleApprove = (key: string) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.key === key
          ? { ...record, approvalStatus: 'Approved' }
          : record
      )
    );
    showNotification('success', 'Request approved successfully!');
  };

  const handleReject = (key: string) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.key === key
          ? { ...record, approvalStatus: 'Rejected' }
          : record
      )
    );
    showNotification('success', 'Request rejected successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-600 dark:text-gray-200 flex items-center gap-2">
        <ClockFading/>
          Attendance
        </h1>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Employee ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Request Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Reason</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {attendanceRecords.map((record) => (
              <tr key={record.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.requestType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    record.approvalStatus === 'Approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : record.approvalStatus === 'Rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}>
                    {record.approvalStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.approvalStatus === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(record.key)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleReject(record.key)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;