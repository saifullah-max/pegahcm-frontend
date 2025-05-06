import React, { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-700 flex items-center gap-2">
          <UserOutlined /> Employees
        </h1>
      </div>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 border-b-2">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-600 bg-white/90"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      employee.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : employee.status === 'Absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
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