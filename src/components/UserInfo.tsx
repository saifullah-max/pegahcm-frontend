import React from 'react';
import { User, IdCard, Briefcase, Building2, Activity } from 'lucide-react';

const UserInfo: React.FC = () => {
  const userInfo = {
    name: 'John Doe',
    employeeId: 'EMP001',
    designation: 'Software Engineer',
    department: 'Engineering',
    status: 'Active'
  };

  return (
    <div className="bg-gradient-to-tr from-slate-50 to-white p-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-start space-x-4 mb-6">
        <div className="bg-indigo-500/10 rounded-xl p-3">
          <User className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{userInfo.name}</h2>
          <p className="text-indigo-500 text-sm font-medium">{userInfo.designation}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
          <div className="flex items-center space-x-3 flex-1">
            <IdCard className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Employee ID</p>
              <p className="text-slate-700">{userInfo.employeeId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
          <div className="flex items-center space-x-3 flex-1">
            <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Designation</p>
              <p className="text-slate-700">{userInfo.designation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
          <div className="flex items-center space-x-3 flex-1">
            <Building2 className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Department</p>
              <p className="text-slate-700">{userInfo.department}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
          <div className="flex items-center space-x-3 flex-1">
            <Activity className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Status</p>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                <p className="text-slate-700">{userInfo.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;