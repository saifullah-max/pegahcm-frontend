import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Delete, Edit, Plus, TrashIcon } from "lucide-react";
import { getDepartments, deleteDepartment } from "../../services/departmentService";

const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

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
            title: "ID",
            dataIndex: "id",
            key: "id",
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
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
        },
    ];

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                await deleteDepartment(id);
                // Refresh the list
                setDepartments(departments.filter(dept => dept.id !== id));
            } catch (error) {
                console.error("Error deleting department:", error);
            }
        }
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
                <button
                    onClick={handleNavigateToAddDepartment}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus /> Add Department
                </button>
            </div>

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
                            {departments.map((dept) => (
                                <tr
                                    key={dept.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {dept.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {dept.subDepartments?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                        <Edit
                                            onClick={() => handleEdit(dept.id)}
                                            strokeWidth={1}
                                            size={20}
                                            className="text-blue-500 cursor-pointer" />
                                        <TrashIcon
                                            onClick={() => handleDelete(dept.id)}
                                            strokeWidth={1}
                                            size={20}
                                            className="text-red-500 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Departments; 