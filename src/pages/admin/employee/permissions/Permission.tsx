import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cog, Eye, Plus, Shield } from 'lucide-react';
import { getAllPermissions } from '../../../../services/permissionService';
import type { Permission } from '../../../../services/permissionService';

const ACTION_ORDER = ['view', 'create', 'update', 'delete', 'approve'] as const;

type ActionType = typeof ACTION_ORDER[number];

const actionColor: Record<ActionType, string> = {
    view: 'bg-gray-400',
    create: 'bg-green-400',
    update: 'bg-yellow-400',
    delete: 'bg-red-400',
    approve: 'bg-indigo-400',
};

const defaultActionColor = 'bg-blue-600';

const Permission = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const handleNavigateToAddPermission = () => navigate("/admin/add-permission");
    const handleNavigateToAddUserPermission = () => navigate("/admin/user-permission");
    const handleNavigateToSubRoleManagement = () => navigate("/admin/subrole-management");

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const perms = await getAllPermissions();
                setPermissions(perms);
            } catch (error) {
                console.error("Failed to load permissions:", error);
            }
        };
        fetchPermissions();
    }, []);

    const groupedPermissions = Object.entries(
        permissions.reduce((acc: Record<string, Permission[]>, perm) => {
            acc[perm.module] = acc[perm.module] || [];
            acc[perm.module].push(perm);
            return acc;
        }, {})
    ).sort(([moduleA], [moduleB]) => moduleA.localeCompare(moduleB));

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-7 flex items-center">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Shield className='text-2xl' /> Permission Management
                </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={handleNavigateToAddPermission}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 bg-[#255199] hover:bg-[#2F66C1] transition-colors"
                >
                    <Plus size={16} /> Add permissions
                </button>
                <button
                    onClick={handleNavigateToAddUserPermission}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 bg-[#255199] hover:bg-[#2F66C1] transition-colors"
                >
                    <Plus size={16} /> Add sub-role permissions
                </button>
                <button
                    onClick={handleNavigateToSubRoleManagement}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 bg-[#255199] hover:bg-[#2F66C1] transition-colors"
                >
                    <Eye size={18} /> Sub-Role Management
                </button>
            </div>

            {/* Permissions Table */}
            <div className="mt-8 border rounded bg-white dark:bg-gray-900 p-4 overflow-auto max-h-[60vh]">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                    All Permissions Overview
                </h2>

                {permissions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No permissions found.</p>
                ) : (
                    <table className="min-w-full text-sm table-auto">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="py-2 px-4 text-left w-1/4">Module</th>
                                <th className="py-2 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedPermissions.map(([module, perms]) => {
                                const sortedPerms = [...perms].sort((a, b) => {
                                    const indexA = ACTION_ORDER.indexOf(a.action as ActionType);
                                    const indexB = ACTION_ORDER.indexOf(b.action as ActionType);
                                    if (indexA === -1 && indexB === -1) return a.action.localeCompare(b.action);
                                    if (indexA === -1) return 1;
                                    if (indexB === -1) return -1;
                                    return indexA - indexB;
                                });

                                return (
                                    <tr
                                        key={module}
                                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100 capitalize">
                                            {module}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-2">
                                                {sortedPerms.map((perm) => {
                                                    const color =
                                                        actionColor[perm.action as ActionType] || defaultActionColor;
                                                    return (
                                                        <span
                                                            key={perm.id}
                                                            title={perm.description || ''}
                                                            className={`${color} text-white px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm`}
                                                        >
                                                            {perm.action}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Permission;
