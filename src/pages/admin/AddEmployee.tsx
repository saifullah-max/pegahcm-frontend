import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { createEmployee, CreateEmployeeData } from '../../services/employeeService';
import { getShifts } from '../../services/ShiftService';
import { getDepartments, Department, SubDepartment } from '../../services/departmentService';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
}

interface EmployeeFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  designation: string;
  department: string;
  subDepartment: string;
  workLocation: string;
  gender: string;
  address: string;
  emergencyContact: EmergencyContact;
  salary: string;
  skills: string[];
  status: string;
  phone?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  documents?: File[];
  profileImage?: File;
  shiftId?: string;
}

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  
  const [newEmployee, setNewEmployee] = useState<EmployeeFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    subDepartment: '',
    designation: '',
    status: 'active',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfJoining: '',
    salary: '',
    gender: 'Other',
    emergencyContact: {
      name: '',
      phone: ''
    },
    skills: [],
    workLocation: 'Onsite',
    shiftId: '',
  });

  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [subDepartmentsLoading, setSubDepartmentsLoading] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
      setShiftsLoading(true);
      try {
        const shiftsData = await getShifts();
        setShifts(shiftsData);
      } catch (error) {
        // Handle error appropriately
      } finally {
        setShiftsLoading(false);
      }
    };

    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const departmentsData = await getDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        // Handle error appropriately
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchShifts();
    fetchDepartments();
  }, []);

  // Fetch sub-departments when department changes
  useEffect(() => {
    const fetchSubDepartments = async () => {
      if (!newEmployee.department) {
        setSubDepartments([]);
        return;
      }
      
      setSubDepartmentsLoading(true);
      try {
        const selectedDepartment = departments.find(dept => dept.id === newEmployee.department);
        
        if (selectedDepartment) {
          if (selectedDepartment.subDepartments && Array.isArray(selectedDepartment.subDepartments)) {
            setSubDepartments(selectedDepartment.subDepartments);
          } else {
            setSubDepartments([]);
          }
        } else {
          setSubDepartments([]);
        }
      } catch (error) {
        setSubDepartments([]);
      } finally {
        setSubDepartmentsLoading(false);
      }
    };

    fetchSubDepartments();
  }, [newEmployee.department, departments]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Check password confirmation
    if (name === 'confirmPassword') {
      if (value !== newEmployee.password) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
    
    // If changing password, check if it matches confirmation
    if (name === 'password') {
      if (newEmployee.confirmPassword && value !== newEmployee.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
    
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.name === 'profileImage' && e.target.files[0]) {
        setNewEmployee({
          ...newEmployee,
          profileImage: e.target.files[0]
        });
      } else {
        const files = Array.from(e.target.files);
        setNewEmployee({
          ...newEmployee,
          documents: [...(newEmployee.documents || []), ...files],
        });
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    setNewEmployee({
      ...newEmployee,
      documents: newEmployee.documents?.filter((_, i) => i !== index),
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !newEmployee.skills?.includes(skillInput.trim())) {
      setNewEmployee({
        ...newEmployee,
        skills: [...(newEmployee.skills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setNewEmployee({
      ...newEmployee,
      skills: newEmployee.skills?.filter(skill => skill !== skillToRemove) || [],
    });
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'emergencyContactName') {
      setNewEmployee({
        ...newEmployee,
        emergencyContact: {
          ...newEmployee.emergencyContact,
          name: value
        }
      });
    } else if (name === 'emergencyContactPhone') {
      setNewEmployee({
        ...newEmployee,
        emergencyContact: {
          ...newEmployee.emergencyContact,
          phone: value
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmployee.password !== newEmployee.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      let departmentName = '';
      let subDepartmentName = '';
      
      if (newEmployee.department) {
        const selectedDepartment = departments.find(dept => dept.id === newEmployee.department);
        if (selectedDepartment) {
          departmentName = selectedDepartment.name;
        }
      }
      
      if (newEmployee.subDepartment) {
        const selectedSubDepartment = subDepartments.find(subDept => subDept.id === newEmployee.subDepartment);
        if (selectedSubDepartment) {
          subDepartmentName = selectedSubDepartment.name;
        }
      }
      
      const apiData: CreateEmployeeData = {
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        password: newEmployee.password,
        designation: newEmployee.designation,
        department: departmentName,
        subDepartment: subDepartmentName,
        workLocation: newEmployee.workLocation,
        gender: newEmployee.gender,
        address: newEmployee.address,
        emergencyContact: newEmployee.emergencyContact,
        salary: newEmployee.salary,
        skills: newEmployee.skills,
        status: newEmployee.status,
        documents: newEmployee.documents,
        profileImage: newEmployee.profileImage,
        shiftId: newEmployee.shiftId
      };
      
      await createEmployee(apiData);
      navigate('/admin/employees');
    } catch (error: any) {
      alert(`Failed to create employee: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <UserRound /> Add New Employee
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Information Section */}
            <div className="md:col-span-3">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Personal Information
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={newEmployee.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Email Address*</label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={newEmployee.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                value={newEmployee.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Confirm Password*</label>
              <input
                type="password"
                name="confirmPassword"
                value={newEmployee.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select
                name="gender"
                value={newEmployee.gender || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={newEmployee.dateOfBirth || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={newEmployee.emergencyContact.name}
                onChange={handleEmergencyContactChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={newEmployee.emergencyContact.phone}
                onChange={handleEmergencyContactChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="md:col-span-3 mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                name="address"
                value={newEmployee.address || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              ></textarea>
            </div>
            
            {/* Employment Information Section */}
            <div className="md:col-span-3 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Employment Information
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Department*</label>
              <select
                name="department"
                value={newEmployee.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              >
                <option value="">Select Department</option>
                {departmentsLoading ? (
                  <option disabled>Loading departments...</option>
                ) : (
                  departments && departments.length > 0 ? departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  )) : <option disabled>No departments available</option>
                )}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Sub Department*</label>
              <select
                name="subDepartment"
                value={newEmployee.subDepartment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
                disabled={!newEmployee.department || subDepartmentsLoading}
              >
                <option value="">Select Sub Department</option>
                {subDepartmentsLoading ? (
                  <option disabled>Loading sub-departments...</option>
                ) : (
                  subDepartments && subDepartments.length > 0 ? subDepartments.map((subDepartment) => (
                    <option key={subDepartment.id} value={subDepartment.id}>
                      {subDepartment.name}
                    </option>
                  )) : <option disabled>No sub-departments available</option>
                )}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Designation*</label>
              <input
                type="text"
                name="designation"
                value={newEmployee.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={newEmployee.dateOfJoining || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Status*</label>
              <select
                name="status"
                value={newEmployee.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="onLeave">On Leave</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Salary</label>
              <input
                type="text"
                name="salary"
                value={newEmployee.salary || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            {/* Skills Section */}
            <div className="md:col-span-3 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Skills
              </h2>
              
              <div className="flex mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 text-white rounded-r-md bg-[#255199] hover:bg-[#2F66C1]"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {newEmployee.skills?.map((skill) => (
                  <div 
                    key={skill}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center dark:bg-blue-900 dark:text-blue-100"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Location Section */}
            <div className="md:col-span-3 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Work Location
              </h2>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Work Location Type*</label>
              <select
                name="workLocation"
                value={newEmployee.workLocation || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              >
                <option value="">Select Work Location Type</option>
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Shift Assignment</label>
              <select
                name="shiftId"
                value={newEmployee.shiftId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="">Select Shift</option>
                {shiftsLoading ? (
                  <option disabled>Loading shifts...</option>
                ) : (
                  shifts && shifts.length > 0 ? shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name}
                    </option>
                  )) : <option disabled>No shifts available</option>
                )}
              </select>
            </div>

            {/* Profile Image Section */}
            <div className="md:col-span-3 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Profile Image
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Upload Profile Image</label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: JPG, PNG, GIF, etc.
                </p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="md:col-span-3 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Documents
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Upload Documents</label>
                <input
                  type="file"
                  name="documents"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF, DOC, etc.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {newEmployee.documents?.map((file, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/employees')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee; 