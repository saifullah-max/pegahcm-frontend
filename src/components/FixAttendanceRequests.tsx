import React, { useEffect, useState } from 'react';
import { Check, PencilLine, Trash, X } from 'lucide-react';
import {
    deleteFixRequest,
    editFixRequest,
    FixRequest,
    getAllFixRequests,
    updateFixRequestStatus,
} from '../services/fixAttendanceService';
import { showError, showInfo } from '../lib/toastUtils';

const FixAttendanceRequests: React.FC = () => {
    const [requests, setRequests] = useState<FixRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRequest, setEditingRequest] = useState<FixRequest | null>(null);
    const [form, setForm] = useState({
        requestType: '',
        reason: '',
        requestedCheckIn: '',
        requestedCheckOut: '',
        status: 'Pending',
    });

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const data = await getAllFixRequests();
                setRequests(data);
            } catch {
                showError('Failed to load fix requests');
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected') => {
        try {
            await updateFixRequestStatus(id, status);
            setRequests(prev =>
                prev.map(r => (r.id === id ? { ...r, status, reviewedBy: { fullName: 'You' } } : r)),
            );
            showInfo(`Request ${status.toLowerCase()} successfully`);
        } catch {
            showError('Failed to update status');
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEdit = (request: FixRequest) => {
        setForm({
            requestType: request.requestType,
            reason: request.reason,
            requestedCheckIn: request.requestedCheckIn?.slice(0, 16) || '',
            requestedCheckOut: request.requestedCheckOut?.slice(0, 16) || '',
            status: request.status || 'Pending',
        });
        setEditingRequest(request);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        try {
            await deleteFixRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
            showInfo('Fix request deleted successfully.');
        } catch {
            showError('Failed to delete fix request.');
        }
    };

    const handleEditSubmit = async () => {
        if (!editingRequest) return;

        try {
            await editFixRequest(editingRequest.id, {
                requestType: form.requestType as 'CheckIn' | 'CheckOut' | 'Both',
                reason: form.reason,
                requestedCheckIn: form.requestedCheckIn,
                requestedCheckOut: form.requestedCheckOut,
                status: form.status as 'Pending' | 'Approved' | 'Rejected',
            });


            setRequests(prev =>
                prev.map(r =>
                    r.id === editingRequest.id
                        ? {
                            ...r,
                            ...form,
                            requestType: form.requestType as 'CheckIn' | 'CheckOut' | 'Both',
                            status: form.status as 'Pending' | 'Approved' | 'Rejected',
                        }
                        : r,
                ),
            );


            showInfo('Fix request updated.');
            setEditingRequest(null);
        } catch {
            showError('Failed to update fix request.');
        }
    };

    const formatDate = (isoDate?: string): string => {
        if (!isoDate || isoDate === '—') return '—';
        const date = new Date(isoDate);
        const time = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).toLowerCase();

        const dayMonthYear = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        return `${time} - ${dayMonthYear}`;
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading fix requests...</p>;

    return (
        <div className="mt-10 space-y-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                Attendance Fix Requests
            </h2>

            <div className="overflow-x-auto rounded-lg border dark:border-gray-700 shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Employee</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Reason</th>
                            <th className="px-4 py-3 text-left">Check-In</th>
                            <th className="px-4 py-3 text-left">Check-Out</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Reviewer</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                        {requests.map(req => (
                            <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-4 py-2">{req.attendanceRecord?.date ? new Date(req.attendanceRecord.date).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-2">{req.employee.user.fullName}</td>
                                <td className="px-4 py-2">{req.requestType}</td>
                                <td className="px-4 py-2">{req.reason}</td>
                                <td className="px-4 py-2">{formatDate(req.requestedCheckIn || '—')}</td>
                                <td className="px-4 py-2">{formatDate(req.requestedCheckOut || '—')}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${req.status === 'Approved'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                : req.status === 'Rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                            }`}
                                    >
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{req.reviewedBy?.fullName || '—'}</td>
                                <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                        {req.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(req.id, 'Approved')}
                                                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(req.id, 'Rejected')}
                                                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleEdit(req)} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                                            <PencilLine size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(req.id)} className="text-red-600 hover:text-red-800 transition" title="Delete">
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingRequest && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Edit Fix Request</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Request Type</label>
                                <select
                                    name="requestType"
                                    value={form.requestType}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="CheckIn">Check-In</option>
                                    <option value="CheckOut">Check-Out</option>
                                    <option value="Both">Both</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reason</label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Requested Check-In</label>
                                <input
                                    type="datetime-local"
                                    name="requestedCheckIn"
                                    value={form.requestedCheckIn}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Requested Check-Out</label>
                                <input
                                    type="datetime-local"
                                    name="requestedCheckOut"
                                    value={form.requestedCheckOut}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>


                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setEditingRequest(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixAttendanceRequests;
