import { Banknote, Edit, Plus, Trash } from 'lucide-react';
import {
    getAllSalaries,
    deleteSalary,
    createSalary,
    updateSalary,
    Salary,
    copyPreviousSalaryForEmployee,
} from '../../../services/salaryService';
import SalaryFormModal from './SalaryFormModal';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showError, showInfo } from '../../../lib/toastUtils';
import { getEmployees } from '../../../services/employeeService';

interface Allowance {
    type: string;
    amount: number;
}

const SalaryDetails = () => {
    const navigate = useNavigate();
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
    const [deleteSalaryId, setDeleteSalaryId] = useState<string | null>(null);
    const [deleteSalaryName, setDeleteSalaryName] = useState<string>('');
    const [employees, setEmployees] = useState<{ [key: string]: string }>({});
    const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
    const [selectedAllowances, setSelectedAllowances] = useState<Allowance[]>([]);

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            const map: { [key: string]: string } = {};
            data.forEach((emp) => {
                map[emp.id] = emp.fullName;
            });
            setEmployees(map);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAllSalaries();
            setSalaries(data);
        } catch (err) {
            console.error('Failed to fetch salaries', err);
            showError('Could not load salaries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, []);

    const handleDeleteSalary = (id: string, name: string) => {
        if (!id) {
            showError('Invalid salary ID for deletion');
            return;
        }
        setDeleteSalaryId(id);
        setDeleteSalaryName(name || 'Unknown Employee');
    };

    const confirmDeleteSalary = async () => {
        if (!deleteSalaryId) return;
        try {
            await deleteSalary(deleteSalaryId);
            showInfo(`Deleted salary record for ${deleteSalaryName}`);
            fetchData();
        } catch (error) {
            console.error(error);
            showError('Failed to delete salary');
        } finally {
            setDeleteSalaryId(null);
            setDeleteSalaryName('');
        }
    };

    const cancelDeleteSalary = () => {
        setDeleteSalaryId(null);
        setDeleteSalaryName('');
    };

    const handleAddSalary = () => {
        navigate('/salary/create');
    };

    const handleEditSalary = (salary: Salary) => {
        setSelectedSalary(salary);
        setModalOpen(true);
    };

    const handleSubmitSalary = async (data: Partial<Salary>) => {
        try {
            if (selectedSalary) {
                await updateSalary(selectedSalary.id, data);
                showInfo('Salary updated successfully');
            } else {
                await createSalary(data);
                showInfo('Salary created successfully');
            }
            fetchData();
            setModalOpen(false);
            setSelectedSalary(null);
        } catch (error) {
            console.error(error);
            showError('Failed to save salary');
        }
    };

    const handleViewAllAllowances = (allowances: Allowance[] = []) => {
        setSelectedAllowances(allowances);
        setAllowanceModalOpen(true);
    };

    // Helper to get "Month Year" string from date
    const getMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Group salaries by month-year (based on effectiveFrom)
    const salariesByMonth = salaries.reduce((acc: Record<string, Salary[]>, sal) => {
        const monthYear = getMonthYear(sal.effectiveFrom);
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(sal);
        return acc;
    }, {});

    return (
        <div className="mt-10">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Banknote /> Salary Details
                </h1>
                <button
                    onClick={handleAddSalary}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                >
                    <Plus /> Add Salary
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                    {Object.keys(salariesByMonth).map((monthYear) => (
                        <div key={monthYear} className="mb-8">
                            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">{monthYear}</h2>
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Employee</th>
                                        <th className="px-4 py-2 text-left">Base Salary</th>
                                        <th className="px-4 py-2 text-left">Allowances</th>
                                        <th className="px-4 py-2 text-left">Allowance Type</th>
                                        <th className="px-4 py-2 text-left">Deductions</th>
                                        <th className="px-4 py-2 text-left">Total Pay</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {salariesByMonth[monthYear].map((sal) => (
                                        <tr
                                            key={sal.id}
                                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="px-4 py-2">{employees[sal.employeeId] || sal.employeeId}</td>
                                            <td className="px-4 py-2">{sal.baseSalary}</td>
                                            <td className="px-4 py-2">
                                                {(sal.allowances ?? [])
                                                    .reduce((sum, a) => sum + Number(a.amount || 0), 0)
                                                    .toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2">
                                                {(sal.allowances?.length ?? 0) === 0 && '-'}
                                                {(sal.allowances?.length ?? 0) === 1 && (sal.allowances ?? [])[0].type}
                                                {(sal.allowances?.length ?? 0) > 1 && (
                                                    <button
                                                        onClick={() => handleViewAllAllowances(sal.allowances ?? [])}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View All
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">{sal.deductions || 0}</td>
                                            <td className="px-4 py-2">{sal.totalPay}</td>
                                            <td className="px-4 py-2 flex gap-2">
                                                <button
                                                    onClick={() => handleEditSalary(sal)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSalary(sal.id, employees[sal.employeeId])}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    title="Delete Salary"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await copyPreviousSalaryForEmployee(sal.employeeId);
                                                            showInfo(
                                                                `Copied next month salary for ${employees[sal.employeeId] || sal.employeeId
                                                                }`
                                                            );
                                                            fetchData();
                                                        } catch (error) {
                                                            showError('Failed to copy next month salary');
                                                        }
                                                    }}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                                                    title="Copy Next Month Salary"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* Salary Create/Edit Modal */}
            <SalaryFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedSalary(null);
                }}
                onSubmit={handleSubmitSalary}
                initialData={selectedSalary}
            />

            {/* Allowances Modal */}
            {allowanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Allowances
                        </h2>
                        <ul className="space-y-2">
                            {selectedAllowances.map((a, idx) => (
                                <li
                                    key={idx}
                                    className="flex justify-between border-b pb-1 dark:border-gray-700"
                                >
                                    <span>{a.type}</span>
                                    <span>{a.amount}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setAllowanceModalOpen(false)}
                                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteSalaryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Confirm Salary Deletion
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete the salary record for{' '}
                            <span className="font-semibold">{deleteSalaryName}</span>?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={cancelDeleteSalary}
                                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteSalary}
                                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryDetails;
