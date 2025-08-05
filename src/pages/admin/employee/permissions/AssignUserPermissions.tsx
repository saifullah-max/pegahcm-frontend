import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getAllPermissions,
    assignUserPermissions,
    getPermissionsOfUser,
    getUserById,
    Permission,
    getPermissionIdByUserId,
} from '../../../../services/permissionService';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { showError, showSuccess } from '../../../../lib/toastUtils';

const ACTIONS = ['view', 'create', 'update', 'delete', '|', 'approve', 'reject'];

const AssignUserPermissions = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const perms = await getAllPermissions(); // full permission list
                const userPermIds = await getPermissionIdByUserId(userId!); // only IDs
                const user = await getUserById(userId!); // get user info

                setPermissions(perms);
                setSelectedPermissions(userPermIds); // correct permission IDs
                setUserName(user.fullName || user.username); // correct user object

                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        fetchData();
    }, [userId]);

    const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, perm) => {
        acc[perm.module] = acc[perm.module] || [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const handleToggle = (permId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permId)
                ? prev.filter((id) => id !== permId)
                : [...prev, permId]
        );
    };

    const handleGroupToggle = (module: string) => {
        const modulePermissions = permissions
            .filter((p) => p.module === module)
            .map((p) => p.id);
        const allSelected = modulePermissions.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) =>
                prev.filter((id) => !modulePermissions.includes(id))
            );
        } else {
            setSelectedPermissions((prev) => [
                ...prev,
                ...modulePermissions.filter((id) => !prev.includes(id)),
            ]);
        }
    };

    const isGroupSelected = (module: string) => {
        const modulePermissions = permissions
            .filter((p) => p.module === module)
            .map((p) => p.id);
        return modulePermissions.every((id) => selectedPermissions.includes(id));
    };

    const handleSubmit = async () => {
        try {
            await assignUserPermissions(userId!, selectedPermissions);
            showSuccess('Permissions updated for user.')
            navigate(-1);
        } catch (err) {
            console.error(err);
            showError('Failed to assign permissions')
        }
    };

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (
        <div className="p-4">
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Assign Permissions to <span className="text-blue-600">{userName}</span>
                </h2>
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
                                <tr key={module} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                                                        onChange={() => handleToggle(permMap[action].id)}
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
                onClick={handleSubmit}
                className='w-fit px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]'
            >
                Save Permissions
            </button>
        </div>
    );
};

export default AssignUserPermissions;
