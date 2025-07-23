import { ClockFading } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getLeaveRequests, getLeaveTypes, submitLeaveRequest } from '../../services/attendanceService';

interface AttendanceRequest {
    key: string;
    startDate: string;
    endDate: string;
    requestType: string;
    reason: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

interface LeaveType {
    id: string;
    name: string;
}

const UserAttendance: React.FC = () => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newRequest, setNewRequest] = useState<{
        leaveId: string;
        startDate: string;
        endDate: string;
        reason: string;
    }>({
        leaveId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            const types = await getLeaveTypes();
            if (Array.isArray(types)) {
                setLeaveTypes(types);
            }
        };
        const fetchExistingRequests = async () => {
            const requests = await getLeaveRequests();
            if (Array.isArray(requests)) {
                const formatted = requests.map((req) => ({
                    key: req.id,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    requestType: req.leaveType?.name || 'Leave',
                    reason: req.reason,
                    approvalStatus: req.status,
                }));
                setAttendanceRequests(formatted);
            }
        };

        fetchLeaveTypes();
        fetchExistingRequests();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { leaveId, startDate, endDate, reason } = newRequest;

        if (!leaveId || !startDate || !endDate || !reason) {
            alert("All fields are required.");
            return;
        }

        try {
            const created = await submitLeaveRequest({
                leaveId,
                startDate,
                endDate,
                reason,
            });

            const matchedType = leaveTypes.find((t) => t.id === leaveId);

            setAttendanceRequests((prev) => [
                ...prev,
                {
                    key: created.id,
                    startDate: created.startDate,
                    endDate: created.endDate,
                    requestType: matchedType?.name || 'Leave',
                    reason: created.reason,
                    approvalStatus: created.status,
                },
            ]);

            setNewRequest({ leaveId: '', startDate: '', endDate: '', reason: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Leave submission failed:', err);
        }
    };

    const formatDate = (isoDate: string): string => {
        const [year, month, day] = isoDate.split('T')[0].split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 transition-colors duration-200">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-600 dark:text-gray-200 flex items-center gap-2">
                    <ClockFading />
                    My Attendance Requests
                </h1>
                <button
                    onClick={() => setShowForm((prev) => !prev)}
                    className="px-4 py-2 bg-[#255199] hover:bg-[#2F66C1] text-white rounded-lg transition"
                >
                    {showForm ? 'Cancel' : 'Add Request'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow-md">
                    <div className="mb-4">
                        <label htmlFor="leaveId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Leave Type
                        </label>
                        <select
                            id="leaveId"
                            name="leaveId"
                            value={newRequest.leaveId}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-200"
                        >
                            <option value="">Select Leave Type</option>
                            {leaveTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={newRequest.startDate}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={newRequest.endDate}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Reason</label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={newRequest.reason}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#255199] hover:bg-[#2F66C1] text-white rounded-lg transition"
                    >
                        Submit Request
                    </button>
                </form>
            )}

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Start Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">End Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Leave Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Reason</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Approval Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {attendanceRequests.map((request) => (
                            <tr key={request.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                <td className="px-6 py-4 text-sm text-black dark:text-gray-200"> {formatDate(request.startDate)}</td>
                                <td className="px-6 py-4 text-sm text-black dark:text-gray-200"> {formatDate(request.endDate)}</td>
                                <td className="px-6 py-4 text-sm text-black dark:text-gray-200">{request.requestType}</td>
                                <td className="px-6 py-4 text-sm text-black dark:text-gray-200">{request.reason}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${request.approvalStatus === 'Approved'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                        : request.approvalStatus === 'Rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                        }`}>
                                        {request.approvalStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserAttendance;
