import React, { useEffect, useState } from "react";
import { getLeaveTypes, getLeaveRequests, LeaveType, LeaveRequest } from '../services/attendanceService'

interface LeaveSummary {
  id: string;
  name: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

const colorClasses: Record<string, { bgBar: string; bgBadge: string; textBadge: string }> = {
  annual: {
    bgBar: "bg-emerald-500",
    bgBadge: "bg-emerald-100 dark:bg-emerald-900",
    textBadge: "text-emerald-800 dark:text-emerald-200",
  },
  sickLeaves: {
    bgBar: "bg-yellow-400",
    bgBadge: "bg-yellow-100 dark:bg-yellow-900",
    textBadge: "text-yellow-800 dark:text-yellow-200",
  },
  casual: {
    bgBar: "bg-amber-500",
    bgBadge: "bg-amber-100 dark:bg-amber-900",
    textBadge: "text-amber-800 dark:text-amber-200",
  },
  default: {
    bgBar: "bg-gray-500",
    bgBadge: "bg-gray-100 dark:bg-gray-700",
    textBadge: "text-gray-800 dark:text-gray-200",
  },
};

const LeavesSummary: React.FC = () => {
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaveTypes: LeaveType[] = await getLeaveTypes();
        const leaveReqs: LeaveRequest[] = await getLeaveRequests();

        setLeaveRequests(leaveReqs);

        const summary = leaveTypes.map((type) => {
          const requestsForType = leaveReqs.filter(
            (req) =>
              req.leaveType.id === type.id &&
              req.status.toLowerCase() === "approved"
          );

          const usedDays = requestsForType.reduce((acc, req) => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const diff =
              Math.round(
                (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
              ) + 1;
            return acc + diff;
          }, 0);

          const lowerName = type.name.toLowerCase();

          let colorKey = "default";
          if (lowerName.includes("sick")) {
            colorKey = "sickLeaves";
          } else if (lowerName.includes("annual")) {
            colorKey = "annual";
          } else if (lowerName.includes("casual")) {
            colorKey = "casual";
          }

          return {
            id: type.id,
            name: type.name,
            total: type.totalDays,
            used: usedDays,
            remaining: Math.max(type.totalDays - usedDays, 0),
            color: colorKey,
          };
        });

        setLeaveSummary(summary);
      } catch (error) {
        console.error("Error loading leave summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  if (loading) return <div>Loading leave summary...</div>;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-800 dark:text-white">Leaves Summary</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            FY 2023-24
          </span>
        </div>

        <div className="grid gap-6">
          {leaveSummary.map((leave) => {
            const usedPercentage = calculatePercentage(leave.used, leave.total);
            const colors = colorClasses[leave.color] || colorClasses.default;
            return (
              <div key={leave.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="capitalize font-semibold text-gray-700 dark:text-gray-200">
                    {leave.name} Leave
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bgBadge} ${colors.textBadge}`}
                    >
                      {leave.remaining} remaining
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`${colors.bgBar} h-full rounded-full`}
                      style={{ width: `${usedPercentage}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-right text-sm text-gray-500 dark:text-gray-400">
                    {leave.used}/{leave.total}
                  </div>
                </div>

                <div className="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className={`${colors.bgBar} w-2 h-2 rounded-full`}></div>
                    <span>Used: {leave.used} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span>Remaining: {leave.remaining} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Total: {leave.total} days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">Last updated: Today</span>
            <button
              onClick={() => setShowDetails(true)}
              className="text-[#255199] dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {/* Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Detailed Leave Requests</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl font-bold leading-none"
                aria-label="Close modal"
                title="Close"
              >
                &times;
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">Type</th>
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">Start Date</th>
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">End Date</th>
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">Days</th>
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">Status</th>
                  <th className="py-3 px-4 border-b border-gray-300 dark:border-gray-600">Reason</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((req, idx) => {
                  const days =
                    Math.round(
                      (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                      (1000 * 3600 * 24)
                    ) + 1;

                  // Determine color class key same way as summary
                  const lowerName = req.leaveType.name.toLowerCase();
                  let colorKey = "default";
                  if (lowerName.includes("sick")) colorKey = "sickLeaves";
                  else if (lowerName.includes("annual")) colorKey = "annual";
                  else if (lowerName.includes("casual")) colorKey = "casual";

                  const colors = colorClasses[colorKey] || colorClasses.default;

                  return (
                    <tr
                      key={req.id}
                      className={`border-t border-gray-300 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""
                        } hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <td className="py-3 px-4 flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                        <span className={`${colors.bgBadge} ${colors.textBadge} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                          {req.leaveType.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(req.startDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(req.endDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{days}</td>
                      <td className="py-3 px-4 capitalize">{req.status}</td>
                      <td className="py-3 px-4">{req.reason || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </>
  );
};

export default LeavesSummary;
