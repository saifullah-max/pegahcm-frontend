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
  status: string;
  dateJoined: string;
  phoneNumber?: number;
}

interface EmployeeData {
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
    console.log("Employee: ", data.data.employees);
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
