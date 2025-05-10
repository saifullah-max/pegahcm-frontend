import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../store';

interface ProtectedRouteProps {
  allowedRole: string;
}

const ProtectedRoute = (
  { allowedRole }: ProtectedRouteProps
) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  
  // Check both Redux state and localStorage for authentication
  const localStorageToken = localStorage.getItem('token');
  const isUserAuthenticated = isAuthenticated || !!localStorageToken;

  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;