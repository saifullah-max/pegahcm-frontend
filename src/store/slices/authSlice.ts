import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../../services/employeeService';
interface SubRole {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  status: string;
  subRole?: SubRole | null;
  employee?: Employee;
  impersonatedBy?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'), // Initialize from localStorage if available
  isAuthenticated: false,
  isAuthHydrated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>

    ) => {
      console.log("Redux: setCredentials called", action.payload);

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token); // optional: persist token
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token'); // Clean up localStorage on logout
    },
    markAuthHydrated: (state) => {
      state.isAuthHydrated = true;
    }
  },
});




export const { setCredentials, logout, markAuthHydrated } = authSlice.actions;
export default authSlice.reducer;