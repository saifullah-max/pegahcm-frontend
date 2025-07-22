import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../store';

interface ProtectedRouteProps {
  allowedRole: string;
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);

  // Fallback check in case Redux state is lost on refresh
  const localStorageToken = localStorage.getItem('token');
  const isUserAuthenticated = isAuthenticated || !!localStorageToken;

  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Now check role
  if (!user || user.role !== allowedRole) {
    // Redirect to their respective dashboard or unauthorized page
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'user') {
      return <Navigate to="/user/user-dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
