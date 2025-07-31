import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cog, Eye, Plus } from 'lucide-react'; // Make sure you have lucide-react installed

const Permission = () => {
    const navigate = useNavigate();

    const handleNavigateToAddPermission = () => {
        navigate("/admin/add-permission");
    };

    const handleNavigateToAddUserPermission = () => {
        navigate("/admin/user-permission");
    };

    const handleNavigateToSubRoleManagement = () => {
        navigate("/admin/subrole-management");
    };
    return (
        <div className="p-4">
            <div className="mb-7 flex items-center">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Cog  className='text-2xl'/> Permission management
                </h1>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleNavigateToAddPermission}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus size={16} /> Add permissions
                </button>
                <button
                    onClick={handleNavigateToAddUserPermission}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus size={16} /> Add user permission
                </button>
                <button
                    onClick={handleNavigateToSubRoleManagement}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Eye size={18} /> Sub-Role Management
                </button>
            </div>
        </div>
    );
};

export default Permission;
