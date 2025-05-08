import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import Employees from './pages/admin/Employees';
import AddEmployee from './pages/admin/AddEmployee';
import Attendance from './pages/admin/Attendance';
import UserDashboard from './pages/user/UserDashboard';
import UserAttendance from './pages/user/UserAttendance';
import ThemeProvider from './components/ThemeProvider';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="admin/dashboard" element={<Dashboard />} />
                <Route path="admin/employees" element={<Employees />} />
                <Route path="admin/attendance" element={<Attendance />} />
                <Route path="admin/add-employee" element={<AddEmployee />} />
              </Route>
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute allowedRole="user" />}>
              <Route element={<UserLayout />}>
                <Route path="user/user-dashboard" element={<UserDashboard />} />
                <Route path="user/user-attendance" element={<UserAttendance />} />
              </Route>
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
