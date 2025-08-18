import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { Bell, Building2, ClockFading, LayoutDashboard, UserRound, Moon, Sun, CalendarSync, DollarSign, Clock, Shield, Layers2, FileArchiveIcon } from 'lucide-react';
import { toggleTheme } from '../store/slices/themeSlice';
import { getVisibleNotificationsForUser, markNotificationAsRead, Notification, UserNotification } from '../services/notificationService';
import { useSocket } from '../store/SocketContext';
import { FaUserClock, FaUserSlash } from 'react-icons/fa';
import { getEmployeeById } from '../services/employeeService';

type StatusKey =
  | 'active'
  | 'inactive'
  | 'terminated'
  | 'resigned'
  | 'retired'
  | 'onLeave'
  | 'probation';
interface EmployeeData {
  id: string;
  employeeNumber: string;
  designation: string;
  departmentId: string;
  subDepartmentId?: string;
  gender?: string;
  address?: string;
  salary?: string;
  shiftId?: string;
  shift?: string | null;
  status: string; // from backend as string, will cast
  dateOfBirth?: string;
  hireDate?: string;
  skills: string[];
  workLocation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profileImageUrl?: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  subRoleId?: string;
  status?: string;
  dateJoined?: string;
}

export interface EmployeeWithUser extends Omit<EmployeeData, 'status'> {
  status: StatusKey;
  user: UserData;
}

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, permissions } = useSelector((state: RootState) => state.auth);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeWithUser | null>(null);
  const { notification } = useSocket();

  useEffect(() => {
    if (notification) {
      fetchNotifications(); // or just refetch the list
    }
  }, [notification]);

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
  const fetchEmployeeInfo = async () => {
    if (!user?.id) return;
    try {
      const { user: userData, employee } = await getEmployeeById(user.id);

      const emp = employee as unknown as EmployeeData; // <-- cast here

      setEmployeeInfo({
        ...emp,
        user: userData,
        status: (emp.status ?? 'inactive') as StatusKey,
        profileImageUrl: emp.profileImageUrl ?? undefined, // normalize null
      });
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };

  useEffect(() => {
    if (user?.role !== "admin") {
      fetchEmployeeInfo();
    }
  }, [user?.id]);


  const fetchNotifications = async (pageNum = 1) => {
    try {
      const res = await getVisibleNotificationsForUser(pageNum, 10);

      // Full map, respecting UserNotification shape
      const userNotifs: UserNotification[] = res.data.map((notif: any) => ({
        id: notif.id,
        userId: notif.userId,
        read: notif.read,
        readAt: notif.readAt,
        notification: {
          id: notif.notification?.id ?? notif.id,
          title: notif.notification?.title ?? notif.title,
          message: notif.notification?.message ?? notif.message,
          type: notif.notification?.type ?? notif.type,
          createdAt: notif.notification?.createdAt ?? notif.createdAt,
          userId: notif.notification?.userId ?? notif.userId, // ✅ Add this line
        },
      }));

      setNotifications(userNotifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
    }
  };

  // Optional: Fetch once on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  function getScopeLabel(notif: Notification, user: any): string | null {
    if (notif.userId === user.userId) return "Direct";
    if (notif.employeeId) return "Employee Only";
    if (notif.subDepartmentId === user.subDepartmentId) return "Sub-Department";
    if (notif.departmentId === user.departmentId) return "Department";
    if (notif.visibilityLevel !== null && notif.visibilityLevel! <= (user.visibilityLevel ?? 99)) return "Management";
    return null;
  }

  const unreadCount = notifications.filter(notif => !notif.read).length;


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const hasPermission = (permission: string) => permissions.includes(permission);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleDashboardClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/dashboard' });
    navigate('/admin/dashboard');
  };

  const handleEmployeesClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/employees' });
    navigate('/admin/employees');
  };

  const handleAttendanceClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/attendance' });

    navigate('/admin/attendance');
  };

  const handleUserAttendanceClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/user/user-attendance' });

    navigate('/user/user-attendance');
  };

  const handleShiftsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/shifts' });
    navigate('/admin/shifts');
  };

  const handleDepartmentsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/departments' });
    navigate('/admin/departments');
  };
  const handlePermissionsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/permission' });
    navigate('/admin/permission');
  };
  const handleOnBoardingsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/onboarding' });
    navigate('/admin/onboarding');
  };
  const handleOnResignationsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/admin/resignations' });
    navigate('/admin/resignations');
  };
  const handleOnUserResignationsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/user/user-resignation' });
    navigate('/user/user-resignation');
  };
  const handleOnSalaryClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/salary' });
    navigate('/salary');
  };
  const handleViewAllNotificationsClick = () => {
    dispatch({ type: 'NAVIGATE', payload: '/notifications' });
    navigate('/notifications')
  }
  const handleProfileClick = () => {
    dispatch({ type: "NAVIGATE", payload: '/profile' })
    navigate('/profile')

  }
  const handleLogoutClick = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const dashboardHeadings: Record<string, string> = {
    teamMember: "Team Member Panel",
    teamLead: "Team Lead Panel",
    manager: "Manager Workspace",
    director: "Director Console",
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? 'w-64' : 'w-0'
          } bg-[#255199] text-white transition-all duration-300 dark:bg-gray-900`}
      >
        <div className="p-4">
          <h2 className="text-2xl md:text-xl sm:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-full sm:max-w-[80vw]">
            {user?.role === "admin"
              ? "Admin Dashboard"
              : dashboardHeadings[user?.subRole?.name || ""] || "User Dashboard"}
          </h2>

        </div>
        <nav className="mt-4">
          <ul>
            {/* Dashboard (no specific permission required) */}
            {
              user?.role === "admin" ?
                <li
                  onClick={handleDashboardClick}
                  className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
                >
                  <LayoutDashboard className="inline-block mr-2" /> Dashboard
                </li>
                :
                <li
                  onClick={() => navigate('/user/user-dashboard')}
                  className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
                >
                  <LayoutDashboard className="inline-block mr-2" /> Dashboard
                </li>
            }

            {/* Employees */}
            {hasPermission('Employee:create') && (
              <li
                onClick={handleEmployeesClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <UserRound className="inline-block mr-2" /> Employees
              </li>
            )}

            {/* Attendance */}
            {hasPermission('Attendance:approve') && (

              <li
                onClick={handleAttendanceClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <FaUserClock className="inline-block mr-2" size={21} /> Attendance
              </li>
            )}

            {/* User Attendance */}
            {hasPermission('Attendance:view') && user?.role !== 'admin' && (
              <li
                onClick={handleUserAttendanceClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <ClockFading className="inline-block mr-2" />My Attendance
              </li>
            )}

            {/* Shifts */}
            {hasPermission('Shift:create') && (
              <li
                onClick={handleShiftsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <CalendarSync className="inline-block mr-2" /> Shifts
              </li>
            )}

            {/* Departments */}
            {hasPermission('Department:create') && (
              <li
                onClick={handleDepartmentsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <Building2 className="inline-block mr-2" /> Departments
              </li>
            )}

            {/* Manage Permissions */}
            {hasPermission('Permission:create') && (
              <li
                onClick={handlePermissionsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <Shield className="inline-block mr-2" /> Manage Permissions
              </li>
            )}

            {/* OnBoardings */}
            {hasPermission('Onboarding:create') && (
              <li
                onClick={handleOnBoardingsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <Layers2 className="inline-block mr-2" /> OnBoardings
              </li>
            )}

            {/* Resignations */}
            {/* {hasPermission('Resignation:approve') && (
              <li
                onClick={handleOnResignationsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <FaUserSlash className="inline-block mr-2" /> Resignations
              </li>
            )}
            {hasPermission('Resignation:view') && user?.role !== 'admin' && (
              <li
                onClick={handleOnUserResignationsClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <FileArchiveIcon className="inline-block mr-2" /> User-Resignations
              </li>
            )} */}

            {hasPermission('Salary:create') && (
              <li
                onClick={handleOnSalaryClick}
                className="px-4 py-2 m-4 rounded-lg hover:bg-[#2F66C1] dark:hover:bg-gray-800 cursor-pointer flex items-center"
              >
                <DollarSign className="inline-block mr-2" /> Salary Details
              </li>
            )}

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
              <span className="mr-4 text-black dark:text-white">Welcome, <strong>{user?.fullName}</strong></span>
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
                      setIsNotificationDropdownOpen((prev) => !prev);
                      setIsUserDropdownOpen(false);
                      if (!isNotificationDropdownOpen) fetchNotifications();
                    }}
                  >
                    <Bell className='inline-block mr-2' />

                    {/* Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-800">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 && (
                          <div
                            key={notifications[0].notification.id}
                            className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={async () => {
                              try {
                                await markNotificationAsRead(notifications[0].notification.id);
                                setNotifications(prev =>
                                  prev.map(n =>
                                    n.id === notifications[0].notification.id ? { ...n, read: true } : n
                                  )
                                );
                              } catch (err) {
                                console.error("Failed to mark notification as read", err);
                              }
                            }}
                          >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              {notifications[0].notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {notifications[0].notification.message}
                            </p>
                            <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-md">
                              {getScopeLabel(notifications[0].notification, user)}
                            </span>
                            <p className="text-xs text-gray-400">
                              {new Date(notifications[0].notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        )}


                      </div>

                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
                        <button onClick={handleViewAllNotificationsClick}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  {(employeeInfo || user?.role === 'admin') && (
                    <button
                      className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => {
                        setIsUserDropdownOpen(prev => !prev);
                        setIsNotificationDropdownOpen(false);
                      }}
                    >
                      <img
                        src={employeeInfo?.profileImageUrl ?? '/default-avatar.png'}
                        alt={employeeInfo?.user.fullName ?? 'Admin'}
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                      />
                    </button>
                  )}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-800">
                      {user?.role !== "admin" && (
                        <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left" onClick={handleProfileClick}>
                          Profile
                        </button>
                      )}
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