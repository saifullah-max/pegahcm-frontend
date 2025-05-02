import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDashboardClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/dashboard' });
    navigate('/dashboard');
  };

  const handleEmployeesClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/employees' });
    
    navigate('/employees');
  };

  const handleAttendanceClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/attendance' });

    navigate('/attendance');
  };
  
  const handleLogoutClick = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-800 text-white transition-all duration-300`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-semibold">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li onClick={handleDashboardClick} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
              Dashboard
            </li>
            <li onClick={handleEmployeesClick} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
              Employees
            </li>
            <li onClick={handleAttendanceClick} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
              Attendance
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name}</span>
              <div className="relative">
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 