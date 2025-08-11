import React, { useEffect, useState } from 'react';
import {
    getAllPermissions,
    getSubRolePermissions,
    updateSubRolePermissions,
    Permission
} from '../../../../services/permissionService';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { showInfo, showSuccess } from '../../../../lib/toastUtils';

const actionList = ['view', 'view-all', 'create', 'update', 'delete', 'approve', 'reject'];

const EditUserPermission = () => {
    const { subRoleId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [missingAssigned, setMissingAssigned] = useState<string[]>([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const all = await getAllPermissions();
                const assigned = await getSubRolePermissions(subRoleId || '');
                setPermissions(all);

                const allIdsSet = new Set(all.map(p => p.id.trim()));

                // Normalize assigned IDs whether assigned is string[] or object[]
                type AssignedType = string | { id: string };

                const assignedNormalized = (assigned as AssignedType[]).map(item => {
                    if (typeof item === 'string') return item.trim();
                    if (item && typeof item.id === 'string') return item.id.trim();
                    return '';
                }).filter(id => id !== '');

                const missing = assignedNormalized.filter(id => !allIdsSet.has(id));
                setMissingAssigned(missing);

                const filteredAssigned = assignedNormalized.filter(id => allIdsSet.has(id));
                setSelected(filteredAssigned);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
                setPermissions([]);
                setSelected([]);
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [subRoleId]);

    const togglePermission = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!subRoleId) return;

        setLoading(true);
        setMessage('');


        try {
            await updateSubRolePermissions(subRoleId, selected);
            showSuccess('Permissions updated successfully!');
            setMessage('Permissions updated successfully!');
        } catch (error) {
            showInfo('Something went wrong.');
            setMessage('Something went wrong.');
        }

        setLoading(false);
    };

    // Group permissions by module for table display
    const moduleMap: { [key: string]: { [action: string]: Permission } } = {};
    permissions.forEach(perm => {
        if (!moduleMap[perm.module]) moduleMap[perm.module] = {};
        moduleMap[perm.module][perm.action] = perm;
    });

    const allModules = Array.from(new Set(permissions.map(p => p.module)));

    return (
        <div className="min-h-screen flex flex-col items-center pt-10 px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-6xl mb-6 flex items-center">
                <button
                    onClick={() => navigate('/admin/permission')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    disabled={loading}
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ShieldCheck className="text-2xl" /> Edit SubRole Permissions
                </h1>
            </div>

            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
                {loading && (
                    <p className="mb-4 text-center text-gray-500 dark:text-gray-400">Loading permissions...</p>
                )}

                {missingAssigned.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                        Warning: Some assigned permissions not found in all permissions: <br />
                        {missingAssigned.map(id => (
                            <span key={id} className="inline-block mr-2 font-mono">{id}</span>
                        ))}
                    </div>
                )}

                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left text-gray-700 dark:text-gray-300">Module</th>
                            {actionList.map(action => (
                                <th
                                    key={action}
                                    className="border-b p-2 text-sm capitalize text-gray-700 dark:text-gray-300"
                                >
                                    {action}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allModules.map(moduleName => (
                            <tr key={moduleName} className="border-t">
                                <td className="p-2 font-medium text-gray-800 dark:text-white">{moduleName}</td>
                                {actionList.map(action => {
                                    const perm = permissions.find(p => p.module === moduleName && p.action === action);
                                    if (perm) {
                                        // permission exists in backend
                                        return (
                                            <td key={action} className="p-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                    className="accent-blue-600"
                                                    disabled={loading}
                                                />
                                            </td>
                                        );
                                    } else {
                                        // permission does not exist - optionally show disabled unchecked box
                                        return (
                                            <td key={action} className="p-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    disabled
                                                    className="accent-gray-400 cursor-not-allowed"
                                                    title="Permission not available"
                                                />
                                            </td>
                                        );
                                    }
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    onClick={() => {
                        handleSave();
                    }} className="mt-6 w-fit px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>

                {message && (
                    <p
                        className={`mt-3 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default EditUserPermission;
