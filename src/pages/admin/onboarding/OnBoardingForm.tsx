import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { createOnboardingProcess, CreateOnboardingPayload, fetchAllHREmployees, HREmployee } from '../../../services/hrService';
import { Employee, getEmployees } from '../../../services/employeeService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { showError, showSuccess } from '../../../lib/toastUtils';
// import { getHRs } from '../../services/hrService'; // You’ll need this to fetch HRs

interface HR {
    id: string;
    name: string;
}

const OnboardingForm = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [hrList, setHrList] = useState<HREmployee[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateOnboardingPayload>({
        employeeId: '',
        assignedHRId: '',
        startDate: '',
        notes: '',
        status: 'Pending',
    });

    const [loading, setLoading] = useState(false);


    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated || !token) {
            setError('You are not authenticated. Please login again.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [isAuthenticated, token, navigate]);
    console.log("FORM");

    useEffect(() => {
        const fetchHREmployees = async () => {
            const data = await fetchAllHREmployees(); // <-- your service function
            console.log("Fetched HR Employees:", data); // Add this
            setHrList(data);
        };

        fetchHREmployees();
    }, []);


    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const empData = await getEmployees();
                console.log("emp data", empData);
                setEmployees(empData);
            } catch (err) {
                console.error('Failed to fetch employees or HR list:', err);
            }
        };

        fetchDropdownData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error before submission

        try {
            setLoading(true);
            await createOnboardingProcess(formData);
            showSuccess("Employee onboarded")
            navigate('/hr/onboarding');
        } catch (error: any) {
            if (error.message === 'This employee is already onboarded.' || error.message.includes('already')) {
                // window.alert(error.message); // 🔔 Show alert on duplicate
                showError(error.message)
            } else {
                setError('Something went wrong. Please try again.');
                showError("Some unknown error occurred ")
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <UserRound className="h-6 w-6" />
                    Create Onboarding
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Employee Dropdown */}
                <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium">
                        Employee
                    </label>
                    <select
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-gray-600"

                        required
                    >
                        <option value="">Select employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assigned HR Dropdown */}
                <div>
                    <label htmlFor="assignedHRId" className="block text-sm font-medium">
                        Assigned HR
                    </label>
                    <select
                        id="assignedHRId"
                        name="assignedHRId"
                        value={formData.assignedHRId}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-gray-600"

                        required
                    >
                        <option value="">Select HR</option>
                        {hrList.length === 0 && (
                            <div className="text-red-500 text-sm">⚠️ No HRs found or failed to load</div>
                        )}
                        {hrList.map((hr) => (
                            <option key={hr.userId} value={hr.userId}>
                                {hr.user?.fullName || 'Unnamed HR'}
                            </option>
                        ))}

                    </select>
                </div>

                {/* Start Date Picker */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-gray-600"

                        required
                    />
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium">
                        Notes (optional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-gray-600"

                    />
                </div>

                {/* Status Dropdown */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 mt-1 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-gray-600"
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1] flex items-center gap-1"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Onboarding'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OnboardingForm;
