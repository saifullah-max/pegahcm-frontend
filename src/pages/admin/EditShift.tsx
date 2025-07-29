import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { getShiftById, updateShift } from '../../services/ShiftService';

interface ShiftData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}


const EditShift: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shift, setShift] = useState<ShiftData>({
    id: '',
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert ISO string to "HH:MM AM/PM"
  const formatTo12Hour = (isoTime: string) => {
    const date = new Date(isoTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${String(hours).padStart(2, '0')}:${paddedMinutes} ${ampm}`;
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;
      try {
        const shiftData = await getShiftById(id);

        const start = new Date(shiftData.startTime);
        const end = new Date(shiftData.endTime);

        setShift({
          id: shiftData.id,
          name: shiftData.name,
          description: shiftData.description,
          startDate: start.toISOString().split('T')[0],
          startTime: start.toTimeString().slice(0, 5),
          endDate: end.toISOString().split('T')[0],
          endTime: end.toTimeString().slice(0, 5),
        });
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
    setShift((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const start = new Date(`${shift.startDate}T${shift.startTime}`);
      const end = new Date(`${shift.endDate}T${shift.endTime}`);

      await updateShift(id!, {
        name: shift.name,
        startTime: start,
        endTime: end,
        description: shift.description,
      });

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
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
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

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Shift Name*</label>
              <input
                type="text"
                name="name"
                value={shift.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Description*</label>
              <input
                type="text"
                name="description"
                value={shift.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={shift.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={shift.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={shift.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={shift.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/shifts')}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white rounded bg-[#255199] hover:bg-[#2F66C1]"
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
