import React, { useState } from 'react';
import { User, IdCard, Briefcase, Building2, Activity, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';

interface UserInfoProps {
  className?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ className }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const userInfo = {
    name: 'John Doe',
    employeeId: 'EMP001',
    designation: 'Software Engineer',
    department: 'Engineering',
    status: 'Active',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    joinDate: 'January 15, 2022',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  };

  const statusColors = {
    'Active': 'bg-emerald-500',
    'On Leave': 'bg-amber-500',
    'Inactive': 'bg-red-500'
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      {/* Header with background gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-500 p-5 relative">
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleEdit}
            className="bg-white/20 hover:bg-white/30 transition-colors rounded-full p-2 text-white"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={userInfo.avatar} 
              alt={userInfo.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-md" 
            />
            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${statusColors[userInfo.status as keyof typeof statusColors]}`}></div>
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{userInfo.name}</h2>
            <p className="text-indigo-100 text-sm">{userInfo.designation}</p>
          </div>
        </div>
      </div>

      {/* User details */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <IdCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Employee ID</p>
              <p className="font-medium text-slate-700">{userInfo.employeeId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Email</p>
              <p className="font-medium text-slate-700">{userInfo.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Designation</p>
              <p className="font-medium text-slate-700">{userInfo.designation}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Phone</p>
              <p className="font-medium text-slate-700">{userInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Department</p>
              <p className="font-medium text-slate-700">{userInfo.department}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Location</p>
              <p className="font-medium text-slate-700">{userInfo.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Status</p>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full ${statusColors[userInfo.status as keyof typeof statusColors]} mr-2`}></div>
                <p className="font-medium text-slate-700">{userInfo.status}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Join Date</p>
              <p className="font-medium text-slate-700">{userInfo.joinDate}</p>
            </div>
          </div>
        </div>

        {/* Edit Form - displayed conditionally */}
        {isEditing && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fadeIn">
            <h3 className="font-medium text-slate-800 mb-4">Edit Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input 
                  type="text" 
                  defaultValue={userInfo.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue={userInfo.email}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input 
                  type="text" 
                  defaultValue={userInfo.phone}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                <input 
                  type="text" 
                  defaultValue={userInfo.location}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button 
                onClick={toggleEdit}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;