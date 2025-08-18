import {
    ArrowLeft,
    FileArchiveIcon,
    Pencil,
    Trash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    deleteResignation,
    getMyResignation,
} from '../../../../services/resignationService';

interface Resignation {
    id: string;
    resignationDate: string;
    lastWorkingDay: string;
    reason: string;
    status: string;
    clearanceStatus: string;
    assetReturnStatus: string;
}

const SubmitResignation: React.FC = () => {
    const navigate = useNavigate();
    const [resignation, setResignation] = useState<Resignation | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null); // ✅ Track which resignation to delete
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchResignation = async () => {
            setLoading(true);
            try {
                const data = await getMyResignation();
                setResignation(data);
            } catch (error) {
                console.error('Failed to load resignation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResignation();
    }, []);

    const handleEdit = (id: string) => {
        navigate(`/admin/user/edit-resignation/${id}`);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const cancelDelete = () => {
        setDeleteId(null);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteResignation(deleteId);
            setResignation(null);
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete resignation:', error);
            alert('Failed to delete resignation. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col">
            <div className="w-full max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-6 flex items-center gap-4 justify-start w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
                        aria-label="Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <FileArchiveIcon className="text-red-600" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        My Resignation
                    </h1>
                </div>

                {/* Content */}
                <div className="w-full">
                    {loading ? (
                        <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
                    ) : !resignation ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                            <p className="text-gray-700 dark:text-gray-200 mb-4">
                                You have not submitted a resignation yet.
                            </p>
                            <button
                                onClick={() => navigate('/admin/user/resignation-form')}
                                className="w-fit px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                            >
                                Submit Resignation
                            </button>
                        </div>
                    ) : (
                        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                            {/* Edit/Delete */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEdit(resignation.id)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                    title="Edit Resignation"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(resignation.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                    title="Delete Resignation"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                <p><strong>Resignation Date:</strong> {new Date(resignation.resignationDate).toDateString()}</p>
                                <p><strong>Last Working Day:</strong> {new Date(resignation.lastWorkingDay).toDateString()}</p>
                                <p><strong>Reason:</strong> {resignation.reason}</p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span
                                        className={
                                            resignation.status === 'Approved'
                                                ? 'text-green-600 font-medium'
                                                : resignation.status === 'Rejected'
                                                    ? 'text-red-600 font-medium'
                                                    : 'text-yellow-600 font-medium'
                                        }
                                    >
                                        {resignation.status}
                                    </span>
                                </p>
                                <p><strong>Clearance:</strong> {resignation.clearanceStatus}</p>
                                <p><strong>Asset Return:</strong> {resignation.assetReturnStatus}</p>
                            </div>

                            {/* Status Messages */}
                            {resignation.status === 'Rejected' && (
                                <p className="mt-4 text-sm text-red-500 font-medium">
                                    Contact HR to understand the reason for rejection.
                                </p>
                            )}
                            {resignation.status === 'Approved' && (
                                <p className="mt-4 text-sm text-green-600 font-medium">
                                    Your resignation has been approved. Please proceed with clearance and asset return.
                                </p>
                            )}
                            {resignation.status === 'Pending' && (
                                <p className="mt-4 text-sm text-yellow-600 font-medium">
                                    Please wait patiently, until HR department can review your application.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this resignation?
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
                                disabled={deleting}
                                className="px-4 py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmitResignation;
