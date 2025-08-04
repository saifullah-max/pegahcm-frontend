import { ArrowLeft, LogOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';// ⬅️ your API service
import { submitResignation } from '../../../../services/resignationService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

const ResignationForm: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth)
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        resignationDate: '',
        lastWorkingDay: '',
        reason: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const employeeId = user?.employee?.id;
    console.log("USER:", user);
    console.log("EMPLOYEE ID:", employeeId);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (employeeId === undefined) {
            alert("Employee ID not found. Please log in again.");
            return;
        }

        try {
            await submitResignation({
                employeeId,
                resignationDate: formData.resignationDate,
                lastWorkingDay: formData.lastWorkingDay,
                reason: formData.reason
            });

            alert('Resignation submitted successfully!');
            navigate('/admin/user/resignation');
        } catch (err) {
            console.error("Submission failed:", err);
            alert('Failed to submit resignation.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/admin/user/resignation')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                    <LogOut />
                    Submit Resignation
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="resignationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Resignation Date
                    </label>
                    <input
                        type="date"
                        name="resignationDate"
                        id="resignationDate"
                        value={formData.resignationDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-200"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="lastWorkingDay" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Last Working Day
                    </label>
                    <input
                        type="date"
                        name="lastWorkingDay"
                        id="lastWorkingDay"
                        value={formData.lastWorkingDay}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-200"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Reason
                    </label>
                    <textarea
                        name="reason"
                        id="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-200"
                        rows={4}
                    />
                </div>

                <button
                    type="submit"
                    className="px-5 py-2 bg-[#255199] hover:bg-[#2F66C1] text-white rounded-lg transition"
                >
                    Submit Resignation
                </button>
            </form>
        </div>
    );
};

export default ResignationForm;
