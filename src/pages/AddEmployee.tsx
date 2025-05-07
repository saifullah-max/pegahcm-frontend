import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Present' | 'Absent' | 'On Leave';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  salary?: number;
  gender?: 'Male' | 'Female' | 'Other';
  emergencyContact?: string;
  bloodGroup?: string;
  skills?: string[];
}

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    department: '',
    designation: '',
    status: 'Present',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfJoining: '',
    salary: undefined,
    gender: undefined,
    emergencyContact: '',
    bloodGroup: '',
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: name === 'salary' ? (value ? parseFloat(value) : undefined) : value,
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
      skills: newEmployee.skills?.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would make an API call to save the employee
    console.log('Employee data to be saved:', newEmployee);
    
    // Navigate back to employees list
    navigate('/employees');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/employees')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Personal Information
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={newEmployee.name}
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
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={newEmployee.bloodGroup || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="md:col-span-2 mb-4">
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
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Employment Information
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Department*</label>
              <input
                type="text"
                name="department"
                value={newEmployee.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
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
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Salary</label>
              <input
                type="number"
                name="salary"
                value={newEmployee.salary || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={newEmployee.emergencyContact || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              />
            </div>
            
            {/* Skills Section */}
            <div className="md:col-span-2 mt-4">
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
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
            >
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee; 