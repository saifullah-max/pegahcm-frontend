import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import {
    fetchAllHREmployees,
    getOnboardingById,
    updateOnboardingProcess,
    CreateOnboardingPayload,
    HREmployee
} from '../../services/hrService';
import { Employee, getEmployees } from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const EditOnboardingForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // 🆔 ID from URL
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [hrList, setHrList] = useState<HREmployee[]>([]);
    const [formData, setFormData] = useState<CreateOnboardingPayload>({
        employeeId: '',
        assignedHRId: '',
        startDate: '',
        notes: '',
        status: 'Pending',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auth check
    useEffect(() => {
        if (!isAuthenticated || !token) {
            setError('You are not authenticated. Please login again.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, token, navigate]);

    // Load employees and HRs
    useEffect(() => {
        const fetchData = async () => {
            const empData = await getEmployees();
            const hrData = await fetchAllHREmployees();
            setEmployees(empData);
            setHrList(hrData);
        };
        fetchData();
    }, []);

    // Load onboarding data by ID
    useEffect(() => {
        const fetchOnboarding = async () => {
            if (!id) return;
            try {
                const data = await getOnboardingById(id);
                setFormData({
                    employeeId: data.employee.id,
                    assignedHRId: data.assignedHR.id,
                    startDate: data.startDate.split('T')[0], // format to YYYY-MM-DD
                    notes: data.notes || '',
                    status: data.status,
                });
            } catch (err) {
                console.error('Failed to fetch onboarding by ID:', err);
            }
        };
        fetchOnboarding();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (!id) return;
            await updateOnboardingProcess(id, formData);
            navigate('/hr/onboarding');
        } catch (error) {
            console.error('Error updating onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <UserRound className="h-6 w-6" />
                    Edit Onboarding
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Employee Dropdown */}
                <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium">Employee</label>
                    <select
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white dark:bg-slate-800 text-black dark:text-white dark:border-gray-600"
                    >
                        <option value="">Select employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                    </select>
                </div>

                {/* HR Dropdown */}
                <div>
                    <label htmlFor="assignedHRId" className="block text-sm font-medium">Assigned HR</label>
                    <select
                        id="assignedHRId"
                        name="assignedHRId"
                        value={formData.assignedHRId}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white dark:bg-slate-800 text-black dark:text-white dark:border-gray-600"
                    >
                        <option value="">Select HR</option>
                        {hrList.map(hr => (
                            <option key={hr.userId} value={hr.userId}>
                                {hr.user?.fullName || 'Unnamed HR'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white dark:bg-slate-800 text-black dark:text-white dark:border-gray-600"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white dark:bg-slate-800 text-black dark:text-white dark:border-gray-600"
                    />
                </div>

                {/* Status Dropdown */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white dark:bg-slate-800 text-black dark:text-white dark:border-gray-600"
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md w-full"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Onboarding'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditOnboardingForm;
