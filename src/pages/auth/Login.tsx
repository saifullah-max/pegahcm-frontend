import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { Moon, Sun } from 'lucide-react';
import { toggleTheme } from '../../store/slices/themeSlice';
import { loginUser } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      dispatch(setCredentials({
        user: response.user,
        token: response.token
      }));

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('token', response.token);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('token');
      }

      navigate('/admin/dashboard');
      
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-black dark:from-gray-900 dark:to-black relative">
      <button
        onClick={handleThemeToggle}
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-white mb-2">PegaHCM</h1>
          <p className="text-white/80">Sign in to access your dashboard</p>
        </div>
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-slate-50 dark:shadow-gray-900 p-8 h-[420px] w-[320px] mx-auto flex flex-col justify-center">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 p-2 block w-full h-8 rounded-md border-white bg-slate-200 dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 p-2 block w-full h-8 rounded-lg border-white bg-slate-200 dark:bg-gray-800 shadow-sm focus:border-none focus:ring-0 text-gray-900 dark:text-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 accent-slate-200 opacity-40 dark:accent-gray-700"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-1 block text-xs text-gray-700 dark:text-gray-300">
                  Remember me next time
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#255199] hover:bg-[#2F66C1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="text-sm">
                <a href="#" 
                  onClick={() => navigate('/forgot-password')}
                    className="font-medium text-blue-500 hover:text-blue-600 flex justify-center mt-2">
                  Forgot your password?
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;