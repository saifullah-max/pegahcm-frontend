import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { getShiftById, updateShift } from '../../services/ShiftService';

interface ShiftData {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

const EditShift: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shift, setShift] = useState<ShiftData>({
    id: '',
    name: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;
      
      try {
        const shiftData = await getShiftById(id);
        setShift(shiftData);
      } catch (error) {
        console.error('Error fetching shift:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch shift');
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShift({
      ...shift,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await updateShift(id!, {
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description,
      });
      
      console.log('Shift updated successfully');
      navigate('/admin/shifts');
    } catch (error) {
      console.error('Error updating shift:', error);
      setError(error instanceof Error ? error.message : 'Failed to update shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

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
          <UserRound /> Edit Shift
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
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Edit Shift Details
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Shift Name*</label>
              <input
                type="text"
                name="name"
                value={shift.name}
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
                value={shift.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <select
                name="startTime"
                value={shift.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <select
                name="endTime"
                value={shift.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="09:00 PM">09:00 PM</option>
                <option value="12:00 AM">12:00 AM</option>
                <option value="03:00 AM">03:00 AM</option>
              </select>
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
              {isSubmitting ? 'Saving...' : 'Update Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShift; 