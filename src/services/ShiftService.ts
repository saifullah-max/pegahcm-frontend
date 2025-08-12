export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface CreateShiftData {
  name: string;
  startTime: Date;
  endTime: Date;
  description: string;
}

interface UpdateShiftData {
  name?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
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
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getShifts = async (): Promise<Shift[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return handleAuthError(error);
  }
};

// Get a shift by ID
export const getShiftById = async (id: string): Promise<Shift> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch shift');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching shift with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Create a new shift
export const createShift = async (shiftData: CreateShiftData): Promise<Shift> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shiftData)
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to create shift');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating shift:', error);
    return handleAuthError(error);
  }
};

// Update an existing shift
export const updateShift = async (id: string, shiftData: UpdateShiftData): Promise<Shift> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(shiftData)
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to update shift');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating shift with ID ${id}:`, error);
    return handleAuthError(error);
  }
};

// Delete a shift
export const deleteShift = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shifts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      throw new Error('invalid or expired token');
    }

    if (!response.ok) {
      throw new Error('Failed to delete shift');
    }
  } catch (error) {
    console.error(`Error deleting shift with ID ${id}:`, error);
    handleAuthError(error);
  }
}; 