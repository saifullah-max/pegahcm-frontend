import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react'; // Make sure you have lucide-react installed

const Permission = () => {
    const navigate = useNavigate();

    const handleNavigateToAddPermission = () => {
        navigate("/admin/add-permission");
    };

    const handleNavigateToAddUserPermission = () => {
        navigate("/admin/user-permission");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Permission Management</h1>
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
            </div>
        </div>
    );
};

export default Permission;
