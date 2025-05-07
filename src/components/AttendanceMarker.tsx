import React, { useState } from 'react';

const AttendanceMarker: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString();
    setCheckInTime(now);
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    setIsCheckedOut(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
      <div className="space-y-4">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn}
          className={`px-4 py-2 rounded ${
            isCheckedIn ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isCheckedIn ? 'Checked In' : 'Check In'}
        </button>
        {checkInTime && (
          <p className="text-sm">Check-in time: {checkInTime}</p>
        )}
      </div>
      <div className="mt-4">
        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || isCheckedOut}
          className={`px-4 py-2 rounded ${
            !isCheckedIn || isCheckedOut ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isCheckedOut ? 'Checked Out' : 'Check Out'}
        </button>
        {isCheckedOut && (
          <p className="text-sm">Check-out time: {new Date().toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarker;