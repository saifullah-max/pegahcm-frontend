import React, { useState, useEffect } from 'react';
import { Salary, Allowance } from '../../../services/salaryService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Salary>) => Promise<void>;
    initialData?: Salary | null;
}

// Form-specific type that allows blank strings for number fields
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
    const [formData, setFormData] = useState<FormData>({
        allowances: []
    });

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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">
                    {initialData ? 'Update Salary' : 'Add Salary'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="employeeId"
                        value={formData.employeeId || ''}
                        onChange={handleChange}
                        placeholder="Employee ID"
                        className="w-full border px-3 py-2 rounded"
                        required={!initialData}
                    />
                    <input
                        type="number"
                        name="baseSalary"
                        value={formData.baseSalary ?? ""}
                        onChange={handleChange}
                        placeholder="Base Salary"
                        className="w-full border px-3 py-2 rounded"
                    />

                    {/* Allowances Section */}
                    <div>
                        <label className="font-medium">Allowances</label>
                        {(formData.allowances || []).map((allowance, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={allowance.type}
                                    onChange={(e) => handleAllowanceChange(idx, 'type', e.target.value)}
                                    placeholder="Type"
                                    className="flex-1 border px-3 py-2 rounded"
                                />
                                <input
                                    type="number"
                                    value={allowance.amount ?? ""}
                                    onChange={(e) => handleAllowanceChange(idx, 'amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-32 border px-3 py-2 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAllowance(idx)}
                                    className="px-3 py-2 bg-red-500 text-white rounded"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAllowance}
                            className="mt-2 px-3 py-2 bg-green-500 text-white rounded"
                        >
                            + Add Allowance
                        </button>
                    </div>

                    <input
                        type="number"
                        name="deductions"
                        value={formData.deductions ?? ""}
                        onChange={handleChange}
                        placeholder="Deductions"
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="number"
                        name="bonuses"
                        value={formData.bonuses ?? ""}
                        onChange={handleChange}
                        placeholder="Bonuses"
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="date"
                        name="effectiveFrom"
                        value={formData.effectiveFrom || ''}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="date"
                        name="effectiveTo"
                        value={formData.effectiveTo || ''}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
