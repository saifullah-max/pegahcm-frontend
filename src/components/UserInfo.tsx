import React, { useEffect, useState } from 'react';
import {
  User,
  IdCard,
  Briefcase,
  Building2,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';
import { getEmployeeById } from '../services/userService';
import { getShifts } from '../services/ShiftService';
import { getDepartments } from '../services/departmentService';
import { useSelector } from 'react-redux';

import type { Shift } from '../services/ShiftService';
import type { Department, SubDepartment } from '../services/departmentService';

type StatusKey =
  | 'active'
  | 'inactive'
  | 'terminated'
  | 'resigned'
  | 'retired'
  | 'onLeave'
  | 'probation';

const statusColors: Record<StatusKey, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-red-500',
  terminated: 'bg-gray-600',
  resigned: 'bg-gray-600',
  retired: 'bg-gray-600',
  onLeave: 'bg-amber-500',
  probation: 'bg-yellow-400',
};
const defaultStatusColor = 'bg-gray-400';

interface EmployeeData {
  id: string;
  employeeNumber: string;
  designation: string;
  departmentId: string;
  subDepartmentId?: string;
  gender?: string;
  address?: string;
  salary?: string;
  shiftId?: string;
  shift?: string | null;
  status: string; // from backend as string, will cast
  dateOfBirth?: string;
  hireDate?: string;
  skills: string[];
  workLocation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profileImageUrl?: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  subRoleId?: string;
  status?: string;
  dateJoined?: string;
}

export interface EmployeeWithUser extends Omit<EmployeeData, 'status'> {
  status: StatusKey;
  user: UserData;
}

const UserInfo: React.FC = () => {
  const userId = useSelector((state: any) => state.auth?.user?.id);
  const [employee, setEmployee] = useState<EmployeeWithUser | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departmentName, setDepartmentName] = useState<string>('N/A');
  const [subDepartmentName, setSubDepartmentName] = useState<string>('N/A');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!userId) return;

        const { user, employee: emp } = await getEmployeeById(userId);
        const allShifts = await getShifts();
        const allDepartments = await getDepartments();

        const castStatus = (s: string): StatusKey =>
          s && Object.keys(statusColors).includes(s) ? (s as StatusKey) : 'inactive';

        setEmployee({
          ...emp,
          user,
          status: castStatus(emp.status ?? 'inactive'),
        });

        const matchedDept = allDepartments.find((dept) => dept.id === emp.departmentId);
        if (matchedDept) {
          setDepartmentName(matchedDept.name || 'N/A');
          const matchedSubDept = matchedDept.subDepartments?.find(
            (sub: SubDepartment) => sub.id === emp.subDepartmentId
          );
          if (matchedSubDept) {
            setSubDepartmentName(matchedSubDept.name || 'N/A');
          }
        }

        setShifts(allShifts);
      } catch (err) {
        console.error('Error fetching employee/departments:', err);
      }
    };

    fetchAllData();
  }, [userId]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? 'Invalid Time'
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!employee) return <p>Loading user info...</p>;

  const fullName = employee.user?.fullName ?? 'Unknown';

  const avatar = employee.profileImageUrl ?? '/default-avatar.png';

  const status: StatusKey = employee.status;

  const matchedShift =
    shifts.find((s) => s.name === employee.shift) ||
    (employee.shiftId ? shifts.find((s) => s.id === employee.shiftId) : undefined);

  const details = [
    { label: 'Employee ID', icon: IdCard, value: employee.employeeNumber ?? 'N/A' },
    { label: 'Email', icon: Mail, value: employee.user?.email ?? 'N/A' },
    { label: 'Designation', icon: Briefcase, value: employee.designation ?? 'N/A' },
    { label: 'Phone', icon: Phone, value: employee.emergencyContactPhone ?? '-' },
    { label: 'Department', icon: Building2, value: departmentName },
    { label: 'Sub-Department', icon: Building2, value: subDepartmentName },
    { label: 'Location', icon: MapPin, value: employee.workLocation ?? 'N/A' },
    {
      label: 'Status',
      icon: Activity,
      value: (
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${statusColors[status] ?? defaultStatusColor}`} />
          <span className="capitalize">{status}</span>
        </div>
      ),
    },
    {
      label: 'Join Date',
      icon: Calendar,
      value: employee.hireDate ? new Date(employee.hireDate).toUTCString().slice(0, 16) : 'N/A',
    },
    {
      label: 'Shift',
      icon: Clock,
      value: matchedShift
        ? `${matchedShift.name} (${formatTime(matchedShift.startTime)} - ${formatTime(
          matchedShift.endTime
        )})`
        : 'N/A',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <img
            src={avatar}
            alt={fullName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/default-avatar.png';
            }}
            className="w-16 h-16 rounded-full border-4 border-white shadow-md"
          />
          <div
            className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${statusColors[status] ?? defaultStatusColor
              }`}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{fullName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{employee.designation ?? 'N/A'}</p>
        </div>
      </div>

      {/* Grid Info */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map(({ label, icon: Icon, value }) => (
          <div
            key={label}
            className="flex items-start space-x-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-700">
              <Icon className="h-5 w-5 text-[#7d90b0]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
            </div>
          </div>
        ))}

        <div className="md:col-span-2 flex items-start space-x-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-700">
            <User className="h-5 w-5 text-[#7d90b0]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Skills</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {employee.skills && employee.skills.length > 0 ? employee.skills.join(' - ') : 'N/A'}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default UserInfo;
