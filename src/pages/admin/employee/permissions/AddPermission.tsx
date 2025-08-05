import React, { useState } from 'react';
import { createPermission } from '../../../../services/permissionService';
import { ArrowLeft, Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../../../lib/toastUtils';

const initialModules = ['Department', 'Employee', 'Project', 'Leave', 'Shift', 'Role', 'SubRole'];
const actions = ['view', 'view-all', 'create', 'update', 'delete', 'approve'];

const AddPermission = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'single' | 'bulk'>('single');

    const [modules, setModules] = useState<string[]>([...initialModules]);

    // Single permission state
    const [module, setModule] = useState('');
    const [action, setAction] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Custom Module (bulk only)
    const [customModule, setCustomModule] = useState('');
    const [customError, setCustomError] = useState('');

    // Bulk state
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [bulkMessage, setBulkMessage] = useState('');

    const toggleSelection = (
        value: string,
        selected: string[],
        setSelected: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setSelected(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        );
    };

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await createPermission({ module, action, description });
            showSuccess('Permission created successfully!')
            setModule('');
            setAction('');
            setDescription('');
        } catch (err: any) {
            showError(err.message || 'Failed to create permission')
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModules.length || !selectedActions.length) return;

        setLoading(true);
        setBulkMessage('');

        const combinations = selectedModules.flatMap((mod) =>
            selectedActions.map((act) => ({
                module: mod,
                action: act,
                description: `${act} ${mod}`,
            }))
        );

        for (const perm of combinations) {
            try {
                await createPermission(perm);
            } catch (err) {
                console.error(`Failed to create`, perm);
            }
        }

        setLoading(false);
        setSelectedModules([]);
        setSelectedActions([]);
        setBulkMessage('✅ All permissions created successfully!');
    };

    const handleAddCustomModule = () => {
        const isValid = /^[A-Z][a-zA-Z]+$/.test(customModule);
        if (!isValid) {
            setCustomError('Module must start with a capital letter and contain only letters.');
            return;
        }

        if (!modules.includes(customModule)) {
            setModules(prev => [...prev, customModule]);
        }

        if (!selectedModules.includes(customModule)) {
            setSelectedModules(prev => [...prev, customModule]);
        }

        setCustomModule('');
        setCustomError('');
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-10 px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-2xl mb-6 flex items-center">
                <button
                    onClick={() => navigate('/admin/permission')}
                    className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Cog className="text-2xl" /> Add Permission
                </h1>
            </div>

            {/* Tab Switcher */}
            <div className="mb-4 flex gap-4">
                <button
                    className={`px-4 py-2 rounded ${tab === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                    onClick={() => setTab('single')}
                >
                    Single Permission
                </button>
                <button
                    className={`px-4 py-2 rounded ${tab === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                    onClick={() => setTab('bulk')}
                >
                    Bulk Permission
                </button>
            </div>

            {/* Custom Module Input (only for bulk) */}
            {tab === 'bulk' && (
                <div className="w-full max-w-md mb-6">
                    <label className="block font-medium mb-1">Add Custom Module:</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="e.g. Attendance"
                            value={customModule}
                            onChange={(e) => {
                                setCustomModule(e.target.value);
                                setCustomError('');
                            }}
                            className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomModule}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    {customError && <p className="text-red-600 text-sm">{customError}</p>}
                </div>
            )}

            {/* Tab Content */}
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {tab === 'single' ? (
                    <form onSubmit={handleSingleSubmit} className="space-y-4">
                        <input
                            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            type="text"
                            placeholder="Module (e.g. Department)"
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            required
                        />
                        <input
                            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            type="text"
                            placeholder="Action (e.g. view, create)"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            required
                        />
                        <textarea
                            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Permission'}
                        </button>
                        {message && (
                            <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                ) : (
                    <form onSubmit={handleBulkSubmit} className="space-y-5">
                        <div>
                            <label className="block font-medium mb-1">Select Modules:</label>
                            <div className="flex flex-wrap gap-2">
                                {modules.map((mod) => (
                                    <button
                                        type="button"
                                        key={mod}
                                        onClick={() => toggleSelection(mod, selectedModules, setSelectedModules)}
                                        className={`px-3 py-1 rounded-full border ${selectedModules.includes(mod)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                                            }`}
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Select Actions:</label>
                            <div className="flex flex-wrap gap-2">
                                {actions.map((act) => (
                                    <button
                                        type="button"
                                        key={act}
                                        onClick={() => toggleSelection(act, selectedActions, setSelectedActions)}
                                        className={`px-3 py-1 rounded-full border ${selectedActions.includes(act)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                                            }`}
                                    >
                                        {act}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Bulk Permissions'}
                        </button>

                        {bulkMessage && (
                            <p className="text-green-600 text-sm mt-2">{bulkMessage}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddPermission;
