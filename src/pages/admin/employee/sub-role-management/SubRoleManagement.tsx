import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, ArrowLeft, Cog } from 'lucide-react';
import { deleteSubRole, getAllSubRoles, SubRole } from '../../../../services/subRoleService';

const SubRoleManagement = () => {
    const navigate = useNavigate();
    const [subRoles, setSubRoles] = useState<SubRole[]>([]);

    useEffect(() => {
        fetchSubRoles();
    }, []);

    const fetchSubRoles = async () => {
        const subRoles = await getAllSubRoles();
        setSubRoles(subRoles);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        await deleteSubRole(id);
        fetchSubRoles();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="mb-7 flex items-center">
                    <button
                        onClick={() => navigate('/admin/permission')}
                        className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="text-xl" />
                    </button>
                    <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Cog className='text-2xl' /> Sub-Role management
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/admin/sub-role/create')}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus size={16} /> Add new sub-role
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="py-2 px-4">Name</th>
                            <th className="py-2 px-4">Description</th>
                            <th className="py-2 px-4">Permissions</th>
                            <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subRoles.map((subRole: any) => (
                            <tr key={subRole.id} className="border-t">
                                <td className="py-2 px-4">{subRole.name}</td>
                                <td className="py-2 px-4">{subRole.description}</td>
                                <td className="py-2 px-4">
                                    {subRole.permissions.map((p: any) => `${p.permission.module}:${p.permission.action}`).join(', ')}
                                </td>
                                <td className="py-2 px-4 flex gap-2">
                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => navigate(`/admin/sub-role/edit/${subRole.id}`)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="text-red-600 hover:underline"
                                        onClick={() => handleDelete(subRole.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {subRoles.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-4">
                                    No SubRoles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubRoleManagement;
