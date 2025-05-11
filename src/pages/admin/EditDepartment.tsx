import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Trash2 } from 'lucide-react';
import { 
  getDepartmentById, 
  updateDepartment, 
  createSubDepartment,
  deleteSubDepartment,
  Department, 
  SubDepartment 
} from '../../services/departmentService';

const EditDepartment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department>({
    id: '',
    name: '',
    subDepartments: []
  });
  const [newSubDepartmentName, setNewSubDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!id) return;
      
      try {
        const departmentData = await getDepartmentById(id);
        setDepartment(departmentData);
      } catch (error) {
        console.error('Error fetching department:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch department');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDepartment({
      ...department,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await updateDepartment(id!, department?.name || '');
      console.log('Department updated successfully');
      navigate('/admin/departments');
    } catch (error) {
      console.error('Error updating department:', error);
      setError(error instanceof Error ? error.message : 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubDepartmentName.trim()) return;
    
    try {
      const newSubDepartment = await createSubDepartment(id!, newSubDepartmentName);
      setDepartment({
        ...department,
        subDepartments: [...(department?.subDepartments || []), newSubDepartment]
      });
      setNewSubDepartmentName('');
    } catch (error) {
      console.error('Error adding sub-department:', error);
      setError(error instanceof Error ? error.message : 'Failed to add sub-department');
    }
  };

  const handleDeleteSubDepartment = async (subDepartmentId: string) => {
    if (window.confirm("Are you sure you want to delete this sub-department?")) {
      try {
        await deleteSubDepartment(id!, subDepartmentId);
        setDepartment({
          ...department,
          subDepartments: department?.subDepartments?.filter(subDept => subDept.id !== subDepartmentId) || []
        });
      } catch (error) {
        console.error('Error deleting sub-department:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete sub-department');
      }
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
          onClick={() => navigate('/admin/departments')}
          className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Building2 /> Edit Department
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                Edit Department Details
              </h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Department Name*</label>
              <input
                type="text"
                name="name"
                value={department?.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/departments')}
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
              {isSubmitting ? 'Saving...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-Departments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
          Sub-Departments
        </h2>
        
        <div className="mb-6">
          <form onSubmit={handleAddSubDepartment} className="flex items-end gap-2">
            <div className="flex-grow">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Add New Sub-Department</label>
              <input
                type="text"
                value={newSubDepartmentName}
                onChange={(e) => setNewSubDepartmentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                placeholder="Enter sub-department name"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </form>
        </div>
        
        {department?.subDepartments && department.subDepartments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {department.subDepartments.map((subDept) => (
                  <tr key={subDept.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-gray-200">{subDept.id}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-gray-200">{subDept.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSubDepartment(subDept.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No sub-departments found. Add one using the form above.
          </div>
        )}
      </div>
    </div>
  );
};

export default EditDepartment; 