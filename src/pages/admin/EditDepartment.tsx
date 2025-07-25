import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Edit, Plus, Trash2, TrashIcon } from 'lucide-react';
import {
  getDepartmentById,
  updateDepartment,
  createSubDepartment,
  deleteSubDepartment,
  getAllSubDepartments,
  Department,
  SubDepartment,
} from '../../services/departmentService';

const EditDepartment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department>({
    id: '',
    name: '',
    subDepartments: [],
  });
  const [newSubDepartmentName, setNewSubDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allSubDepartments, setAllSubDepartments] = useState<SubDepartment[]>([]);

  const fetchAllSubDepartments = async () => {
    try {
      const subs = await getAllSubDepartments();
      setAllSubDepartments(subs);
    } catch (err) {
      console.error("Failed to fetch all sub-departments", err);
    }
  };

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
    fetchAllSubDepartments();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await updateDepartment(id!, department?.name || '');
      navigate('/admin/departments');
    } catch (error) {
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
      setDepartment((prev) => ({
        ...prev,
        subDepartments: [...prev.subDepartments, newSubDepartment],
      }));
      setNewSubDepartmentName('');
      navigate('/admin/departments')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add sub-department');
    }
  };

  const handleDeleteSubDepartment = async (subDepartmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-department?")) return;

    try {
      await deleteSubDepartment(id!, subDepartmentId);
      setDepartment((prev) => ({
        ...prev,
        subDepartments: prev.subDepartments.filter((s) => s.id !== subDepartmentId),
      }));
      navigate(`/admin/departments`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete sub-department';
      setError(errorMessage);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setError(null);
      }, 4000);
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
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/admin/departments')}
          className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Building2 /> Edit Department
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700  mb-2">
            Department Name*
          </label>
          <input
            type="text"
            name="name"
            value={department?.name || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            required
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/departments')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>

      {/* Current SubDepartments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
          Sub-Departments
        </h2>

        <form onSubmit={handleAddSubDepartment} className="flex items-end gap-2 mb-4">
          <input
            type="text"
            value={newSubDepartmentName}
            onChange={(e) => setNewSubDepartmentName(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Enter sub-department name"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1] flex items-center gap-1"
          >
            <Plus size={16} /> Add
          </button>
        </form>

        {department?.subDepartments?.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {department.subDepartments.map((subDept) => (
                <tr key={subDept.id}>
                  <td className="px-6 py-3 text-gray-800 dark:text-gray-100">{subDept.id}</td>
                  <td className="px-6 py-3 text-gray-800 dark:text-gray-100">{subDept.name}</td>
                  <td className="px-6 py-3">
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
        ) : <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">All Sub-Departments</h2>

          {allSubDepartments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-200 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {allSubDepartments.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-200">
                      {sub.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Edit
                          // onClick={() => hand(sub.id)}
                          strokeWidth={1}
                          size={20}
                          className="text-blue-500 cursor-pointer"
                        />
                        <TrashIcon
                          onClick={() => handleDeleteSubDepartment(sub.id)}
                          strokeWidth={1}
                          size={20}
                          className="text-red-500 cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No sub-departments exist globally.</p>
          )}
        </div>
        }
      </div>
    </div>
  );
};

export default EditDepartment;
