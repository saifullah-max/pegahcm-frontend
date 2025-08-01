import {
    ArrowLeft,
    FileArchiveIcon,
    LogOut,
    Pencil,
    Plus,
    Trash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    deleteResignation,
    getAllResignations,
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

    useEffect(() => {
        const fetchResignation = async () => {
            setLoading(true);
            try {
                const data = await getAllResignations();
                setResignation(data?.[0] || null); // assuming only one resignation
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

    const handleDelete = async (id: string) => {
        const confirmed = confirm('Are you sure you want to delete this resignation?');
        if (!confirmed) return;

        try {
            await deleteResignation(id);
            setResignation(null);
        } catch (error) {
            console.error('Failed to delete resignation:', error);
            alert('Failed to delete resignation. Please try again.');
        }
    };

    return (
        <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-xl flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/resignations')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileArchiveIcon className="text-red-600" />
                    My Resignation
                </h1>
            </div>

            {/* Resignation Card */}
            <div className="w-full max-w-xl">
                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
                ) : !resignation ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                        <p className="text-gray-700 dark:text-gray-200 mb-4">
                            You have not submitted a resignation yet.
                        </p>
                        <button
                            onClick={() => navigate('/admin/user/resignation-form')}
                            className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition"
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
                                onClick={() => handleDelete(resignation.id)}
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

                        {/* Status Message */}
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
                                Please wait patiently, until HR department can review your application
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitResignation;
