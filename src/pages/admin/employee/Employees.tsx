import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PencilLine, Plus, UserRound } from "lucide-react";
import { Employee, getEmployees } from "../../../services/employeeService";
import { getEmployeeHours } from "../../../services/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { statusOptions } from "./EditEmployee";

export interface DecodedUser {
  userId: string;
  username: string;
  fullName: string | null;
  email: string;
  role: string;
  subRole?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  iat: number;
  exp: number;
}

const Employees: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [employeeHours, setEmployeeHours] = useState<Record<string, { weekly: number; monthly: number }>>({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const navigate = useNavigate();

  const columns = [
    { title: "Employee ID", key: "employeeNumber" },
    { title: "Name", key: "fullName" },
    { title: "Email", key: "email" },
    { title: "Department", key: "department" },
    { title: "Designation", key: "designation" },
    { title: "Status", key: "status" },
    { title: "Hours / Week", key: "weeklyHours" },
    { title: "Hours / Month", key: "monthlyHours" },
    { title: "Actions", key: "actions" },
    { title: "Permissions", key: "permissions" },
  ];

  const inactiveUserColumns = [
    { title: "Name", key: "fullName" },
    { title: "Email", key: "email" },
    { title: "Status", key: "status" },
    { title: "Actions", key: "actions" },
  ];

  useEffect(() => {
    if (hasFetched) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [empData, hoursData] = await Promise.all([
          getEmployees(),
          getEmployeeHours(),
        ]);
        setEmployees(empData);
        setEmployeeHours(hoursData);
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasFetched]);

  const normalizeStatus = (status?: string) => (status ?? "").trim().toLowerCase();

  const activeEmployees = employees.filter(
    (emp) => normalizeStatus(emp.status) === "active"
  );

  const filteredOtherEmployees =
    statusFilter === "all"
      ? employees.filter((emp) => normalizeStatus(emp.status) !== "active")
      : employees.filter(
        (emp) => normalizeStatus(emp.status) === statusFilter.toLowerCase()
      );

  const handleViewUserDetails = (employee: Employee) => {
    setSelectedUser(employee);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleNavigateToAddEmployee = () => {
    navigate("/admin/add-employee");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-employee/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            aria-label="Go Back"
          >
            <ArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <UserRound /> Employees
          </h1>
        </div>
        <button
          onClick={handleNavigateToAddEmployee}
          className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
        >
          <Plus /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>
      ) : (
        <>
          {/* Active Employees Table */}
          <div className="overflow-x-auto shadow-md rounded-lg mb-8">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 dark:border-gray-700">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-900 transition-colors duration-200"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {activeEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {employee.employeeNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {employee.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${employee.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : employee.status === "inactive"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${employeeHours[employee.id]?.weekly < 35
                        ? "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200"
                        : "text-black dark:text-gray-200"
                        }`}
                    >
                      {employeeHours[employee.id]?.weekly?.toFixed(1) || "0"} hrs
                    </td>

                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${employeeHours[employee.id]?.monthly < 150
                        ? "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200"
                        : "text-black dark:text-gray-200"
                        }`}
                    >
                      {employeeHours[employee.id]?.monthly?.toFixed(1) || "0"} hrs
                    </td>

                    <td>
                      <div className="flex items-center gap-3 mx-5">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                        >
                          <PencilLine size={18} />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleViewUserDetails(employee)}
                            className="text-indigo-600 hover:text-indigo-800 transition"
                            title="View User Details"
                          >
                            <UserRound size={18} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/admin/manage-permissions/${employee.userId}`)}
                        className="text-purple-600 hover:text-purple-800 transition"
                        title="Manage Permissions"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Other Employees Table */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Other Employees
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <label className="text-gray-700 dark:text-gray-300">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="all">All</option>
                {statusOptions
                  .filter((opt) => opt.value !== "active")
                  .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
              </select>
            </div>

            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 dark:border-gray-700">
                <tr>
                  {inactiveUserColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-900 transition-colors duration-200"
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredOtherEmployees.length > 0 ? (
                  filteredOtherEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                        {employee.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${normalizeStatus(employee.status) === "inactive"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3 mx-5">
                          <button
                            onClick={() => handleEdit(employee.id)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                          >
                            <PencilLine size={18} />
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleViewUserDetails(employee)}
                              className="text-indigo-600 hover:text-indigo-800 transition"
                              title="View User Details"
                            >
                              <UserRound size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={inactiveUserColumns.length}
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No users found for the selected status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-lg w-full animate-fadeIn transition-transform duration-200 max-h-[90vh] overflow-y-auto">

            {/* Profile Image */}
            {selectedUser.profileImageUrl ? (
              <img
                src={selectedUser.profileImageUrl}
                alt={`${selectedUser.fullName} profile`}
                className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-4 flex items-center justify-center text-gray-500 mx-auto">
                No Image
              </div>
            )}

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
              User Details
            </h2>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Name:</strong> {selectedUser.fullName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              <p><strong>Role:</strong> {selectedUser.role || "N/A"}</p>
              <p><strong>Sub-Role:</strong> {selectedUser.subRole || "N/A"}</p>
              <p><strong>Department:</strong> {selectedUser.department || "N/A"}</p>
              <p><strong>Sub-Department:</strong> {selectedUser.subDepartment || "N/A"}</p>
              <p><strong>Designation:</strong> {selectedUser.designation || "N/A"}</p>
              <p><strong>Employee Number:</strong> {selectedUser.employeeNumber || "N/A"}</p>
              <p><strong>Work Location:</strong> {selectedUser.workLocation || "N/A"}</p>
              <p><strong>Gender:</strong> {selectedUser.gender || "N/A"}</p>
              <p><strong>Address:</strong> {selectedUser.address || "N/A"}</p>
              <p><strong>Emergency Contact:</strong> {selectedUser.emergencyContact?.name || "N/A"} ({selectedUser.emergencyContact?.phone || "N/A"})</p>
              <p><strong>Current Salary:</strong> {selectedUser.salary || "N/A"}</p>
              <p><strong>Skills:</strong> {selectedUser.skills?.length ? selectedUser.skills.join(", ") : "N/A"}</p>
              <p><strong>Hire Date:</strong> {selectedUser.hireDate ? new Date(selectedUser.hireDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Weekly Hours:</strong> {employeeHours[selectedUser.id]?.weekly?.toFixed(1) || "0"} hrs</p>
              <p><strong>Monthly Hours:</strong> {employeeHours[selectedUser.id]?.monthly?.toFixed(1) || "0"} hrs</p>
            </div>

            {/* Documents Section */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Documents</h3>
              {selectedUser.documents && selectedUser.documents.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUser.documents.map((doc) => (
                    <li
                      key={doc.name}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded p-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.mimeType} - {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                          title="View Document"
                        >
                          View
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
