import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarSync, Delete, Edit, Plus, TrashIcon } from "lucide-react";
import { getShifts, deleteShift } from "../../../services/ShiftService";
import { RootState } from '../../../store';
import { useSelector, useDispatch } from 'react-redux';
import { showError, showSuccess } from "../../../lib/toastUtils";


const Shifts: React.FC = () => {
    const { permissions } = useSelector((state: RootState) => state.auth);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const navigate = useNavigate();

    const canCreateShift = permissions.includes("Shift:create");


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

    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

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
            title: "Valid Till",
            dataIndex: "validTill",
            key: "validTill",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        ...(canCreateShift
            ? [
                {
                    title: "Actions",
                    dataIndex: "actions",
                    key: "actions",
                },
            ]
            : []),
    ];



    // const handleDelete = async (id: string) => {
    //     if (window.confirm("Are you sure you want to delete this shift?")) {
    //         try {
    //             await deleteShift(id);
    //             // Refresh the list
    //             showSuccess("Shift deleted successfully")
    //             setShifts(shifts.filter(shift => shift.id !== id));
    //         } catch (error) {
    //             console.error("Error deleting shift:", error);
    //         }
    //     }
    // };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id); // Opens modal
    };


    // On Confirm
    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteShift(deleteId);
            setShifts(shifts.filter((shift) => shift.id !== deleteId));
            showSuccess('Shift deleted successfully');
        } catch (error) {
            showError('Failed to delete shift');
        } finally {
            setDeleteId(null); // Close modal
        }
    };

    // On Cancel
    const cancelDelete = () => {
        setDeleteId(null);
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
                {canCreateShift && (
                    <button
                        onClick={handleNavigateToAddShifts}
                        className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                    >
                        <Plus /> Add Shift
                    </button>
                )}

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
                                        {formatTime(data.startTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {formatTime(data.endTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {formatDate(data.endTime)} {/* Valid Till */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                                        {data.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                        {canCreateShift && (
                                            <>
                                                <Edit
                                                    onClick={() => handleEdit(data.id)}
                                                    strokeWidth={1}
                                                    size={20}
                                                    className="text-blue-500 cursor-pointer"
                                                />
                                                <TrashIcon
                                                    onClick={() => handleDeleteClick(data.id)}
                                                    strokeWidth={1}
                                                    size={20}
                                                    className="text-red-500 cursor-pointer"
                                                />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full animate-fadeIn transition-transform duration-200">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this shift? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
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

export default Shifts;
