import React, { useState, useEffect } from 'react';
import { Table, Space, Card, Typography } from 'antd';
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
    <Card>
      <Typography.Title level={2}>
        <UserOutlined /> Employees
      </Typography.Title>
      <Table
        columns={columns}
        dataSource={employees}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default Employees;