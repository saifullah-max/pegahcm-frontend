import React, { useState } from 'react';
import { Card, Table, Button, Space, Typography, Tag, message } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface AttendanceRecord {
  key: string;
  date: string;
  employeeId: number;
  name: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day';
}

const { Title } = Typography;

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'Present' ? 'success' :
          status === 'Absent' ? 'error' : 'warning'
        }>
          {status}
        </Tag>
      ),
    },
  ];

  const handleCheckIn = () => {
    setLoading(true);
    const currentTime = dayjs().format('HH:mm:ss');
    const today = dayjs().format('YYYY-MM-DD');

    // Check if already checked in
    const todayRecord = attendanceRecords.find(
      record => record.date === today
    );

    if (todayRecord) {
      message.warning('You have already checked in today!');
      setLoading(false);
      return;
    }

    const newRecord: AttendanceRecord = {
      key: today,
      date: today,
      employeeId: 101, // Should come from auth context
      name: 'John Doe', // Should come from auth context
      checkIn: currentTime,
      checkOut: '-',
      status: 'Present',
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    message.success('Successfully checked in!');
    setLoading(false);
  };

  const handleCheckOut = () => {
    setLoading(true);
    const currentTime = dayjs().format('HH:mm:ss');
    const today = dayjs().format('YYYY-MM-DD');

    setAttendanceRecords(prev =>
      prev.map(record => {
        if (record.date === today && record.checkOut === '-') {
          return {
            ...record,
            checkOut: currentTime,
          };
        }
        return record;
      })
    );

    message.success('Successfully checked out!');
    setLoading(false);
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          <ClockCircleOutlined /> Attendance
        </Title>
        
        <Space>
          <Button
            type="primary"
            onClick={handleCheckIn}
            loading={loading}
          >
            Check In
          </Button>
          <Button
            onClick={handleCheckOut}
            loading={loading}
          >
            Check Out
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={attendanceRecords}
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Space>
    </Card>
  );
};

export default Attendance;