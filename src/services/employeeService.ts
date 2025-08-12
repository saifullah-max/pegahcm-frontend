interface EmergencyContact {
  name: string;
  phone: string;
}

interface Document {
  name: string;
  url: string;
  type: string;
}

export interface Employee {
  id: string;
  userId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  designation: string;
  department: string;
  subDepartment: string;
  status: string;
  profileImage: string;
  workLocation: string;
  gender: string;
  address: string;
  emergencyContact: EmergencyContact;
  salary: string;
  skills: string[];
  documents: Document[];
  hireDate: Date;
}

interface EmployeeResponse {
  data: {
    employees: Employee[];
  };
}

export interface CreateEmployeeData {
  fullName: string;
  email: string;
  phoneNumber: number;
  password: string;
  gender: string;
  dateOfBirth: Date;
  emergencyContactName: EmergencyContact["name"];
  emergencyContactPhone: EmergencyContact["phone"];

  designation: string;
  fatherName: string;
  departmentId: string;
  subDepartmentId: string;
  workLocation: string;
  roleId: string;
  roleTag: string;
  subRoleId: string;
  address: string;
  salary: number;
  skills: string[];
  status: string;
  documents?: File[];
  profileImage?: File;
  shiftId?: string;
  joiningDate: Date
}
export interface UpdateEmployeeData {
  fullName: string;
  email: string;
  phoneNumber: number;
  password: string;
  gender: string;
  dateOfBirth: Date;
  emergencyContactName: EmergencyContact["name"];
  emergencyContactPhone: EmergencyContact["phone"];

  designation: string;
  fatherName: string;
  departmentId: string;
  subDepartmentId: string;
  workLocation: string;
  roleId: string;
  address: string;
  salary: number;
  skills: string[];
  status: string;
  documents?: File[];
  profileImage?: File;
  shiftId?: string;
  shift: string;
  joiningDate: Date
}


interface UserData {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  subRoleId: string;
  status: string;
  dateJoined: string;
  phoneNumber?: number;
}

export interface EmployeeData {
  id: string;
  employeeNumber: string;
  designation: string;
  departmentId: string;
  subDepartmentId: string;
  gender: string;
  fatherName: string;
  address: string;
  salary: string;
  dateOfBirth: string;
  hireDate: string;
  profileImage: string | null;
  skills: string[];
  workLocation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  documents: any[];
  shiftId?: string;
}

export interface SingleEmployeeResponse {
  user: UserData;
  employee: EmployeeData;
}

// Also export the EmergencyContact interface for reuse
export type { EmergencyContact };

export interface SubmitResignationPayload {
  employeeId: string;
  resignationDate: string;     // ISO string (e.g., "2025-08-01")
  lastWorkingDay: string;      // ISO string
  reason: string;
}


// Helper function to handle authentication errors
const handleAuthError = (error: any) => {
  if (error.message?.includes('invalid token') || error.message?.includes('expired token')) {
    // Clear the invalid token
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  }
  throw error;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    throw new Error('Authentication token not found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const data: EmployeeResponse = await response.json();
    return data.data.employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return handleAuthError(error);
  }
};

export const getEmployeeById = async (id: string): Promise<SingleEmployeeResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }

    const data = await response.json();
    return data.data; // ✅ return both user and employee
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Create a new employee
export const createEmployee = async (employeeData: CreateEmployeeData): Promise<Employee> => {
  try {
    // console.log('Creating employee with data:', employeeData);

    // Try JSON approach first as the server might be expecting JSON
    const useFormData = false; // Set to false to use JSON approach

    let response;

    {

      const jsonData = {
        fullName: employeeData.fullName,
        email: employeeData.email,
        password: employeeData.password,
        designation: employeeData.designation,
        departmentId: employeeData.departmentId,
        subDepartmentId: employeeData.subDepartmentId,
        workLocation: employeeData.workLocation,
        gender: employeeData.gender,
        address: employeeData.address,
        emergencyContactName: employeeData.emergencyContactName,
        emergencyContactPhone: employeeData.emergencyContactPhone,
        salary: employeeData.salary,
        skills: employeeData.skills,
        status: employeeData.status,
        shiftId: employeeData.shiftId,
        phoneNumber: employeeData.phoneNumber,
        fatherName: employeeData.fatherName,
        dateOfBirth: employeeData.dateOfBirth,
        joiningDate: employeeData.joiningDate,
        roleId: employeeData.roleId,
        subRoleId: employeeData.subRoleId,
        roleTag: employeeData.roleTag
        // Only include these two if you're sending FormData or handling file uploads properly
        // profileImage: employeeData.profileImage,
        // documents: employeeData.documents,
      };


      const headers = getAuthHeaders();
      console.log('Using JSON approach with data:', jsonData);

      response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsonData)
      });
    }

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    // Get detailed error information if available
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to create employee: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data.data.employee;
  } catch (error) {
    console.error('Error creating employee:', error);
    return handleAuthError(error);
  }
};

// Update an employee
export const updateEmployee = async (id: string, employeeData: Partial<CreateEmployeeData>): Promise<Employee> => {
  try {
    const formData = new FormData();

    // Add all basic employee data
    Object.entries(employeeData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'documents' && key !== 'profileImage' && key !== 'emergencyContact' && key !== 'skills') {
        formData.append(key, value as string);
      }
    });

    // // Handle emergency contact if provided
    // if (employeeData.emergencyContact) {
    //   formData.append('emergencyContact.name', employeeData.emergencyContact.name);
    //   formData.append('emergencyContact.phone', employeeData.emergencyContact.phone);
    // }

    // Handle skills array if provided
    if (employeeData.skills) {
      employeeData.skills.forEach((skill, index) => {
        formData.append(`skills[${index}]`, skill);
      });
    }

    // Handle profile image if provided
    if (employeeData.profileImage) {
      formData.append('profileImage', employeeData.profileImage);
    }

    // Handle documents if provided
    if (employeeData.documents && employeeData.documents.length > 0) {
      employeeData.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
    }

    const headers: Record<string, string> = getAuthHeaders();
    // Remove Content-Type as FormData will set it with the correct boundary
    delete headers['Content-Type'];

    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: headers,
      body: formData
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to update employee');
    }

    const data = await response.json();
    return data.data.employee;
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    handleAuthError(error);
  }
};


export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  status: string;
  dateJoined: string;
}

interface InactiveUsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
}

export const getInactiveUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/users/inactive`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error('Invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch inactive users');
    }

    const data: InactiveUsersResponse = await response.json();
    return data.data.users;
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    throw error;
  }
};

// Delete a user only if linked employee is deleted
export const deleteUserConditionally = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/user/delete/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (response.status === 400 || response.status === 409) {
      // Read error message from response body if provided
      const errorData = await response.json();
      throw new Error(errorData.message || 'Cannot delete user due to linked employee');
    }

    if (!response.ok) {
      throw new Error('Failed to delete user conditionally');
    }

  } catch (error) {
    console.error(`Error deleting user with ID ${userId} conditionally:`, error);
    handleAuthError(error);
  }
};

// upload image
export const uploadProfileImage = async (employeeId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('employeeId', employeeId);

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}` // Don't set 'Content-Type' — browser sets it automatically for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data; // success message + saved DB record
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// uplaod docs
export const uploadDocuments = async (employeeId: string, files: File[]) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    formData.append('employeeId', employeeId);

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT manually set Content-Type for FormData
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload documents');
    }

    return data.savedDocuments;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
};
