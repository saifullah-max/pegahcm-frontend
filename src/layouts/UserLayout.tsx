import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { Bell, ClockFading, LayoutDashboard, UserRound, Moon, Sun } from 'lucide-react';
import { toggleTheme } from '../store/slices/themeSlice';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsUserDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleDashboardClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/user/user-dashboard' });
    navigate('/user/user-dashboard');
  };

  const handleLogoutClick = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-[#255199] text-white transition-all duration-300 dark:bg-gray-900`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-semibold">User Dashboard</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li onClick={handleDashboardClick} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center">
              <LayoutDashboard className="inline-block mr-2" /> Dashboard
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 shadow-md z-10 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
              <span className="mr-4 text-black dark:text-white">Welcome, {user?.name}</span>
              <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <button 
                  onClick={handleThemeToggle}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button 
                    className='flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    onClick={() => {
                      setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <Bell className='inline-block mr-2'/>
                  </button>
                  {isNotificationDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-800">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {/* Sample notifications - you can map through actual notifications here */}
                        <div className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <p className="text-sm text-gray-600 dark:text-gray-300">New employee registration</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                        <div className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Attendance update required</p>
                          <p className="text-xs text-gray-400">3 hours ago</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsNotificationDropdownOpen(false);
                    }}
                  >
                    <UserRound className='inline-block mr-2'/>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-800">
                      <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                        Profile
                      </button>
                      <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                        Settings
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-800"></div>
                      <button 
                        onClick={handleLogoutClick}
                        className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 shadow-lg p-4 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;