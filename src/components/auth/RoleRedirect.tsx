// RoleRedirect.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';

const RoleRedirect = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        switch (user.role) {
            case 'admin':
                navigate('/admin/dashboard');
                break;
            case 'user':
                navigate('/user/user-dashboard')
            default:
                navigate('/user/user-dashboard');
        }
    }, [user, isAuthenticated, navigate]);

    return null;
};

export default RoleRedirect;
