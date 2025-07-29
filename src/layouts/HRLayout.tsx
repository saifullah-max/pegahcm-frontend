import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import {
    Bell,
    UserRound,
    LayoutDashboard,
    Clock,
    Building2,
    Sun,
    Moon,
    Users
} from 'lucide-react';

const HRLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [fullName, setFullName] = useState<string | null>(null);

    const { user } = useSelector((state: RootState) => state.auth);
    const { isDarkMode } = useSelector((state: RootState) => state.theme);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const persistRoot = localStorage.getItem('persist:root');

        if (persistRoot) {
            const parsedRoot = JSON.parse(persistRoot);
            const authString = parsedRoot.auth;

            if (authString) {
                const parsedAuth = JSON.parse(authString);
                const fullName = parsedAuth.user?.fullName;
                setFullName(fullName);
            }
        }

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

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleThemeToggle = () => dispatch(toggleTheme());

    const handleLogoutClick = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    // Sidebar Navigation Handlers
    const goTo = (path: string) => {
        dispatch({ type: 'NAVIGATE', payload: path });
        navigate(path);
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#255199] text-white transition-all duration-300`}>
                <div className="p-4">
                    <h2 className="text-2xl font-semibold">HR Dashboard</h2>
                </div>
                <nav className="mt-4">
                    <ul>
                        <li onClick={() => goTo('/hr/dashboard')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <LayoutDashboard className="inline-block mr-2" /> Dashboard
                        </li>
                        <li onClick={() => goTo('/hr/employees')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <Users className="inline-block mr-2" /> Employees
                        </li>
                        <li onClick={() => goTo('/hr/attendance')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <Clock className="inline-block mr-2" /> Attendance
                        </li>
                        <li onClick={() => goTo('/hr/departments')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <Building2 className="inline-block mr-2" /> Departments
                        </li>
                        <li onClick={() => goTo('/hr/onboarding')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <Building2 className="inline-block mr-2" /> OnBoarding Process
                        </li>
                        <li onClick={() => goTo('/hr/resignations')} className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] cursor-pointer flex items-center">
                            <Building2 className="inline-block mr-2" /> Resignation requests
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
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-4">
                            <span className="text-black dark:text-white">Welcome, <strong>{fullName}</strong></span>

                            {/* Theme Toggle */}
                            <button onClick={handleThemeToggle} className="text-gray-500 dark:text-gray-400">
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                                        setIsUserDropdownOpen(false);
                                    }}
                                    className="text-gray-500 dark:text-gray-400"
                                >
                                    <Bell />
                                </button>
                                {isNotificationDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-800">
                                        <div className="px-4 py-2 border-b dark:border-gray-800">
                                            <h3 className="text-sm font-semibold dark:text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            <div className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Leave request submitted</p>
                                                <p className="text-xs text-gray-400">5 mins ago</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 border-t dark:border-gray-800">
                                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                View all notifications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsUserDropdownOpen(!isUserDropdownOpen);
                                        setIsNotificationDropdownOpen(false);
                                    }}
                                    className="text-gray-500 dark:text-gray-400"
                                >
                                    <UserRound />
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-800">
                                        <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                                            Profile
                                        </button>
                                        <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                                            Settings
                                        </button>
                                        <div className="border-t dark:border-gray-800" />
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
                </header>

                {/* Content Outlet */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default HRLayout;
