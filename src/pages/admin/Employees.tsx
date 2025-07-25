import React, { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import { PencilLine, Plus, Trash, UserRound } from "lucide-react";
import { deleteEmployee, Employee, getEmployees } from "../../services/employeeService";
import { getEmployeeHours } from "../../services/userService";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [employeeHours, setEmployeeHours] = useState<Record<string, { weekly: number; monthly: number }>>({});

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
  }, [hasFetched, data]);

  const handleNavigateToAddEmployee = () => {
    navigate("/admin/add-employee");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-employee/${id}`);
  }
  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("Invalid employee ID for deletion");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) return; // Cancel deletion if user clicks "Cancel"

    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
      console.log(`Deleted employee with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting employee:", error);
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

                  {/* ✅ Weekly Hours */}
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200 ${employeeHours[employee.id]?.weekly < 35
                      ? "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200"
                      : "text-black dark:text-gray-200"
                      }`}
                  >
                    {employeeHours[employee.id]?.weekly?.toFixed(1) || "0"} hrs
                  </td>

                  {/* ✅ Monthly Hours */}
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
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
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

export default Employees;
