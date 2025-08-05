import React, { useEffect, useState } from 'react';
import { Check, ClockFading, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLeaveRequest, getAllAdminLeaveRequests, updateLeaveStatus } from '../../../../services/attendanceService';
import { EmployeeSummary, getEmployeeAttendanceSummary } from '../../../../services/userService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { showError, showInfo, showSuccess } from '../../../../lib/toastUtils';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  leaveType: {
    name: string;
  };
  employee: {
    id: string;
    user: {
      fullName: string;
    };
  };
  approvedBy?: {
    fullName: string;
  };
  requestedAt: string;
}

const Attendance: React.FC = () => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EmployeeSummary[]>([]);

  const canViewSummary = permissions.includes("Attendance:approve");


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllAdminLeaveRequests();
        setLeaveRequests(data);
        const attendanceSummary = await getEmployeeAttendanceSummary();
        setSummary(attendanceSummary);
      } catch (error) {
        console.error('Failed to fetch leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateLeaveStatus(id, 'Approved');
      setLeaveRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: 'Approved' } : req))
      );
      showInfo("Leave request approved successfully")
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Something went wrong';
      showError(errorMessage)
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateLeaveStatus(id, 'Rejected');
      setLeaveRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: 'Rejected' } : req))
      );
      showSuccess("Leave request rejecetd")
    } catch (err: any) {
      const errorMessage = err?.response?.message || 'Something went wrong';
      showError(errorMessage);
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

  const handleNavigateToAddLeaveType = () => {
    navigate("/admin/add-leave-type");
  };

  return (
    <div className="mt-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <ClockFading /> Attendance
        </h1>
        <button
          onClick={handleNavigateToAddLeaveType}
          className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
        >
          <Plus /> Add Leave type
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Leave Type</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">is Paid?</th>
                <th className="px-4 py-2 text-left">Reviewed by</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {leaveRequests.map(req => (
                <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2">{new Date(req.requestedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{req.employee.user.fullName}</td>
                  <td className="px-4 py-2">{req.leaveType.name}</td>
                  <td className="px-4 py-2">{formatDate(req.startDate)}</td>
                  <td className="px-4 py-2">{formatDate(req.endDate)}</td>
                  <td className="px-4 py-2">{req.reason}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'Approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : req.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.leaveType.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                      {req.leaveType.isPaid ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className='px-4 py-2'>
                    <span className="text-gray-600">
                      {req.approvedBy ? req.approvedBy.fullName : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {req.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canViewSummary && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-2 text-gray-700 dark:text-gray-200">Employee Attendance Summary</h2>
          <div className="overflow-x-auto rounded-lg border dark:border-gray-700 mb-10">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Today's Status</th>
                  <th className="px-4 py-2 text-left">Total Leaves</th>
                  <th className="px-4 py-2 text-left">Late Arrivals</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {summary.map((emp) => (
                  <tr key={emp.employeeId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2">{emp.fullName}</td>
                    <td className="px-4 py-2">{emp.email}</td>
                    <td className="px-4 py-2">{emp.department}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
              ${emp.todayStatus === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : emp.todayStatus === 'Late Arrival' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                            : emp.todayStatus === 'On Leave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                        {emp.todayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{emp.totalLeaves}</td>
                    <td className="px-4 py-2">{emp.lateArrivals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default Attendance;


