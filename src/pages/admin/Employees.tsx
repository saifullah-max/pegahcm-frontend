import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserRound } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Present' | 'Absent' | 'On Leave';
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    department: '',
    designation: '',
    status: 'Present',
  });
  const navigate = useNavigate();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          color: status === 'Present' ? 'green' : status === 'Absent' ? 'red' : 'orange'
        }}>
          {status}
        </span>
      ),
    }
  ];

  useEffect(() => {
    // Replace this with your actual API call
    const fetchEmployees = async () => {
      try {
        // Simulated data - replace with actual API call
        const data: Employee[] = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            department: 'IT',
            designation: 'Software Engineer',
            status: 'Present',
          },

          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            department: 'HR',
            designation: 'HR Manager',
            status: 'Absent',
          },

          {
            id: 3,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            department: 'Finance',
            designation: 'Financial Analyst',
            status: 'On Leave',
          },

        ];
        setEmployees(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewEmployee({
      name: '',
      email: '',
      department: '',
      designation: '',
      status: 'Present',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a new ID (in a real app, this would come from the backend)
    const newId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
    
    // Create the new employee with an ID
    const employeeToAdd: Employee = {
      id: newId,
      ...newEmployee
    };
    
    // Add to the employees list
    setEmployees([...employees, employeeToAdd]);
    
    // Close the modal and reset form
    handleCloseModal();
  };

  const handleNavigateToAddEmployee = () => {
    navigate('/admin/add-employee');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
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
        <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>
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
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{employee.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">{employee.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      employee.status === 'Present'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : employee.status === 'Absent'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {employee.status}
                    </span>
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