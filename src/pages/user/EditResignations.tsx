import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResignationById, updateResignation } from '../../services/resignationService';
import { ArrowLeft } from 'lucide-react';

interface Resignation {
    id: string;
    resignationDate: string;
    lastWorkingDay: string;
    reason: string;
    status: string;
    clearanceStatus: string;
    assetReturnStatus: string;
}

const EditResignations: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [resignation, setResignation] = useState<Resignation | null>(null);
    const [reason, setReason] = useState('');
    const [lastWorkingDay, setLastWorkingDay] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light'); // default

    useEffect(() => {
        const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (currentTheme === 'dark') setTheme('dark');
        else setTheme('light');
    }, []);

    useEffect(() => {
        const fetchResignation = async () => {
            setLoading(true);
            try {
                if (!id) return;
                const data = await getResignationById(id);
                setResignation(data);
                setReason(data.reason);
                setLastWorkingDay(data.lastWorkingDay.slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch resignation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResignation();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resignation) return;

        try {
            const result = await updateResignation(resignation.id, {
                reason,
                lastWorkingDay,
            });

            console.log('Resignation updated:', result);
            navigate('/user/resignation');
        } catch (error) {
            alert('Failed to update resignation. It may already be processed.');
            console.error('Update error:', error);
        }
    };
    const inputClass =
        'w-full p-2 border rounded-md ' +
        (theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black');

    if (loading) {
        return <p className="text-gray-600 dark:text-gray-300">Loading resignation...</p>;
    }

    if (!resignation) {
        return <p className="text-red-600 dark:text-red-400">Resignation not found.</p>;
    }

    if (resignation.status !== 'Pending') {
        return (
            <div className="text-red-500 text-center mt-10">
                Resignation cannot be edited as it is already {resignation.status.toLowerCase()}.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-white">Edit Resignation</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Resignation Date (read-only)
                    </label>
                    <input
                        type="date"
                        value={resignation.resignationDate.slice(0, 10)}
                        disabled
                        className={`${inputClass} bg-gray-100 dark:bg-gray-800`}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Working Day
                    </label>
                    <input
                        type="date"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reason for Resignation
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={4}
                        className={inputClass}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                    Update Resignation
                </button>
            </form>
        </div>
    );
};

export default EditResignations;
