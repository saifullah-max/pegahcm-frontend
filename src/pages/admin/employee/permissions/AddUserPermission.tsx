import React, { useEffect, useState } from 'react';
import {
    getAllPermissions,
    Permission,
    assignSubRolePermissions,
    SubRole,
    getSubRolePermissions,
} from '../../../../services/permissionService';
import { getAllSubRoles } from '../../../../services/subRoleService';
import { ArrowLeft, Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '../../../../lib/toastUtils';

const AssignSubRolePermissions = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [subRoles, setSubRoles] = useState<SubRole[]>([]);
    const [selectedSubRole, setSelectedSubRole] = useState<string>('');

    const fetchSubRolePermissions = async () => {
        if (!selectedSubRole) return;
        try {
            const assigned = await getSubRolePermissions(selectedSubRole);
            setSelectedPermissions(assigned);
        } catch (error) {
            console.error('Failed to load sub-role permissions:', error);
        }
    };

    useEffect(() => {
        fetchSubRolePermissions();
    }, [selectedSubRole]);

    useEffect(() => {
        const fetchData = async () => {
            const perms = await getAllPermissions();
            const roles = await getAllSubRoles();
            setPermissions(perms);
            setSubRoles(roles);
        };
        fetchData();
    }, []);

    const handlePermissionChange = (id: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleGroupToggle = (module: string) => {
        const modulePermissions = permissions.filter((p) => p.module === module).map((p) => p.id);
        const allSelected = modulePermissions.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !modulePermissions.includes(id)));
        } else {
            setSelectedPermissions((prev) => [
                ...prev,
                ...modulePermissions.filter((id) => !prev.includes(id)),
            ]);
        }
    };

    const isGroupSelected = (module: string) => {
        const modulePermissions = permissions.filter((p) => p.module === module).map((p) => p.id);
        return modulePermissions.every((id) => selectedPermissions.includes(id));
    };

    const handleSubmit = async () => {
        if (!selectedSubRole) return alert('Please select a sub-role');
        await assignSubRolePermissions(selectedSubRole, selectedPermissions);
        showSuccess(`Permissions assigned to ${selectedSubRole}`)
        navigate('/admin/permission')
    };

    const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, perm) => {
        acc[perm.module] = acc[perm.module] || [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const ACTIONS = ['view', 'create', 'update', 'delete', 'view-all', '|', 'approve', 'reject'];


    return (
        <div className="p-4">
            <div className="mb-7 flex items-center">
                <button
                    onClick={() => navigate('/admin/permission')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Cog className="text-2xl" /> Assign Sub-role Permissions
                </h1>
            </div>

            <div className="mb-4">
                <label className="block mb-1 font-semibold">Select SubRole:</label>
                <select
                    className="border p-2 rounded w-full"
                    value={selectedSubRole}
                    onChange={(e) => setSelectedSubRole(e.target.value)}
                >
                    <option value="">-- Select SubRole --</option>
                    {subRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto border rounded bg-white dark:bg-gray-900 p-4">
                <table className="min-w-full text-left table-fixed border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr className="text-gray-700 dark:text-gray-200">
                            <th className="w-1/5 py-3 px-4 font-semibold">Module</th>
                            {ACTIONS.map((action, index) =>
                                action === '|' ? (
                                    <th key={index} className="w-[2px] px-0" />
                                ) : (
                                    <th key={action} className="w-[14%] py-3 px-4 font-semibold capitalize text-center">
                                        {action}
                                    </th>
                                )
                            )}

                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedPermissions).map(([module, perms]) => {
                            const permMap = Object.fromEntries(perms.map((p) => [p.action, p]));

                            return (
                                <tr
                                    key={module}
                                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isGroupSelected(module)}
                                                onChange={() => handleGroupToggle(module)}
                                                className="accent-blue-600"
                                            />
                                            {module}
                                        </label>
                                    </td>
                                    {ACTIONS.map((action, index) =>
                                        action === '|' ? (
                                            <td key={index} className="bg-gray-200 w-[2px] px-0" />
                                        ) : (
                                            <td key={action} className="py-3 px-4 text-center">
                                                {permMap[action] ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(permMap[action].id)}
                                                        onChange={() => handlePermissionChange(permMap[action].id)}
                                                        className="accent-blue-600"
                                                    />
                                                ) : (
                                                    <div className="h-5" />
                                                )}
                                            </td>
                                        )
                                    )}

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSubmit}
            >
                Assign Permissions
            </button>
        </div>
    );
};

export default AssignSubRolePermissions;
