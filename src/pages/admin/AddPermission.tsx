import React, { useState } from 'react';
import { createPermission } from '../../services/permissionService';

const AddPermission = () => {
    const [module, setModule] = useState('');
    const [action, setAction] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await createPermission({ module, action, description });
            setMessage('Permission created successfully!');
            setModule('');
            setAction('');
            setDescription('');
        } catch (err: any) {
            setMessage(err.message || 'Failed to create permission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Add New Permission</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border px-3 py-2 rounded"
                    type="text"
                    placeholder="Module (e.g. Department)"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    required
                />
                <input
                    className="w-full border px-3 py-2 rounded"
                    type="text"
                    placeholder="Action (e.g. view, create)"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    required
                />
                <textarea
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Permission'}
                </button>
                {message && <p className="text-sm mt-2">{message}</p>}
            </form>
        </div>
    );
};

export default AddPermission;
