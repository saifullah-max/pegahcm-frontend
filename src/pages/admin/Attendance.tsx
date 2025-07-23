import React, { useEffect, useState } from 'react';
import { Check, ClockFading, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLeaveRequest, getAllAdminLeaveRequests } from '../../services/attendanceService';

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

const LeaveRequests: React.FC = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllAdminLeaveRequests();
        setLeaveRequests(data);
      } catch (error) {
        console.error('Failed to fetch leave requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);
  const handleApprove = (id: string) => {
    setLeaveRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'Approved' } : req))
    );
    // Call backend PATCH / PUT API to approve
    console.log(`Approved leave ID: ${id}`);
  };

  const handleReject = (id: string) => {
    setLeaveRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'Rejected' } : req))
    );
    // Call backend PATCH / PUT API to reject
    console.log(`Rejected leave ID: ${id}`);
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
    <div className="mt-10">
      <h2 className="text-xl mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
        <ClockFading /> Leave Requests
      </h2>

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
    </div>
  );
};

export default LeaveRequests;
