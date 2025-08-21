import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';

const ProtectedRoute = ({
  allowedRoles = [],
  requiredPermission = '',
  children,
}: {
  allowedRoles?: string[];
  requiredPermission?: string;
  children: React.ReactNode;
}) => {
  const { user, permissions, isAuthHydrated } = useSelector(
    (state: RootState) => state.auth
  );

  const isLoading = !isAuthHydrated || !user;

  if (isLoading) return <div>Loading...</div>;

  const roleAllowed =
    allowedRoles.length === 0 ||
    allowedRoles.includes(user.role) ||
    allowedRoles.includes(user.subRole?.name || '');
  console.log("USER sub-role:", user.subRole?.name);
  console.log("USER role:", user.role);
  console.log("ROLE ALLOWED?", roleAllowed);


  const hasPermission =
    !requiredPermission || permissions.includes(requiredPermission);
  console.log("HAS PERMISSION:", hasPermission);

  if (!roleAllowed || !hasPermission) {
    // Redirect admin to /admin/dashboard and others to /user/user-dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'user') return <Navigate to="/user/user-dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
