import React, { useState, useEffect } from 'react';
import { createSalary } from '../../../services/salaryService';
import { getEmployees } from '../../../services/employeeService';
import { useNavigate } from 'react-router-dom';
import { Banknote, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { showError, showSuccess } from '../../../lib/toastUtils';

interface Employee {
    id: string;
    fullName: string;
    email: string;
}

interface Allowance {
    type: string;
    amount: string;
}

const AddSalary = () => {
    const [formData, setFormData] = useState({
        employeeId: '',
        baseSalary: '',
        deductions: '',
        bonuses: '',
        effectiveFrom: '',
        effectiveTo: ''
    });

    const [allowances, setAllowances] = useState<Allowance[]>([
        { type: '', amount: '' }
    ]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const navigate = useNavigate();

    // Fetch employees
    useEffect(() => {
        (async () => {
            try {
                setLoadingEmployees(true);
                const empList = await getEmployees();
                setEmployees(empList || []);
            } catch (err) {
                console.error('Error fetching employees:', err);
            } finally {
                setLoadingEmployees(false);
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAllowanceChange = (index: number, field: keyof Allowance, value: string) => {
        const updated = [...allowances];
        updated[index][field] = value;
        setAllowances(updated);
    };

    const addAllowanceRow = () => {
        setAllowances((prev) => [...prev, { type: '', amount: '' }]);
    };

    const removeAllowanceRow = (index: number) => {
        setAllowances((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                employeeId: formData.employeeId,
                baseSalary: Number(formData.baseSalary),
                deductions: Number(formData.deductions) || 0,
                bonuses: Number(formData.bonuses) || 0,
                effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
                effectiveTo: new Date(formData.effectiveTo).toISOString(),
                allowances: allowances
                    .filter(a => a.type.trim() && a.amount.trim())
                    .map(a => ({
                        type: a.type.trim(),
                        amount: Number(a.amount) || 0
                    }))
            };

            await createSalary(payload);

            showSuccess('Salary created successfully!');
            navigate('/salary');
        } catch (err) {
            console.error('Error creating salary:', err);
            showError('Failed to create salary.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Banknote /> Create Salary
                </h2>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#255199] transition-colors"
                >
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Dropdown */}
                <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    disabled={loadingEmployees}
                    className="border dark:border-gray-700 rounded px-3 py-2"
                >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.email})
                        </option>
                    ))}
                </select>

                <input
                    name="baseSalary"
                    type="number"
                    placeholder="Base Salary"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    required
                    className="border dark:border-gray-700 rounded px-3 py-2"
                />

                <input
                    name="deductions"
                    type="number"
                    placeholder="Deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    className="border dark:border-gray-700 rounded px-3 py-2"
                />
                <input
                    name="bonuses"
                    type="number"
                    placeholder="Bonuses"
                    value={formData.bonuses}
                    onChange={handleChange}
                    className="border dark:border-gray-700 rounded px-3 py-2"
                />
                <input
                    name="effectiveFrom"
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={handleChange}
                    required
                    className="border dark:border-gray-700 rounded px-3 py-2"
                />
                <input
                    name="effectiveTo"
                    type="date"
                    value={formData.effectiveTo}
                    onChange={handleChange}
                    required
                    className="border dark:border-gray-700 rounded px-3 py-2"
                />

                {/* Allowances Section */}
                <div className="md:col-span-2 mt-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Allowances</h3>
                    {allowances.map((a, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Type (e.g. Housing)"
                                value={a.type}
                                onChange={(e) => handleAllowanceChange(index, 'type', e.target.value)}
                                className="border dark:border-gray-700 rounded px-3 py-2 flex-1"
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={a.amount}
                                onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                                className="border dark:border-gray-700 rounded px-3 py-2 w-32"
                            />
                            <button
                                type="button"
                                onClick={() => removeAllowanceRow(index)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addAllowanceRow}
                        className="flex items-center gap-1 text-sm text-[#255199] mt-2"
                    >
                        <Plus size={16} /> Add Allowance
                    </button>
                </div>

                <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#255199] hover:bg-[#2F66C1] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Salary'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSalary;
