// components/OnBoardingProcess.tsx

import React, { useEffect, useState } from 'react';
import { ClockFading, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAllOnboardingProcesses, deleteOnboardingProcess, OnboardingProcess } from '../../services/hrService';

const OnBoardingProcess: React.FC = () => {
    const navigate = useNavigate();
    const [onboardingList, setOnboardingList] = useState<OnboardingProcess[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAllOnboardingProcesses();
                setOnboardingList(data);
            } catch (error) {
                console.error('Failed to load onboarding processes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNavigateToAddOnboarding = () => {
        navigate("/hr/onboarding/create");
    };

    const handleEdit = (id: string) => {
        navigate(`/hr/onboarding/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this onboarding?")) return;
        try {
            await deleteOnboardingProcess(id);
            setOnboardingList(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            console.error("Failed to delete onboarding:", err);
        }
    };

    const formatDate = (isoDate: string): string => {
        return new Date(isoDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="mt-10">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ClockFading /> Onboarding Process
                </h1>
                <button
                    onClick={handleNavigateToAddOnboarding}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus /> Add Onboarding
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2 text-left">Employee</th>
                                <th className="px-4 py-2 text-left">HR Assigned</th>
                                <th className="px-4 py-2 text-left">Start Date</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Notes</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                            {onboardingList.map(item => (
                                <tr
                                    key={item.id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <td className="px-4 py-2">{item.employee.user.fullName}</td>
                                    <td className="px-4 py-2">{item.assignedHR.fullName}</td>
                                    <td className="px-4 py-2">{formatDate(item.startDate)}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Completed'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                : item.status === 'In Progress'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{item.notes || '—'}</td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OnBoardingProcess;
