import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
// import { createLeaveType } from '../../services/LeaveService'; // <-- you’ll need to implement this
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { createLeaveType } from '../../../../services/attendanceService';

const AddLeaveType: React.FC = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPaid: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setError('You are not authenticated. Please login again.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, token, navigate]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement; 
        const { name, value, type } = target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? target.checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await createLeaveType(formData); // call your backend
            navigate('/admin/attendance');
        } catch (error) {
            console.error('Error adding leave type:', error);
            setError(error instanceof Error ? error.message : 'Failed to add leave type');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate('/admin/attendance')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft />
                </button>
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <UserRound /> Add Leave Type
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Leave Type Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="col-span-2 flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="isPaid"
                                name="isPaid"
                                checked={formData.isPaid}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <label htmlFor="isPaid" className="text-gray-700 dark:text-gray-300">Is Paid Leave</label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/attendance')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Leave Type'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLeaveType;
