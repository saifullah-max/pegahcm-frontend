import { ClockFading } from 'lucide-react';
import React, { useState } from 'react';

interface AttendanceRequest {
    key: string;
    date: string;
    requestType: 'Leave' | 'WFH' | 'Late' | 'Early Departure';
    reason: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

const UserAttendance: React.FC = () => {
    const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([
        // Sample data
        {
            key: '2025-05-08',
            date: '2025-05-08',
            requestType: 'Leave',
            reason: 'Family emergency',
            approvalStatus: 'Pending',
        },
        {
            key: '2025-05-07',
            date: '2025-05-07',
            requestType: 'WFH',
            reason: 'Internet issues at office',
            approvalStatus: 'Approved',
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [newRequest, setNewRequest] = useState<Partial<AttendanceRequest>>({
        date: '',
        requestType: 'Leave',
        reason: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRequest.date && newRequest.requestType && newRequest.reason) {
            setAttendanceRequests((prev) => [
                ...prev,
                {
                    key: newRequest.date!,
                    date: newRequest.date!,
                    requestType: newRequest.requestType as 'Leave' | 'WFH' | 'Late' | 'Early Departure',
                    reason: newRequest.reason!,
                    approvalStatus: 'Pending',
                },
            ]);
            setNewRequest({ date: '', requestType: 'Leave', reason: '' });
            setShowForm(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 transition-colors duration-200">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-600 dark:text-gray-200 flex items-center gap-2">
                    <ClockFading/>
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
                <form onSubmit={handleSubmit} className="mb-6 bg-white  p-4 rounded shadow-md">
                    <div className="mb-4">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={newRequest.date || ''}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Request Type
                        </label>
                        <select
                            id="requestType"
                            name="requestType"
                            value={newRequest.requestType || 'Leave'}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500  dark:text-gray-200"
                        >
                            <option value="Leave">Leave</option>
                            <option value="WFH">Work From Home</option>
                            <option value="Late">Late</option>
                            <option value="Early Departure">Early Departure</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Reason
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={newRequest.reason || ''}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#255199] hover:bg-[#2F66C1] text-white rounded-lg  transition"
                    >
                        Submit Request
                    </button>
                </form>
            )}

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Request Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Reason</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Approval Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {attendanceRequests.map((request) => (
                            <tr key={request.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{request.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{request.requestType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{request.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
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