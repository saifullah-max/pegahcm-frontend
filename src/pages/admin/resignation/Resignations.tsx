import { useEffect, useState } from 'react';
import {
    getAllResignations,
    processResignation,
    deleteResignation,
    Resignation,
    updateClearanceAndAssetStatus,
} from '../../../services/resignationService';
import { CheckCircle, XCircle, Pencil, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Resignations = () => {
    const navigate = useNavigate();
    const [resignations, setResignations] = useState<Resignation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
    const [clearanceStatus, setClearanceStatus] = useState('');
    const [assetReturnStatus, setAssetReturnStatus] = useState('');
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        console.log("Resignations Component Rendered");

        fetchResignations();
    }, []);

    const fetchResignations = async () => {
        try {
            const data = await getAllResignations();
            console.log("Resignation data:", data);
            setResignations(data);
        } catch (error) {
            console.error('Failed to fetch resignations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProcessedById = (): string | null => {
        try {
            const persistedRoot = localStorage.getItem('persist:root');
            if (!persistedRoot) return null;

            const parsedRoot = JSON.parse(persistedRoot);
            const auth = JSON.parse(parsedRoot.auth);
            return auth?.user?.id ?? null;
        } catch (err) {
            console.error('Failed to extract processedById:', err);
            return null;
        }
    };

    const storedProcessedById = getProcessedById();
    if (!storedProcessedById) {
        alert('Unable to identify logged-in HR user. Please log in again.');
        window.location.href = '/login';
        return null;
    }

    const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
        const remarks = prompt(`Enter remarks for ${status.toLowerCase()} resignation:`);
        if (!remarks) return alert('Remarks are required.');

        setProcessingId(id);
        try {
            await processResignation(id, status, storedProcessedById, remarks);
            await fetchResignations();
        } catch (error) {
            console.error('Error processing resignation:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleEditClick = (resignation: Resignation) => {
        setSelectedResignation(resignation);
        setClearanceStatus(resignation.clearanceStatus);
        setAssetReturnStatus(resignation.assetReturnStatus);
        setStatus(resignation.status);
        setRemarks(resignation.reviewComments || '');
        setEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedResignation) return;

        try {
            await updateClearanceAndAssetStatus(selectedResignation.id, {
                clearanceStatus,
                assetReturnStatus,
                status,
                reviewComments: remarks.trim() || undefined,
            });
            setEditModalOpen(false);
            await fetchResignations();
        } catch (err) {
            console.error(err);
            alert('Failed to update status.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resignation?')) return;
        try {
            await deleteResignation(id);
            await fetchResignations();
        } catch (error) {
            console.error('Failed to delete resignation:', error);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
                        title="Back"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Resignation Requests
                    </h2>
                </div>
                <button
                    onClick={() => navigate('/admin/user/resignation')}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-2 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus size={16} /> User Resignation Page
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {resignations.map((resignation) => {
                    const statusColor =
                        resignation.status === 'Approved'
                            ? 'border-green-500'
                            : resignation.status === 'Rejected'
                                ? 'border-red-500'
                                : 'border-yellow-500';

                    const statusBg =
                        resignation.status === 'Approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : resignation.status === 'Rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

                    return (
                        <div
                            key={resignation.id}
                            className={`relative border-l-4 ${statusColor} rounded-lg p-5 shadow-md bg-white dark:bg-gray-800`}
                        >
                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => handleEditClick(resignation)} title="Edit">
                                    <Pencil className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" size={18} />
                                </button>
                                <button onClick={() => handleDelete(resignation.id)} title="Delete">
                                    <Trash2 className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" size={18} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="text-sm space-y-1 text-gray-800 dark:text-gray-100">
                                <p><strong>Employee ID:</strong> {resignation.employeeId}</p>
                                <p><strong>Name:</strong> {resignation.employee.user.fullName}</p>
                                <p><strong>Resignation Date:</strong> {new Date(resignation.resignationDate).toLocaleDateString()}</p>
                                <p><strong>Last Working Day:</strong> {new Date(resignation.lastWorkingDay).toLocaleDateString()}</p>
                                <p><strong>Reason:</strong> {resignation.reason}</p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span className={`px-2 py-1 rounded text-sm font-semibold ${statusBg}`}>
                                        {resignation.status}
                                    </span>
                                </p>
                                <p><strong>Clearance:</strong> {resignation.clearanceStatus}</p>
                                <p><strong>Asset Return:</strong> {resignation.assetReturnStatus}</p>
                                <p><strong>Remarks:</strong> {resignation.reviewComments || '—'}</p>
                                {resignation.processedBy && (
                                    <p><strong>Processed By:</strong> {resignation.processedBy.fullName}</p>
                                )}
                                {resignation.processedAt && (
                                    <p><strong>Processed At:</strong> {new Date(resignation.processedAt).toLocaleDateString()}</p>
                                )}
                            </div>

                            {/* Actions */}
                            {resignation.status === 'Pending' && (
                                <div className="flex gap-3 mt-4">
                                    <button
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-100"
                                        onClick={() => handleDecision(resignation.id, 'Approved')}
                                        disabled={processingId === resignation.id}
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100"
                                        onClick={() => handleDecision(resignation.id, 'Rejected')}
                                        disabled={processingId === resignation.id}
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editModalOpen && selectedResignation && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-900 dark:text-gray-100 p-6 rounded-lg w-full max-w-md shadow-xl space-y-4">
                        <h3 className="text-lg font-bold">Update Resignation Status</h3>

                        <div className="space-y-2">
                            <label>Status</label>
                            <select
                                className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>

                            <label>Clearance Status</label>
                            <select
                                className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={clearanceStatus}
                                onChange={(e) => setClearanceStatus(e.target.value)}
                            >
                                <option value="NotStarted">Not Started</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Cleared">Cleared</option>
                            </select>

                            <label>Asset Return Status</label>
                            <select
                                className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={assetReturnStatus}
                                onChange={(e) => setAssetReturnStatus(e.target.value)}
                            >
                                <option value="NotReturned">Not Returned</option>
                                <option value="PartiallyReturned">Partially Returned</option>
                                <option value="Returned">Returned</option>
                            </select>

                            <label>Remarks</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 resize-none bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                rows={3}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1]"
                                onClick={handleUpdate}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resignations;
