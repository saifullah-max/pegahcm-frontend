import React, { useState, useEffect } from 'react';
import { Salary, Allowance } from '../../../services/salaryService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Salary>) => Promise<void>;
    initialData?: Salary | null;
}

interface FormAllowance {
    type: string;
    amount: number | "";
}

interface FormData extends Omit<Partial<Salary>, 'allowances' | 'baseSalary' | 'deductions' | 'bonuses'> {
    baseSalary?: number | "";
    deductions?: number | "";
    bonuses?: number | "";
    allowances?: FormAllowance[];
}

const SalaryFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<FormData>({ allowances: [] });
    const { user } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                baseSalary: initialData.baseSalary ?? "",
                deductions: initialData.deductions ?? "",
                bonuses: initialData.bonuses ?? "",
                effectiveFrom: initialData.effectiveFrom?.substring(0, 10) || "",
                effectiveTo: initialData.effectiveTo?.substring(0, 10) || "",
                allowances: (initialData.allowances || []).map(a => ({
                    type: a.type,
                    amount: a.amount ?? ""
                }))
            });
        } else {
            setFormData({
                employeeId: '',
                baseSalary: "",
                allowances: [],
                deductions: "",
                bonuses: "",
                effectiveFrom: '',
                effectiveTo: ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number'
                ? value === "" ? "" : Number(value)
                : value
        }));
    };

    const handleAllowanceChange = (index: number, field: keyof FormAllowance, value: string | number) => {
        setFormData(prev => {
            const updatedAllowances = [...(prev.allowances || [])];
            updatedAllowances[index] = {
                ...updatedAllowances[index],
                [field]: field === 'amount'
                    ? value === "" ? "" : Number(value)
                    : value
            };
            return { ...prev, allowances: updatedAllowances };
        });
    };

    const addAllowance = () => {
        setFormData(prev => ({
            ...prev,
            allowances: [...(prev.allowances || []), { type: '', amount: "" }]
        }));
    };

    const removeAllowance = (index: number) => {
        setFormData(prev => ({
            ...prev,
            allowances: (prev.allowances || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedAllowances: Allowance[] = (formData.allowances || []).map(a => ({
            type: a.type,
            amount: a.amount === "" ? 0 : Number(a.amount)
        }));

        const payload: Partial<Salary> = {
            ...formData,
            baseSalary: formData.baseSalary === "" ? undefined : Number(formData.baseSalary),
            deductions: formData.deductions === "" ? undefined : Number(formData.deductions),
            bonuses: formData.bonuses === "" ? undefined : Number(formData.bonuses),
            allowances: cleanedAllowances
        };

        await onSubmit(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-2xl p-6 transform transition-all scale-100">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {initialData ? 'Update Salary' : 'Add Salary'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Employee ID
                        </label>
                        <input
                            name="employeeId"
                            value={formData.employeeId || ''}
                            onChange={handleChange}
                            placeholder="Enter Employee ID"
                            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            required={!initialData}
                            disabled
                        />
                    </div>

                    {/* Salary fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['baseSalary', 'deductions', 'bonuses'].map(field => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    type="number"
                                    name={field}
                                    value={(formData[field as keyof FormData] as number | string) ?? ""}
                                    onChange={handleChange}
                                    placeholder={`Enter ${field}`}
                                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Allowances */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Allowances
                        </label>
                        {(formData.allowances || []).map((allowance, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={allowance.type}
                                    onChange={(e) => handleAllowanceChange(idx, 'type', e.target.value)}
                                    placeholder="Type"
                                    className="flex-1 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="number"
                                    value={allowance.amount ?? ""}
                                    onChange={(e) => handleAllowanceChange(idx, 'amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-32 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAllowance(idx)}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAllowance}
                            className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                        >
                            + Add Allowance
                        </button>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Effective From
                            </label>
                            <input
                                type="date"
                                name="effectiveFrom"
                                value={formData.effectiveFrom || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Effective To
                            </label>
                            <input
                                type="date"
                                name="effectiveTo"
                                value={formData.effectiveTo || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                        >
                            {initialData ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryFormModal;
