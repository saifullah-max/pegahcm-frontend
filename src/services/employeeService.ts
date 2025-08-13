interface EmergencyContact {
  name: string;
  phone: string;
}
export interface FileObject {
  name: string;
  url: string;
  mimeType: string;
  uploadedAt: Date;
}

export interface Document {
  name: string;
  url: string;
  mimeType: string;
  uploadedAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  role: string;
  subRole: string;
  designation: string;
  department: string;
  subDepartment: string;
  status: string;
  profileImage: string; // Keep if needed for DB mapping
  profileImageUrl?: string | null; // Computed value
  images?: FileObject[];
  documents: Document[];
  workLocation: string;
  gender: string;
  address: string;
  emergencyContact: EmergencyContact;
  salary: string;
  skills: string[];
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
  subRoleId: string;
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
  skills: string[];
  workLocation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shiftId?: string;
  profileImage: File | null;
  profileImageUrl: string | null; // For preview
  documents: File[];
  existingDocuments: Document[]; // For already uploaded docs
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
    const formData = new FormData();

    // Append all text fields
    formData.append('fullName', employeeData.fullName);
    formData.append('email', employeeData.email);
    formData.append('password', employeeData.password);
    formData.append('designation', employeeData.designation);
    formData.append('departmentId', employeeData.departmentId);
    formData.append('subDepartmentId', employeeData.subDepartmentId);
    formData.append('workLocation', employeeData.workLocation);
    formData.append('gender', employeeData.gender);
    formData.append('address', employeeData.address);
    formData.append('emergencyContactName', employeeData.emergencyContactName);
    formData.append('emergencyContactPhone', employeeData.emergencyContactPhone);
    formData.append('salary', employeeData.salary.toString());
    formData.append('status', employeeData.status);
    formData.append('phoneNumber', employeeData.phoneNumber.toString());
    formData.append('fatherName', employeeData.fatherName);
    formData.append('dateOfBirth', employeeData.dateOfBirth.toISOString());
    formData.append('joiningDate', employeeData.joiningDate.toISOString());
    formData.append('roleId', employeeData.roleId);
    formData.append('subRoleId', employeeData.subRoleId);
    formData.append('roleTag', employeeData.roleTag);
    if (employeeData.shiftId) formData.append('shiftId', employeeData.shiftId);

    // Append skills array (as JSON)
    formData.append('skills', JSON.stringify(employeeData.skills));

    // Append files
    if (employeeData.profileImage) {
      formData.append('profileImage', employeeData.profileImage);
    }
    if (employeeData.documents && employeeData.documents.length > 0) {
      employeeData.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
    }

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      // DO NOT set Content-Type manually (browser sets it for multipart/form-data)
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      const errorText = await response.text();
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
export const updateEmployee = async (id: string, employeeData: Partial<CreateEmployeeData> & { documentsMetadata?: any[] }): Promise<Employee> => {
  try {
    const formData = new FormData();

    // Append simple fields (excluding files, skills, emergencyContact)
    Object.entries(employeeData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== 'documents' &&
        key !== 'profileImage' &&
        key !== 'emergencyContact' &&
        key !== 'skills' &&
        key !== 'documentsMetadata'
      ) {
        formData.append(key, String(value));
      }
    });

    // Emergency contact
    if (employeeData.emergencyContactName) {
      formData.append('emergencyContact[name]', employeeData.emergencyContactName);
      if (employeeData.emergencyContactPhone) {
        formData.append('emergencyContact[phone]', employeeData.emergencyContactPhone);
      }
    }

    // Skills
    if (employeeData.skills && employeeData.skills.length > 0) {
      employeeData.skills.forEach((skill, index) => formData.append(`skills[${index}]`, skill));
    }

    // Profile image
    if (employeeData.profileImage instanceof File) {
      formData.append('profileImage', employeeData.profileImage);
    }

    // New files
    if (employeeData.documents && employeeData.documents.length > 0) {
      employeeData.documents.forEach(doc => {
        if (doc instanceof File) formData.append('documents', doc);
      });
    }

    // Remaining existing documents metadata as JSON string
    if (employeeData.documentsMetadata) {
      formData.append('documentsMetadata', JSON.stringify(employeeData.documentsMetadata));
    }

    const headers: Record<string, string> = getAuthHeaders();
    delete headers['Content-Type']; // Let browser set boundary for FormData

    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
      method: 'PUT',
      headers,
      body: formData
    });

    if (response.status === 401) throw new Error('invalid or expired token');
    if (!response.ok) throw new Error('Failed to update employee');

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
