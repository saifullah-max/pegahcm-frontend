import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      // TODO: Implement your password reset API call here
      // const response = await forgotPasswordApi(email);
      
      alert('Password reset link has been sent to your email');
      navigate('/login');
    } catch (err) {
      setError('Failed to process password reset request');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-black dark:from-gray-900 dark:to-black relative">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-slate-50 dark:shadow-gray-900 p-8 h-[420px] w-[320px] mx-auto flex flex-col">
          <div className="text-center">
            <h2 className="mt-2 text-3xl text-gray-900">
              Forgot Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address to reset your password
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-full h-8 rounded-md border-white bg-slate-200 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                placeholder="Email address"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {error}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#255199] hover:bg-[#2F66C1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;