import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubRole } from '../../../../services/subRoleService';
import { getAllPermissions, Permission } from '../../../../services/permissionService';
import { showError, showSuccess } from '../../../../lib/toastUtils';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const CreateSubRole = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissionIds, setPermissionIds] = useState<string[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [level, setLevel] = useState('');


    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const permissions = await getAllPermissions(); // ✅ Proper function call
            setAllPermissions(permissions); // ✅ no `.data` since it's not Axios
        } catch (err) {
            console.error('Failed to fetch permissions', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSubRole({ name, description, level: Number(level), permissionIds });
            showSuccess(`${name} as sub-role added`)
            navigate('/admin/subrole-management');
        } catch (err) {
            showError("Error while adding new sub-role")
            console.error('Error creating subRole', err);
        }
    };

    const togglePermission = (id: string) => {
        setPermissionIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                    <ArrowLeft className="text-xl w-5 h-5" />
                </button>
                <h2 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Create Sub-Role
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Sub-role name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    className="w-full border rounded px-3 py-2"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Level (e.g., 1)"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    required
                />

                <div>
                    <label className="font-medium block mb-2">Assign Permissions:</label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {allPermissions.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={permissionIds.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                />
                                {perm.module}:{perm.action}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className='w-fit px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]'
                >
                    Create SubRole
                </button>
            </form>
        </div>
    );
};

export default CreateSubRole;
