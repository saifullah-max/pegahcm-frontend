import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Delete, Edit, Plus, TrashIcon } from "lucide-react";
import { getDepartments, deleteDepartment } from "../../../services/departmentService";
import { RootState } from '../../../store';
import { useSelector, useDispatch } from 'react-redux';

const Departments: React.FC = () => {
    const { permissions } = useSelector((state: RootState) => state.auth);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const navigate = useNavigate();

    const canCreateDept = permissions.includes("Department:create");


    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const departmentsData = await getDepartments();
                setDepartments(departmentsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching departments:", error);
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const columns = [
        {
            title: "S.No",
            key: "serialNumber",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Sub-Departments",
            dataIndex: "subDepartments",
            key: "subDepartments",
        },
        ...(canCreateDept
            ? [
                {
                    title: "Actions",
                    dataIndex: "actions",
                    key: "actions",
                },
            ]
            : []),
    ];

    const handleDeleteClick = (id: string) => {
        setDeleteId(id); // Opens confirmation modal
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteDepartment(deleteId);
            setDepartments((prev) => prev.filter((dept) => dept.id !== deleteId));
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to delete department';
            setError(message);
            setTimeout(() => setError(null), 4000);
        } finally {
            setDeleteId(null); // Close modal
        }
    };

    const cancelDelete = () => {
        setDeleteId(null); // Close modal
    };


    const handleEdit = (id: string) => {
        navigate(`/admin/edit-department/${id}`);
    };

    const handleNavigateToAddDepartment = () => {
        navigate("/admin/add-department");
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Building2 /> Departments
                </h1>
                {
                    canCreateDept && (
                        <button
                            onClick={handleNavigateToAddDepartment}
                            className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                        >
                            <Plus /> Add Department
                        </button>
                    )
                }

            </div>
            {error && (
                <div className="text-red-500 mt-2">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-700 dark:text-gray-300">
                    Loading...
                </div>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 dark:border-gray-700">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-900 transition-colors duration-200"
                                    >
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {departments.map((dept, index) => (
                                <tr
                                    key={dept.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {dept.subDepartments.map((subDept: any) => subDept.name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                        {canCreateDept && (
                                            <>
                                                <Edit
                                                    onClick={() => handleEdit(dept.id)}
                                                    strokeWidth={1}
                                                    size={20}
                                                    className="text-blue-500 cursor-pointer" />
                                                <TrashIcon
                                                    onClick={() => handleDeleteClick(dept.id)}
                                                    strokeWidth={1}
                                                    size={20}
                                                    className="text-red-500 cursor-pointer" />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this department?
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

export default Departments; 