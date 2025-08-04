import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootState } from '../store';

import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Employees from '../pages/admin/employee/Employees';
import AddEmployee from '../pages/admin/employee/AddEmployee';
import EditEmployee from '../pages/admin/employee/EditEmployee';
import Attendance from '../pages/admin/employee/attendance/Attendance';
import AddLeaveType from '../pages/admin/employee/attendance/AddLeaveType';
import Shifts from '../pages/admin/shifts/Shifts';
import AddShifts from '../pages/admin/shifts/AddSifts';
import EditShift from '../pages/admin/shifts/EditShift';
import Departments from '../pages/admin/department/Departments';
import AddDepartment from '../pages/admin/department/AddDepartment';
import EditDepartment from '../pages/admin/department/EditDepartment';
import Permission from '../pages/admin/employee/permissions/Permission';
import AddPermission from '../pages/admin/employee/permissions/AddPermission';
import AssignSubRolePermissions from '../pages/admin/employee/permissions/AddUserPermission';
import SubRoleManagement from '../pages/admin/employee/sub-role-management/SubRoleManagement';
import CreateSubRole from '../pages/admin/employee/sub-role-management/CreateSubRole';
import EditUserPermission from '../pages/admin/employee/sub-role-management/EditUserPermission';
import OnBoardingProcess from '../pages/admin/onboarding/OnBoardingProcess';
import OnboardingForm from '../pages/admin/onboarding/OnBoardingForm';
import EditOnboardingForm from '../pages/admin/onboarding/EditOnBoarding';
import Resignations from '../pages/admin/resignation/Resignations';
import UserResignation from '../pages/admin/resignation/user-resignation/UserResignation';
import ResignationForm from '../pages/admin/resignation/user-resignation/ResignationForm';
import EditResignations from '../pages/admin/resignation/user-resignation/EditResignations';
import AssignUserPermissions from '../pages/admin/employee/permissions/AssignUserPermissions';

const RoleBasedRoutes = () => {
    const { user, permissions } = useSelector((state: RootState) => state.auth);
    if (!user) return null;
    const has = (perm: string) => permissions.includes(perm);

    return (
        <Routes>
            <Route element={<AdminLayout />}>
                {has('Dashboard:view') && <Route path="/admin/dashboard" element={<Dashboard />} />}
                {has('Employee:view') && <Route path="/admin/employees" element={<Employees />} />}
                {has('Employee:create') && <Route path="/admin/add-employee" element={<AddEmployee />} />}
                {has('Employee:update') && <Route path="/admin/edit-employee/:id" element={<EditEmployee />} />}

                {has('Attendance:view') && <Route path="/admin/attendance" element={<Attendance />} />}
                {has('Leave:create') && <Route path="/admin/add-leave-type" element={<AddLeaveType />} />}

                {has('Shift:view') && <Route path="/admin/shifts" element={<Shifts />} />}
                {has('Shift:create') && <Route path="/admin/add-shifts" element={<AddShifts />} />}
                {has('Shift:update') && <Route path="/admin/edit-shift/:id" element={<EditShift />} />}

                {has('Department:view') && <Route path="/admin/departments" element={<Departments />} />}
                {has('Department:create') && <Route path="/admin/add-department" element={<AddDepartment />} />}
                {has('Department:update') && <Route path="/admin/edit-department/:id" element={<EditDepartment />} />}

                {has('Permission:view') && <Route path="/admin/permission" element={<Permission />} />}
                {has('Permission:create') && <Route path="/admin/add-permission" element={<AddPermission />} />}
                {has('Permission:update') && <Route path="/admin/user-permission" element={<AssignSubRolePermissions />} />}

                {has('SubRole:view') && <Route path="/admin/subrole-management" element={<SubRoleManagement />} />}
                {has('SubRole:create') && <Route path="/admin/sub-role/create" element={<CreateSubRole />} />}
                {has('SubRole:update') && <Route path="/admin/sub-role/edit/:id" element={<EditUserPermission />} />}

                {has('Onboarding:view') && <Route path="/admin/onboarding" element={<OnBoardingProcess />} />}
                {has('Onboarding:create') && <Route path="/admin/onboarding/create" element={<OnboardingForm />} />}
                {has('Onboarding:update') && <Route path="/admin/onboarding/edit/:id" element={<EditOnboardingForm />} />}

                {has('Resignation:view') && <Route path="/admin/resignations" element={<Resignations />} />}
                {has('Resignation:create') && <Route path="/admin/user/resignation" element={<UserResignation />} />}
                {has('Resignation:create') && <Route path="/admin/user/resignation-form" element={<ResignationForm />} />}
                {has('Resignation:update') && <Route path="/admin/user/edit-resignation/:id" element={<EditResignations />} />}

                {has('Permission:update') && <Route path="/admin/manage-permissions/:userId" element={<AssignUserPermissions />} />}
            </Route>
            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
    );
};

export default RoleBasedRoutes;