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

const statusColors = {
  active: 'bg-emerald-500',
  onLeave: 'bg-amber-500',
  inactive: 'bg-red-500',
};

type StatusKey = keyof typeof statusColors;

const UserInfo: React.FC = () => {
  const [employee, setEmployee] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState<string>('N/A');
  const [subDepartmentName, setSubDepartmentName] = useState<string>('N/A');

  const fetchShifts = async () => {
    setShiftsLoading(true);
    try {
      const shiftsData = await getShifts();
      console.log(shiftsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setShiftsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.userId || decoded.id;

        const { user, employee } = await getEmployeeById(userId);
        const allShifts = await getShifts();
        const allDepartments = await getDepartments();

        setEmployee({ ...employee, user });
        setShifts(allShifts);
        setDepartments(allDepartments);

        // ✅ Match department
        const matchedDept = allDepartments.find((dept) => dept.id === employee.departmentId);
        if (matchedDept) {
          setDepartmentName(matchedDept.name || 'N/A');

          // ✅ Match sub-department
          const matchedSubDept = matchedDept.subDepartments?.find(
            (sub: any) => sub.id === employee.subDepartmentId
          );
          if (matchedSubDept) {
            setSubDepartmentName(matchedSubDept.name || 'N/A');
          }
        }

      } catch (err) {
        console.error('Error fetching employee/departments:', err);
      }
    };

    fetchAllData();
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? 'Invalid Time'
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!employee) return <p>Loading user info...</p>;

  const fullName = employee.user?.fullName ?? 'Unknown';
  const avatar = employee.user?.avatar || '/default-avatar.png';
  const status: StatusKey = employee.status || 'Inactive';
  const shift = employee.shift;
  const matchedShift = shifts.find(
    (s) => s.name === employee?.shift // 👈 employee.shift is a string like "Shift 01"
  );



  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-5 relative">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={avatar}
              alt={fullName}
              className="w-16 h-16 rounded-full border-4 border-white shadow-md"
            />
            <div
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${statusColors[status] || 'bg-gray-400'
                }`}
            ></div>
          </div>
          <div className="text-black">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-sm">{employee.designation ?? 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: 'Employee ID',
              icon: <IdCard className="h-5 w-5 text-[#255199]" />,
              value: employee.employeeNumber ?? 'N/A',
            },
            {
              label: 'Email',
              icon: <Mail className="h-5 w-5 text-[#255199]" />,
              value: employee.user?.email ?? 'N/A',
            },
            {
              label: 'Designation',
              icon: <Briefcase className="h-5 w-5 text-[#255199]" />,
              value: employee.designation ?? 'N/A',
            },
            {
              label: 'Phone',
              icon: <Phone className="h-5 w-5 text-[#255199]" />,
              value: employee.phoneNumber ?? '-',
            },
            {
              label: 'Department',
              icon: <Building2 className="h-5 w-5 text-[#255199]" />,
              value: departmentName,
            },
            {
              label: 'Sub-Department',
              icon: <Building2 className="h-5 w-5 text-[#255199]" />,
              value: subDepartmentName,
            },
            {
              label: 'Location',
              icon: <MapPin className="h-5 w-5 text-[#255199]" />,
              value: employee.workLocation ?? 'N/A',
            },
            {
              label: 'Status',
              icon: <Activity className="h-5 w-5 text-[#255199]" />,
              value: (
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${statusColors[status] || 'bg-gray-400'
                      } mr-2`}
                  ></div>
                  <span>{status}</span>
                </div>
              ),
            },
            {
              label: 'Join Date',
              icon: <Calendar className="h-5 w-5 text-[#255199]" />,
              value: employee.hireDate
                ? new Date(employee.hireDate).toUTCString().slice(0, 16) // "Mon, 01 Jan 2024"
                : 'N/A',
            },
            {
              label: 'Shift',
              icon: <Clock className="h-5 w-5 text-[#255199]" />,
              value: matchedShift
                ? `${matchedShift.name} (${formatTime(matchedShift.startTime)} - ${formatTime(matchedShift.endTime)})`
                : 'N/A',
            },
            {
              label: 'Skills',
              icon: <User className="h-5 w-5 text-[#255199]" />,
              value: employee.skills ?? 'N/A',
            },
          ].map(({ label, icon, value }) => (
            <div
              key={label}
              className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">{icon}</div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="font-medium text-slate-700 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;