import { ArrowLeft, ClockFading } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getLeaveRequests, getLeaveTypes, submitLeaveRequest } from '../../services/attendanceService';
import { getEmployeeHours } from '../../services/userService';
import { showError, showSuccess } from '../../lib/toastUtils';
import { AttendanceFixFormData, FixAttendanceRequestPayload, FixRequest, getFixRequestsByEmployee, submitFixAttendanceRequest } from '../../services/fixAttendanceService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';

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
    const { user } = useSelector((state: RootState) => state.auth)
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
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
    const [employeeHours, setEmployeeHours] = useState<Record<string, { weekly: number; monthly: number }>>({});
    const [userName, setuserName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [attendanceFixRequest, setAttendanceFixRequest] = useState<AttendanceFixFormData>({
        date: '',
        requestType: '',
        expectedClockIn: '',
        expectedClockOut: '',
        reason: '',
        employeeId: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fixRequests, setFixRequests] = useState<FixRequest[]>();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            const types = await getLeaveTypes();
            if (Array.isArray(types)) {
                setLeaveTypes(types);
            }
        };
        const fetchExistingRequests = async () => {
            const requests = await getLeaveRequests();
            console.log("LEAVES:", requests);
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

    useEffect(() => {
        const fetchHours = async () => {
            const hours = await getEmployeeHours();
            setEmployeeHours(hours);
            console.log("Fetched employeeHours keys:", Object.keys(hours)); // ✅ here
            console.log("employeeHours full:", hours); // ✅ also log full object
        };

        fetchHours();

    }, []);

    useEffect(() => {
        const rootData = localStorage.getItem('persist:root');
        if (!rootData) return;

        try {
            const parsedRoot = JSON.parse(rootData);
            const authSlice = JSON.parse(parsedRoot.auth);
            const name = authSlice?.user?.fullName || authSlice?.user?.username || 'User';
            const empId = authSlice?.user?.employee?.id || null;

            setuserName(name);
            setUserId(empId); // ✅ Use employee ID instead of user ID
            console.log("User fullName:", name);
            console.log("Employee ID from authSlice:", empId);

        } catch (err) {
            console.error("Error parsing persisted user info:", err);
        }
    }, []);

    useEffect(() => {
        if (!userId || Object.keys(employeeHours).length === 0) return;
    }, [userId, employeeHours]);

    useEffect(() => {
        if (empId === undefined) {
            showError("Employee Id is required")
            return;
        }
        const fetchData = async () => {
            const data = await getFixRequestsByEmployee(empId);
            setFixRequests(data);
            console.log("reqs by employee:", data);
            setLoading(false);
        };

        fetchData();
    }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleAttendanceFixChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAttendanceFixRequest((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const empId = user?.employee?.id

    const handleAttendanceFixSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (empId === undefined) {
            showError("Employee Id not found");
            return;
        }

        try {
            const payload: FixAttendanceRequestPayload = {
                employeeId: empId,
                date: attendanceFixRequest.date,
                requestType: attendanceFixRequest.requestType as 'CheckIn' | 'CheckOut' | 'Both',
                requestedCheckIn:
                    (attendanceFixRequest.requestType === 'CheckIn' || attendanceFixRequest.requestType === 'Both')
                        ? attendanceFixRequest.expectedClockIn
                        : undefined,
                requestedCheckOut:
                    (attendanceFixRequest.requestType === 'CheckOut' || attendanceFixRequest.requestType === 'Both')
                        ? attendanceFixRequest.expectedClockOut
                        : undefined,
                reason: attendanceFixRequest.reason,
            };

            await submitFixAttendanceRequest(payload);

            showSuccess('Attendance fix request submitted successfully');
            setShowAttendanceForm(false);

            // Optional: refresh list of requests or records
        } catch (error: any) {
            showError(error.message || 'Failed to submit fix request');
        } finally {
            setIsSubmitting(false);
        }
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
            showSuccess("Leave requests submitted")
        } catch (err) {
            console.error('Leave submission failed:', err);
            showError("Error - maybe you're unlucky to go on a leave")
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

    const formatDateAndTime = (isoDate?: string): string => {
        if (!isoDate || isoDate === '—') return '—';

        const date = new Date(isoDate);
        const time = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).toLowerCase(); // e.g., "3:00 PM" → "3:00 pm"

        const dayMonthYear = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }); // e.g., "02 Jul 2025"

        return `${time} - ${dayMonthYear}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        aria-label="Go Back"
                    >
                        <ArrowLeft className="text-xl" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ClockFading className="text-blue-600 dark:text-blue-400" />
                        Attendance Requests
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                    >
                        {showForm ? 'Cancel' : 'Add Leave Request'}
                    </button>
                    <button
                        onClick={() => setShowAttendanceForm((prev) => !prev)}
                        className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                    >
                        {showAttendanceForm ? 'Cancel' : 'Fix Attendance'}
                    </button>
                </div>
            </div>


            {/* Leave Requests */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">Leave Requests</h2>
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
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">{formatDate(request.startDate)}</td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">{formatDate(request.endDate)}</td>
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

            {/* Fix Attendance Requests */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">Fix Attendance Requests</h2>
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Check-In</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Check-Out</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Request Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Reason</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {fixRequests && fixRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">
                                        {request.requestedCheckIn ? formatDateAndTime(request.requestedCheckIn) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">
                                        {request.requestedCheckOut ? formatDateAndTime(request.requestedCheckOut) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">
                                        {request.requestType}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black dark:text-gray-200">
                                        {request.reason}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${request.status === 'Approved'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                            : request.status === 'Rejected'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {Object.keys(employeeHours).length > 0 && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{userName}'s Working Hours</h2>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full table-auto bg-white dark:bg-gray-900">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Weekly Hours</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Monthly Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {userId ? (
                                    employeeHours[userId] ? (
                                        <tr key={userId}>
                                            <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                                {employeeHours[userId].weekly.toFixed(1)} hrs
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                                {employeeHours[userId].monthly.toFixed(1)} hrs
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td className="px-6 py-4 text-sm text-red-600 dark:text-red-300" colSpan={2}>
                                                No hour record found for current user.
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-yellow-600 dark:text-yellow-300" colSpan={2}>
                                            User ID not loaded yet.
                                        </td>
                                    </tr>
                                )}


                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Submit Leave Request
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Leave Type</label>
                                <select
                                    name="leaveId"
                                    value={newRequest.leaveId}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                >
                                    <option value="">Select Leave Type</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                        >
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={newRequest.startDate}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={newRequest.endDate}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Reason</label>
                                <textarea
                                    name="reason"
                                    value={newRequest.reason}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-5 py-2.5 text-base bg-[#255199] hover:bg-[#2F66C1] text-white rounded-md text-sm"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAttendanceForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
                        <button
                            onClick={() => setShowAttendanceForm(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Fix Attendance Entry
                        </h3>
                        <form className="space-y-6" onSubmit={handleAttendanceFixSubmit}>
                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={attendanceFixRequest.date}
                                    onChange={handleAttendanceFixChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Missing Type</label>
                                <select
                                    name="requestType"
                                    value={attendanceFixRequest.requestType}
                                    onChange={handleAttendanceFixChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                >
                                    <option value="">Select</option>
                                    <option value="CheckIn">Check In</option>
                                    <option value="CheckOut">Check Out</option>
                                    <option value="Both">Both</option>
                                </select>
                            </div>

                            {(attendanceFixRequest.requestType === 'CheckIn' || attendanceFixRequest.requestType === 'Both') && (
                                <div>
                                    <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Expected Clock In</label>
                                    <input
                                        type="time"
                                        name="expectedClockIn"
                                        value={attendanceFixRequest.expectedClockIn}
                                        onChange={handleAttendanceFixChange}
                                        required
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                    />
                                </div>
                            )}

                            {(attendanceFixRequest.requestType === 'CheckOut' || attendanceFixRequest.requestType === 'Both') && (
                                <div>
                                    <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Expected Clock Out</label>
                                    <input
                                        type="time"
                                        name="expectedClockOut"
                                        value={attendanceFixRequest.expectedClockOut}
                                        onChange={handleAttendanceFixChange}
                                        required
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-base font-medium text-gray-700 dark:text-gray-200">Reason</label>
                                <textarea
                                    name="reason"
                                    value={attendanceFixRequest.reason}
                                    onChange={handleAttendanceFixChange}
                                    required
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md text-base px-3 py-2"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full px-5 py-2.5 text-base bg-[#255199] hover:bg-[#2F66C1] text-white rounded-md text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserAttendance;
