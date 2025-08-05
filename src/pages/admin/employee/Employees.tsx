import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilLine, Plus, Trash, UserRound } from "lucide-react";
import { deleteEmployee, Employee, getEmployees } from "../../../services/employeeService";
import { getEmployeeHours } from "../../../services/userService";
import { impersonateUser } from "../../../services/permissionService";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice"; // adjust to your actual path
import { jwtDecode } from "jwt-decode";
import { showError, showInfo } from "../../../lib/toastUtils";
import { RootState } from "../../../store";


export interface DecodedUser {
  userId: string;
  username: string;
  fullName: string | null
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
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [employeeHours, setEmployeeHours] = useState<Record<string, { weekly: number; monthly: number }>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); // for user name


  const navigate = useNavigate();

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employeeNumber",
      key: "employeeNumber",
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          style={{
            color:
              status === "active"
                ? "green"
                : status === "inactive"
                  ? "red"
                  : "orange",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Hours / Week",
      dataIndex: "weeklyHours",
      key: "weeklyHours",
      render: (_: any, record: Employee) => (
        <span>{employeeHours[record.id]?.weekly?.toFixed(1) || "0"} hrs</span>
      ),
    },
    {
      title: "Hours / Month",
      dataIndex: "monthlyHours",
      key: "monthlyHours",
      render: (_: any, record: Employee) => (
        <span>{employeeHours[record.id]?.monthly?.toFixed(1) || "0"} hrs</span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
    }
  ];

  useEffect(() => {
    if (hasFetched) return;

    const fetchEmployees = async () => {
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
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchEmployees();
  }, [hasFetched]);

  const handleNavigateToAddEmployee = () => {
    navigate("/admin/add-employee");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-employee/${id}`);
  }
  const handleDelete = (id: string, name: string) => {
    if (!id) {
      console.error("Invalid employee ID for deletion");
      showError("Invalid employee ID for deletion");
      return;
    }

    setDeleteId(id);
    setDeleteName(name); // Set name for context
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteEmployee(deleteId);
      setEmployees((prev) => prev.filter((employee) => employee.id !== deleteId));
      showInfo(`Deleted employee: ${deleteName} (${deleteId})`);
    } catch (error) {
      console.error("Error deleting employee:", error);
      showError("Failed to delete employee");
    } finally {
      setDeleteId(null);
      setDeleteName("");
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName("");
  };


  const handleImpersonate = async (
    userId: string,
    fullName: string,
    status: string
  ) => {
    try {
      // 1. Get current admin token from localStorage
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        showError("Admin token not found. Please log in again.")
        return;
      }

      // 2. Store it as 'adminToken' before impersonation
      localStorage.setItem("adminToken", currentToken);
      localStorage.setItem("impersonating", "true");
      localStorage.setItem("impersonatedUserId", userId);

      // 3. Make API call to impersonate
      const token = await impersonateUser(userId); // ← this returns the new token

      if (!token) throw new Error("No token received");

      // Replace token in localStorage with impersonated user's token
      localStorage.setItem("token", token);

      // 5. Decode and update Redux state
      const decoded = jwtDecode<DecodedUser>(token);

      dispatch(
        setCredentials({
          user: {
            id: decoded.userId,
            username: decoded.username ?? "",
            email: decoded.email ?? "",
            fullName,
            status,
            role: decoded.role as "admin" | "user",
            subRole: decoded.subRole
              ? {
                id: decoded.subRole.id,
                name: decoded.subRole.name,
                description: decoded.subRole.description ?? "",
              }
              : null,
          },
          token,
        })
      );

      // ✅ 6. Redirect
      showInfo("You're being redirected to user dashboard")
      window.location.href = "/user/user-dashboard";
    } catch (error) {
      console.error("Failed to impersonate user:", error);
      alert("Unable to view user dashboard.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900  transition-colors duration-200">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <UserRound /> Employees
        </h1>
        <button
          onClick={handleNavigateToAddEmployee}
          className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
        >
          <Plus /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
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
              {employees.map((employee) => (
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

                  {/* Weekly Hours */}
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200 ${employeeHours[employee.id]?.weekly < 35
                      ? "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200"
                      : "text-black dark:text-gray-200"
                      }`}
                  >
                    {employeeHours[employee.id]?.weekly?.toFixed(1) || "0"} hrs
                  </td>

                  {/* Monthly Hours */}
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200 ${employeeHours[employee.id]?.monthly < 150
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
                      <button
                        onClick={() => handleDelete(employee.id, employee.fullName)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                      {
                        user?.role === "admin" && (
                          <>
                            <button
                              onClick={() =>
                                handleImpersonate(employee.userId, employee.fullName, employee.status)
                              }
                              className="text-indigo-600 hover:text-indigo-800 transition"
                              title="View User Dashboard"
                            >
                              <UserRound size={18} />
                            </button>
                          </>
                        )
                      }
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
      )}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full animate-fadeIn transition-transform duration-200">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete employee <span className="font-semibold">{deleteName}</span>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
