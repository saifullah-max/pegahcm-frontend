import React, { useEffect, useState } from 'react';
import {
    getAllPermissions,
    Permission,
} from '../../../../services/permissionService';
import {
    getAllSubRoles,
    assignSubRolePermissions,
    SubRole,
} from '../../../../services/permissionService';

const AssignSubRolePermissions = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [subRoles, setSubRoles] = useState<SubRole[]>([]);
    const [selectedSubRole, setSelectedSubRole] = useState<string>('');

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

    const handleSubmit = async () => {
        if (!selectedSubRole) return alert('Please select a sub-role');
        await assignSubRolePermissions(selectedSubRole, selectedPermissions);
        alert('Permissions assigned to sub-role');
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Assign Permissions to SubRole</h2>

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

            <div className="grid gap-2 mb-4">
                {permissions.map((perm) => (
                    <label key={perm.id} className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => handlePermissionChange(perm.id)}
                        />
                        {perm.module} - {perm.action}
                    </label>
                ))}
            </div>

            <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmit}
            >
                Assign
            </button>
        </div>
    );
};

export default AssignSubRolePermissions;
