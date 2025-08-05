import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, ArrowLeft, Cog } from 'lucide-react';
import { deleteSubRole, getAllSubRoles, SubRole } from '../../../../services/subRoleService';

const SubRoleManagement = () => {
    const navigate = useNavigate();
    const [subRoles, setSubRoles] = useState<SubRole[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    useEffect(() => {
        fetchSubRoles();
    }, []);

    const fetchSubRoles = async () => {
        const subRoles = await getAllSubRoles();
        setSubRoles(subRoles);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteSubRole(deleteId);
            fetchSubRoles();
        } catch (error) {
            console.error("Error deleting sub-role:", error);
        } finally {
            setDeleteId(null); // Close modal
        }
    };

    const cancelDelete = () => {
        setDeleteId(null); // Close modal
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
                                        onClick={() => handleDeleteClick(subRole.id)}
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
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this sub-role?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-md text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SubRoleManagement;
