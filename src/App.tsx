import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './store';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Employees from './pages/admin/employee/Employees';
import AddEmployee from './pages/admin/employee/AddEmployee';
import Attendance from './pages/admin/employee/attendance/Attendance';
import UserDashboard from './pages/user/UserDashboard';
import UserAttendance from './pages/user/UserAttendance';
import ThemeProvider from './components/ThemeProvider';
import ForgotPassword from './pages/auth/ForgotPassword';
import Shifts from './pages/admin/shifts/Shifts';
import AddShifts from './pages/admin/shifts/AddSifts';
import EditShift from './pages/admin/shifts/EditShift';
import Departments from './pages/admin/department/Departments';
import AddDepartment from './pages/admin/department/AddDepartment';
import EditDepartment from './pages/admin/department/EditDepartment';
import EditEmployee from './pages/admin/employee/EditEmployee';
import AddLeaveType from './pages/admin/employee/attendance/AddLeaveType';
import OnBoardingProcess from './pages/admin/onboarding/OnBoardingProcess';
import OnboardingForm from './pages/admin/onboarding/OnBoardingForm';
import EditOnboardingForm from './pages/admin/onboarding/EditOnBoarding';
import UserResignation from './pages/admin/resignation/user-resignation/UserResignation';
import ResignationForm from './pages/admin/resignation/user-resignation/ResignationForm';
import Resignations from './pages/admin/resignation/Resignations';
import EditResignations from './pages/admin/resignation/user-resignation/EditResignations';
import AddPermission from './pages/admin/employee/permissions/AddPermission';
import Permission from './pages/admin/employee/permissions/Permission';
import AssignSubRolePermissions from './pages/admin/employee/permissions/AddUserPermission';
import SubRoleManagement from './pages/admin/employee/sub-role-management/SubRoleManagement';
import CreateSubRole from './pages/admin/employee/sub-role-management/CreateSubRole';
import EditUserPermission from './pages/admin/employee/sub-role-management/EditUserPermission';
import AuthInitializer from './store/slices/AuthInitilizer';
import AssignUserPermissions from './pages/admin/employee/permissions/AssignUserPermissions';
import Unauthorized from './pages/auth/Unauthorized';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Notification from './pages/admin/notifications/Notification';
import { useEffect } from 'react';
import socket from './lib/socket';
import { showInfo } from './lib/toastUtils';
import { SocketProvider } from './store/SocketContext';
import AddSalary from './pages/admin/salary/AddSalary';
import SalaryDetails from './pages/admin/salary/Salary';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);

      socket.emit('join', user.id);
      console.log(`Socket ${socket.id} joined room ${user.id}`);
    });

    socket.on('new_notification', (notif: any) => {
      console.log('🔔 New Notification:', notif);
      if (notif.showPopup) {
        showInfo(`${notif.description}`);
      }
      // Or update notification state here if needed
    });

    return () => {
      socket.off('connect');
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <Provider store={store}>
      <SocketProvider>
        <ThemeProvider>
          <AuthInitializer />
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teamMember', 'manager', 'teamLead', 'director']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredPermission="Dashboard:view">
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin/employees" element={
                  <ProtectedRoute requiredPermission="Employee:view-all">
                    <Employees />
                  </ProtectedRoute>
                } />

                <Route path="/admin/add-employee" element={
                  <ProtectedRoute requiredPermission="Employee:create">
                    <AddEmployee />
                  </ProtectedRoute>
                } />

                <Route path="/admin/edit-employee/:id" element={
                  <ProtectedRoute requiredPermission="Employee:update">
                    <EditEmployee />
                  </ProtectedRoute>
                } />

                <Route path="/admin/attendance" element={
                  <ProtectedRoute requiredPermission="Attendance:view">
                    <Attendance />
                  </ProtectedRoute>
                } />

                <Route path="/admin/add-leave-type" element={
                  <ProtectedRoute requiredPermission="Leave:create">
                    <AddLeaveType />
                  </ProtectedRoute>
                } />

                <Route path="/admin/shifts" element={
                  <ProtectedRoute requiredPermission="Shift:view">
                    <Shifts />
                  </ProtectedRoute>
                } />

                <Route path="/admin/add-shifts" element={
                  <ProtectedRoute requiredPermission="Shift:create">
                    <AddShifts />
                  </ProtectedRoute>
                } />

                <Route path="/admin/edit-shift/:id" element={
                  <ProtectedRoute requiredPermission="Shift:update">
                    <EditShift />
                  </ProtectedRoute>
                } />

                <Route path="/admin/departments" element={
                  <ProtectedRoute requiredPermission="Department:view">
                    <Departments />
                  </ProtectedRoute>
                } />

                <Route path="/admin/add-department" element={
                  <ProtectedRoute requiredPermission="Department:create">
                    <AddDepartment />
                  </ProtectedRoute>
                } />

                <Route path="/admin/edit-department/:id" element={
                  <ProtectedRoute requiredPermission="Department:update">
                    <EditDepartment />
                  </ProtectedRoute>
                } />

                <Route path="/admin/permission" element={
                  <ProtectedRoute requiredPermission="Permission:view">
                    <Permission />
                  </ProtectedRoute>
                } />

                <Route path="/admin/subrole-management" element={
                  <ProtectedRoute requiredPermission="SubRole:view">
                    <SubRoleManagement />
                  </ProtectedRoute>
                } />

                <Route path="/admin/sub-role/create" element={
                  <ProtectedRoute requiredPermission="SubRole:create">
                    <CreateSubRole />
                  </ProtectedRoute>
                } />

                <Route path="/admin/sub-role/edit/:subRoleId" element={
                  <ProtectedRoute requiredPermission="SubRole:update">
                    <EditUserPermission />
                  </ProtectedRoute>
                } />

                <Route path="/admin/onboarding" element={
                  <ProtectedRoute requiredPermission="Onboarding:view">
                    <OnBoardingProcess />
                  </ProtectedRoute>
                } />

                <Route path="/admin/onboarding/create" element={
                  <ProtectedRoute requiredPermission="Onboarding:create">
                    <OnboardingForm />
                  </ProtectedRoute>
                } />

                <Route path="/admin/onboarding/edit/:id" element={
                  <ProtectedRoute requiredPermission="Onboarding:update">
                    <EditOnboardingForm />
                  </ProtectedRoute>
                } />

                <Route path="/admin/resignations" element={
                  <ProtectedRoute requiredPermission="Resignation:approve">
                    <Resignations />
                  </ProtectedRoute>
                } />

                <Route path="/admin/user/resignation" element={
                  <ProtectedRoute requiredPermission="Resignation:create">
                    <UserResignation />
                  </ProtectedRoute>
                } />

                <Route path="/admin/user/resignation-form" element={
                  <ProtectedRoute requiredPermission="Resignation:create">
                    <ResignationForm />
                  </ProtectedRoute>
                } />

                <Route path="/admin/user/edit-resignation/:id" element={
                  <ProtectedRoute requiredPermission="Resignation:update">
                    <EditResignations />
                  </ProtectedRoute>
                } />

                <Route path="/admin/manage-permissions/:userId" element={
                  <ProtectedRoute requiredPermission="Permission:update">
                    <AssignUserPermissions />
                  </ProtectedRoute>
                } />

                <Route path='/notifications' element={
                  <ProtectedRoute requiredPermission='Notification:view'>
                    <Notification />
                  </ProtectedRoute>
                } />

                <Route path='/salary' element={
                  <ProtectedRoute requiredPermission='Salary:create'>
                    < SalaryDetails />
                  </ProtectedRoute>
                } />

                <Route path='/salary/create' element={
                  <ProtectedRoute requiredPermission='Salary:create'>
                    < AddSalary />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Routes allowed for admins only */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/add-permission" element={
                  <ProtectedRoute allowedRoles={['admin']} requiredPermission="Permission:create">
                    <AddPermission />
                  </ProtectedRoute>
                } />

                <Route path="/admin/user-permission" element={
                  <ProtectedRoute requiredPermission="Permission:update">
                    <AssignSubRolePermissions />
                  </ProtectedRoute>
                } />
              </Route>


              {/* User Routes */}
              <Route element={<AdminLayout />}>
                <Route
                  path="/user/user-dashboard"
                  element={
                    <ProtectedRoute
                      allowedRoles={['admin', 'teamMember', 'manager', 'teamLead', 'director']}
                      requiredPermission="Dashboard:view"
                    >
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/user-attendance"
                  element={
                    <ProtectedRoute
                      allowedRoles={['admin', 'teamMember', 'manager', 'teamLead', 'director']}
                      requiredPermission="Attendance:view"
                    >
                      <UserAttendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/user-resignation"
                  element={
                    <ProtectedRoute
                      allowedRoles={['admin', 'teamMember', 'manager', 'teamLead', 'director']}
                      requiredPermission="Resignation:view"
                    >
                      <UserResignation />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback & Unauthorized */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            pauseOnHover={false}
            pauseOnFocusLoss={false}
          />
        </ThemeProvider>
      </SocketProvider>
    </Provider>
  );
}

export default App;
