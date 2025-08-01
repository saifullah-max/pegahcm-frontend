import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
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
import HRDashboard from './pages/hr/HRDashboard';
import HRLayout from './layouts/HRLayout';
import Employees_HR from './pages/hr/Employees';
import Attendance_HR from './pages/hr/Attendance';
import Departments_HR from './pages/hr/Departments';
import EditDepartment_HR from './pages/hr/EditDepartment';
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="admin/employees" element={<Employees />} />
                <Route path="admin/attendance" element={<Attendance />} />
                <Route path='admin/add-leave-type' element={<AddLeaveType />} />
                <Route path="/admin/add-employee" element={<AddEmployee />} />
                <Route path='admin/edit-employee/:id' element={<EditEmployee />} />
                <Route path="admin/shifts" element={<Shifts />} />
                <Route path="admin/add-shifts" element={<AddShifts />} />
                <Route path="admin/edit-shift/:id" element={<EditShift />} />
                <Route path="admin/departments" element={<Departments />} />
                <Route path="admin/add-department" element={<AddDepartment />} />
                <Route path="admin/edit-department/:id" element={<EditDepartment />} />
                <Route path='admin/permission' element={<Permission />} />
                <Route path='admin/add-permission' element={<AddPermission />} />
                <Route path='/admin/user-permission' element={<AssignSubRolePermissions />} />
                <Route path='/admin/subrole-management' element={<SubRoleManagement />} />
                <Route path='/admin/sub-role/create' element={<CreateSubRole />} />
                <Route path='/admin/sub-role/edit/:id' element={<EditUserPermission />} />
                <Route path='/admin/onboarding' element={<OnBoardingProcess />} />
                <Route path='/admin/onboarding/create' element={<OnboardingForm />} />
                <Route path='/admin/onboarding/edit/:id' element={<EditOnboardingForm />} />
                <Route path='/admin/resignations' element={<Resignations />} />
                <Route path='/admin/user/resignation' element={<UserResignation />} />
                <Route path='/admin/user/resignation-form' element={<ResignationForm />} />
                <Route path='/admin/user/edit-resignation/:id' element={<EditResignations />} />
                <Route path='/admin/manage-permissions/:userId' element={<AssignUserPermissions />} />
                {/* <Route element={<UserLayout />}>
                  <Route path="/user/user-dashboard" element={<UserDashboard />} />
                  <Route path="/user/user-attendance" element={<UserAttendance />} />

                </Route> */}
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'user']} key='user' />}>
              <Route element={<UserLayout />}>
                <Route path="/user/user-dashboard" element={<UserDashboard />} />
                <Route path="/user/user-attendance" element={<UserAttendance />} />
              </Route>
            </Route>

            {/* HR Routes */}

            <Route element={<HRLayout />}>
              <Route path='/hr/dashboard' element={<HRDashboard />} />
              <Route path='/hr/employees' element={<Employees_HR />} />
              <Route path='/hr/attendance' element={<Attendance_HR />} />
              <Route path='/hr/departments' element={<Departments_HR />} />
              <Route path='/hr/edit-department/:id' element={<EditDepartment_HR />} />

            </Route>
            {/* <Route element={<ProtectedRoute allowedRole="hr" />}>
            </Route> */}

            {/* User Routes */}
            {/* <Route element={<ProtectedRoute allowedRole="user" />}>

            </Route> */}

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
