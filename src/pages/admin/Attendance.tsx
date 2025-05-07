import React, { useState } from 'react';
import dayjs from 'dayjs';

interface AttendanceRecord {
  key: string;
  date: string;
  employeeId: number;
  name: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day';
}

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCheckIn = () => {
    setLoading(true);
    const currentTime = dayjs().format('HH:mm:ss');
    const today = dayjs().format('YYYY-MM-DD');

    const todayRecord = attendanceRecords.find(
      record => record.date === today
    );

    if (todayRecord) {
      showNotification('warning', 'You have already checked in today!');
      setLoading(false);
      return;
    }

    const newRecord: AttendanceRecord = {
      key: today,
      date: today,
      employeeId: 101,
      name: 'John Doe',
      checkIn: currentTime,
      checkOut: '-',
      status: 'Present',
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    showNotification('success', 'Successfully checked in!');
    setLoading(false);
  };

  const handleCheckOut = () => {
    setLoading(true);
    const currentTime = dayjs().format('HH:mm:ss');
    const today = dayjs().format('YYYY-MM-DD');

    setAttendanceRecords(prev =>
      prev.map(record => {
        if (record.date === today && record.checkOut === '-') {
          return {
            ...record,
            checkOut: currentTime,
          };
        }
        return record;
      })
    );

    showNotification('success', 'Successfully checked out!');
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-600 dark:text-gray-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Attendance
        </h1>
      </div>

      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zM9.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L10.586 11H3a1 1 0 110-2h7.586L9.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          Check Out
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Employee ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Check In</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Check Out</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {attendanceRecords.map((record) => (
              <tr key={record.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.checkIn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{record.checkOut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    record.status === 'Present'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : record.status === 'Absent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}>
                    {record.status}
                  </span>
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