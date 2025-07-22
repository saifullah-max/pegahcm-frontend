interface RegisterUserData {
  fullName: string;
  email: string;
  password: string;
  roleId?: string;
}
interface UpdateUserData {
  fullName: string;
  email: string;
  roleId?: string;
  password?: string; // Optional for updates, but required for registration
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      password: string;
      fullName: string;
      email: string;
      roleId: string;
    };
    token: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

// Export the class directly, not just as a type
export class RegistrationError extends Error {
  status: number;
  validationErrors?: ValidationError[];
  
  constructor(message: string, status: number = 400, validationErrors?: ValidationError[]) {
    super(message);
    this.name = 'RegistrationError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

// Validate registration data
const validateRegistrationData = (data: RegisterUserData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 3 characters' });
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Valid email address is required' });
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  
  return errors;
};

// Register a new user
export const registerUser = async (userData: RegisterUserData, preserveAdminToken: boolean = false): Promise<RegisterResponse> => {
  try {
    // Validate input data
    const validationErrors = validateRegistrationData(userData);
    if (validationErrors.length > 0) {
      throw new RegistrationError(
        'Validation failed',
        400,
        validationErrors
      );
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new RegistrationError(`Registration failed: ${response.status} ${response.statusText}`, response.status);
    }

    if (!response.ok) {
      // Handle validation errors from server
      if (response.status === 400 && data.errors) {
        throw new RegistrationError(
          data.message || 'Validation failed',
          400,
          Array.isArray(data.errors) ? data.errors : Object.entries(data.errors).map(([field, message]) => ({ field, message: message as string }))
        );
      }
      
      // Handle other errors
      throw new RegistrationError(
        data.message || `Registration failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    // If registration is successful and there's a token, store it
    // Unless we're preserving the admin token
    if (data.success && data.data?.token && !preserveAdminToken) {
      localStorage.setItem('token', data.data.token);
      
      // Optionally, store user info (but be careful with sensitive data)
      const userInfo = {
        id: data.data.user.id,
        fullName: data.data.user.fullName,
        email: data.data.user.email,
        role: data.data.user.role
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
    
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof RegistrationError) {
      throw error;
    }
    throw new RegistrationError(error instanceof Error ? error.message : 'Unknown registration error');
  }
};

// Register user as employee (combination of user registration and employee creation)
export const registerUserAsEmployee = async (
  userData: RegisterUserData, 
  employeeData: any // This will be imported from employeeService if needed
): Promise<any> => {
  try {
    // First register the user
    const userResponse = await registerUser(userData);
    
    if (!userResponse.success) {
      throw new Error(userResponse.message || 'User registration failed');
    }
    
    // Return the user registration response
    return userResponse;
    
    // Note: The actual employee creation would be handled by the employeeService
    // This service is focused specifically on the registration portion
  } catch (error) {
    console.error('Error in registerUserAsEmployee:', error);
    throw error;
  }
};

// Export types for reuse, but exclude RegistrationError as it's exported directly
export type { RegisterUserData, RegisterResponse, ValidationError, UpdateUserData };
