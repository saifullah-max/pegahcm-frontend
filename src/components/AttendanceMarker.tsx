import React, { useState, useEffect } from 'react';
import {Check, LogIn, LogOut } from 'lucide-react';

const AttendanceMarker: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    setCheckInTime(formattedTime);
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    setCheckOutTime(formattedTime);
    setIsCheckedOut(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl  text-slate-800">Attendance</h2>
        <div className="text-right">
          <p className="text-slate-600 font-medium">{currentDate}</p>
          <p className="text-slate-500 text-sm">{currentTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`p-5 rounded-lg transition-all duration-300 ${
          isCheckedIn 
            ? 'bg-blue-50 border-2 border-blue-600 shadow-md' 
            : 'bg-white border border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-slate-700">Check In</h3>
              {checkInTime && (
                <p className="text-sm text-blue-600 font-medium">Recorded at {checkInTime}</p>
              )}
            </div>
            <div className="ml-4">
              {isCheckedIn ? (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <LogIn/>
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="h-10 w-10 rounded-full text-white bg-[#255199] hover:bg-[#2F66C1] flex items-center justify-center transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <LogOut/>
                </button>
              )}
            </div>
          </div>
          {!isCheckedIn && (
            <button
              onClick={handleCheckIn}
              className="mt-4 w-full py-2 bg-[#255199] hover:bg-[#2F66C1] text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Check In Now
            </button>
          )}
        </div>

        <div className={`p-5 rounded-lg transition-all duration-300 ${
          isCheckedOut 
            ? 'bg-amber-50 border-2 border-amber-500 shadow-md' 
            : 'bg-white border border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-slate-700">Check Out</h3>
              {checkOutTime && (
                <p className="text-sm text-amber-600 font-medium">Recorded at {checkOutTime}</p>
              )}
            </div>
            <div className="ml-4">
              {isCheckedOut ? (
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Check/>
                </div>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn || isCheckedOut}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md ${
                    !isCheckedIn || isCheckedOut 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-600 hover:shadow-lg'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${!isCheckedIn || isCheckedOut ? 'text-gray-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut}
            className={`mt-4 w-full py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center ${
              !isCheckedIn || isCheckedOut 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Check Out Now
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-3 text-slate-700">Today's Status</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCheckedIn ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-slate-600">Check-in status: {isCheckedIn ? 'Completed' : 'Pending'}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCheckedOut ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-slate-600">Check-out status: {isCheckedOut ? 'Completed' : 'Pending'}</span>
          </div>
          {isCheckedIn && checkInTime && (
            <div className="flex items-center pt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-slate-600">
                Session: {isCheckedOut ? `${checkInTime} - ${checkOutTime}` : `Started at ${checkInTime}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarker;