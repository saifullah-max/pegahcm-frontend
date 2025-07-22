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
} from 'lucide-react';

interface EmployeeData {
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  departmentId: string;
  status: string;
  employeeNumber: string;
  workLocation: string;
  gender: string;
  hireDate: string;
  dateOfBirth: string;
  address: string;
  skills: string;
  salary: string;
  avatar?: string;
}

const statusColors = {
  'Active': 'bg-emerald-500',
  'On Leave': 'bg-amber-500',
  'Inactive': 'bg-red-500',
};

const UserInfo: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const root = localStorage.getItem('persist:root');
      if (!root) return;

      const parsedRoot = JSON.parse(root);
      const auth = parsedRoot.auth;
      if (!auth) return;

      const parsedAuth = JSON.parse(auth);
      const user = parsedAuth.user;
      if (!user || !user.employee) return;

      const employee = user.employee;

      const fullEmployee: EmployeeData = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: employee.phoneNumber,
        position: employee.position,
        departmentId: employee.departmentId,
        status: employee.status,
        employeeNumber: employee.employeeNumber,
        workLocation: employee.workLocation,
        gender: employee.gender,
        hireDate: employee.hireDate,
        dateOfBirth: employee.dateOfBirth,
        address: employee.address,
        skills: employee.skills,
        salary: employee.salary,
        avatar: user.avatar || '', // optional fallback
      };

      setEmployeeData(fullEmployee);
    } catch (err) {
      console.error('Error parsing user data from localStorage:', err);
    }
  }, []);

  const toggleEdit = () => setIsEditing(!isEditing);

  if (!employeeData) return <p>Loading user info...</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-5 relative">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={employeeData.avatar || '/default-avatar.png'}
              alt={employeeData.fullName}
              className="w-16 h-16 rounded-full border-4 border-white shadow-md"
            />
            <div
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${statusColors[employeeData.status as keyof typeof statusColors]
                }`}
            ></div>
          </div>
          <div className="text-black">
            <h2 className="text-xl font-bold">{employeeData.fullName}</h2>
            <p className="text-sm">{employeeData.position}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: 'Employee ID',
              icon: <IdCard className="h-5 w-5 text-[#255199]" />,
              value: employeeData.employeeNumber,
            },
            {
              label: 'Email',
              icon: <Mail className="h-5 w-5 text-[#255199]" />,
              value: employeeData.email,
            },
            {
              label: 'Designation',
              icon: <Briefcase className="h-5 w-5 text-[#255199]" />,
              value: employeeData.position,
            },
            {
              label: 'Phone',
              icon: <Phone className="h-5 w-5 text-[#255199]" />,
              value: employeeData.phoneNumber,
            },
            {
              label: 'Department',
              icon: <Building2 className="h-5 w-5 text-[#255199]" />,
              value: employeeData.departmentId,
            },
            {
              label: 'Location',
              icon: <MapPin className="h-5 w-5 text-[#255199]" />,
              value: employeeData.workLocation,
            },
            {
              label: 'Status',
              icon: <Activity className="h-5 w-5 text-[#255199]" />,
              value: (
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${statusColors[employeeData.status as keyof typeof statusColors]
                      } mr-2`}
                  ></div>
                  <span>{employeeData.status}</span>
                </div>
              ),
            },
            {
              label: 'Join Date',
              icon: <Calendar className="h-5 w-5 text-[#255199]" />,
              value: new Date(employeeData.hireDate).toDateString(),
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
