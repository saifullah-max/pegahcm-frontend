import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService'; // Create this API helper

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError('Please fill both password fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }
        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, password);
            alert('Password has been reset successfully. Please login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-black dark:from-gray-900 dark:to-black relative">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow p-8 w-[320px] mx-auto flex flex-col">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your new password below
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="sr-only">New Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="mt-1 p-2 block w-full h-8 rounded-md border-white bg-slate-200 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="mt-1 p-2 block w-full h-8 rounded-md border-white bg-slate-200 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                            />
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#255199] hover:bg-[#2F66C1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
