import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { createShift } from '../../../services/ShiftService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const AddShifts: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '16:00',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError('You are not authenticated. Please login again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [isAuthenticated, token, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Create Date objects for start and end times
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      // Format the data according to the updated CreateShiftData interface
      const shiftData = {
        name: formData.name,
        startTime: startDateTime,
        endTime: endDateTime,
        description: formData.description
      };
      
      await createShift(shiftData);
      
      console.log('Shift added successfully');
      // Navigate back to shifts list
      navigate('/admin/shifts');
    } catch (error) {
      console.error('Error adding shift:', error);
      setError(error instanceof Error ? error.message : 'Failed to add shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/admin/shifts')}
          className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <UserRound /> Add Shifts
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Add Shift */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Add Shift Details
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Shift Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Description*</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            {/* Start Date and Time */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>

            {/* End Date and Time */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/shifts')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShifts; 