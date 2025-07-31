import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubRole } from '../../../../services/subRoleService';
import { getAllPermissions, Permission } from '../../../../services/permissionService';

const CreateSubRole = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissionIds, setPermissionIds] = useState<string[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

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
            await createSubRole({ name, description, permissionIds });
            navigate('/admin/subrole-management');
        } catch (err) {
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
            <h1 className="text-2xl font-bold mb-4">Create SubRole</h1>
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create SubRole
                </button>
            </form>
        </div>
    );
};

export default CreateSubRole;
