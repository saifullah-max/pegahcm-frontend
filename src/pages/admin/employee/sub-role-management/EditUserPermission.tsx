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

const actionList = ['view', 'create', 'update', 'delete', 'approve', 'reject'];

const EditUserPermission = () => {
    const { subRoleId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPermissions = async () => {
            const all = await getAllPermissions();
            const assigned = await getSubRolePermissions(subRoleId || '');
            setPermissions(all);
            setSelected(assigned);
        };

        fetchPermissions();
    }, [subRoleId]);

    const togglePermission = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!subRoleId) return;

        setLoading(true);
        setMessage('');

        try {
            await updateSubRolePermissions(subRoleId, selected);
            // setMessage('Permissions updated successfully!');
            showSuccess('Permissions updated successfully!')
        } catch {
            // setMessage('Something went wrong.');
            showInfo('Something went wrong.')
        }

        setLoading(false);
    };

    // Group permissions by module
    const moduleMap: { [key: string]: { [action: string]: Permission } } = {};
    permissions.forEach((perm) => {
        if (!moduleMap[perm.module]) moduleMap[perm.module] = {};
        moduleMap[perm.module][perm.action] = perm;
    });

    return (
        <div className="min-h-screen flex flex-col items-center pt-10 px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-6xl mb-6 flex items-center">
                <button
                    onClick={() => navigate('/admin/permission')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ShieldCheck className="text-2xl" /> Edit SubRole Permissions
                </h1>
            </div>

            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left text-gray-700 dark:text-gray-300">Module</th>
                            {actionList.map((action) => (
                                <th key={action} className="border-b p-2 text-sm capitalize text-gray-700 dark:text-gray-300">
                                    {action}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(moduleMap).map(([moduleName, actionObj]) => (
                            <tr key={moduleName} className="border-t">
                                <td className="p-2 font-medium text-gray-800 dark:text-white">{moduleName}</td>
                                {actionList.map((action) => {
                                    const perm = actionObj[action];
                                    return (
                                        <td key={action} className="p-2 text-center">
                                            {perm ? (
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                    className="accent-blue-600"
                                                />
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    onClick={handleSave}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>

                {message && (
                    <p className={`mt-3 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default EditUserPermission;
