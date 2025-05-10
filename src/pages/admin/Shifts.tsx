import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarSync, Delete, Edit, Plus, TrashIcon } from "lucide-react";
import { getShifts, deleteShift } from "../../services/ShiftService";


const Shifts: React.FC = () => {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const shiftsData = await getShifts();
                setShifts(shiftsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching shifts:", error);
                setLoading(false);
            }
        };

        fetchShifts();
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
            title: "Start Time",
            dataIndex: "startTime",
            key: "startTime",
        },
        {
            title: "End Time",
            dataIndex: "endTime",
            key: "endTime",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
        },
    ];

    

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this shift?")) {
            try {
                await deleteShift(id);
                // Refresh the list
                setShifts(shifts.filter(shift => shift.id !== id));
            } catch (error) {
                console.error("Error deleting shift:", error);
            }
        }
    };

    const handleEdit = (id: string) => {
        navigate(`/admin/edit-shift/${id}`);
    };

    const handleNavigateToAddShifts = () => {
        navigate("/admin/add-shifts");
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900  transition-colors duration-200">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <CalendarSync /> Shifts
                </h1>
                <button
                    onClick={handleNavigateToAddShifts}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus /> Add Shift
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
                            {shifts.map((data) => (
                                <tr
                                    key={data.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.startTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.endTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                        <Edit
                                            onClick={() => handleEdit(data.id)}
                                            strokeWidth={1}
                                            size={20}
                                            className="text-blue-500 cursor-pointer" />
                                        <TrashIcon
                                            onClick={() => handleDelete(data.id)}
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

export default Shifts;
