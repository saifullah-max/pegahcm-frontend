import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthHydrated } = useSelector((state: any) => state.auth);

  // ✅ Optional: Console logs for debugging
  console.log("✅ ProtectedRoute: user =", user);
  console.log("✅ ProtectedRoute: isAuthHydrated =", isAuthHydrated);

  // 🕓 Wait until auth is fully loaded
  if (!isAuthHydrated) {
    return <div>Loading...</div>; // or use a Spinner component
  }

  // 🔐 If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Check both role and subRole.name for access
  const hasRoleAccess =
    allowedRoles.includes(user.role) ||
    (user.subRole?.name && allowedRoles.includes(user.subRole.name));

  if (!hasRoleAccess) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
