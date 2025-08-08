import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { createEmployee, CreateEmployeeData, getEmployeeById, updateEmployee, UpdateEmployeeData, uploadDocuments, uploadProfileImage } from '../../../services/employeeService';
import { getShifts } from '../../../services/ShiftService';
import { getDepartments, Department, SubDepartment } from '../../../services/departmentService';
import {
    registerUser,
    RegisterUserData,
    ValidationError,
    RegistrationError,
    UpdateUserData
} from '../../../services/registerService';
import { getRoles, Role } from '../../../services/roleService';
import { SubRole } from '../../../services/permissionService';
import { getAllSubRoles } from '../../../services/subRoleService';
import { showError, showSuccess } from '../../../lib/toastUtils';

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
    fatherName: string;
    designation: string;
    department: string;
    subDepartment: string;
    workLocation: string;
    gender: string;
    address: string;
    emergencyContactName: EmergencyContact["name"];
    emergencyContactPhone: EmergencyContact["phone"];
    salary: string;
    skills: string[];
    status: string;
    phone?: number;
    dateOfBirth?: string;
    dateOfJoining?: string;
    documents?: File[];
    profileImage?: File;
    shiftId?: string;
    role: string;
    subRole: string;
    shift: string;
}

const EditEmployee: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [newEmployee, setNewEmployee] = useState<EmployeeFormData>({
        fullName: '',
        email: '',
        fatherName: '',
        password: '',
        confirmPassword: '',
        department: '',
        subDepartment: '',
        designation: '',
        status: '',
        phone: 0,
        address: '',
        dateOfBirth: '',
        dateOfJoining: '',
        salary: '',
        gender: 'Other',
        emergencyContactName: '',
        emergencyContactPhone: '',
        skills: [],
        workLocation: 'Onsite',
        shiftId: '',
        role: 'employee',
        subRole: 'teamMember',
        shift: ''
    });

    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [passwordError, setPasswordError] = useState('');
    const [shiftsLoading, setShiftsLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [subDepartmentsLoading, setSubDepartmentsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [registering, setRegistering] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [subRole, setSubRole] = useState<SubRole[]>();
    const [subRolesLoading, setSubRolesLoading] = useState(false);

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

        const fetchRoles = async () => {
            setRolesLoading(true);
            try {
                const rolesData = await getRoles();
                setRoles(rolesData);
            } catch (error) {
                // Handle error appropriately
            } finally {
                setRolesLoading(false);
            }
        };
        const fetchSubRoles = async () => {
            setSubRolesLoading(true);
            try {
                const rolesData = await getAllSubRoles();
                setSubRole(rolesData);
            } catch (error) {
                // Handle error appropriately
            } finally {
                setSubRolesLoading(false);
            }
        }
        fetchSubRoles()
        fetchShifts();
        fetchDepartments();
        fetchRoles();
        // fetchSingleEmployee();
    }, []);

    const fetchSingleEmployee = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await getEmployeeById(id);
            console.log("Fetched Single Employee:", response);

            const { user, employee } = response;
            const status = (employee as any)['status'];
            const shift = (employee as any)['shift'];
            console.log(user);
            console.log("User status from backend:", user.status);
            console.log("Employee shiftId from backend:", employee);
            console.log("Available shifts:", shift); // This will now have the current shifts

            setNewEmployee({
                fullName: user.fullName || '',
                email: user.email || '',
                fatherName: employee.fatherName || '',
                department: employee.departmentId || '',
                password: '',
                confirmPassword: '',
                subDepartment: employee.subDepartmentId || '',
                designation: employee.designation || '',
                status: status,
                phone: user.phoneNumber || 0,
                address: employee.address || '',
                dateOfBirth: employee.dateOfBirth?.substring(0, 10) || '',
                dateOfJoining: employee.hireDate?.substring(0, 10) || '',
                salary: employee.salary?.toString() || '',
                gender: employee.gender || '',
                emergencyContactName: employee.emergencyContactName || '',
                emergencyContactPhone: employee.emergencyContactPhone || '',
                skills: employee.skills || [],
                workLocation: employee.workLocation || 'Onsite',
                shiftId: employee.shiftId || '',
                shift: shift,
                role: user.roleId || 'employee',
                subRole: user.subRoleId || 'teamMember'

            });

        } catch (error) {
            console.error('Error fetching employee:', error);
        } finally {
            setLoading(false);
        }
    }, [id]); // Add shifts as dependency

    useEffect(() => {
        if (id) { // Remove the shifts.length > 0 check
            fetchSingleEmployee();
        }
    }, [fetchSingleEmployee, id]); // Use fetchSingleEmployee as dependency

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

        // Clear validation errors when the user edits a field
        setValidationErrors(prev => prev.filter(error => error.field !== name));

        // Check password confirmation
        // if (name === 'confirmPassword') {
        //     if (value !== newEmployee.password) {
        //         setPasswordError('Passwords do not match');
        //     } else {
        //         setPasswordError('');
        //     }
        // }

        // // If changing password, check if it matches confirmation
        // if (name === 'password') {
        //     if (newEmployee.confirmPassword && value !== newEmployee.confirmPassword) {
        //         setPasswordError('Passwords do not match');
        //     } else {
        //         setPasswordError('');
        //     }
        // }

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

    // image upload handler
    const handleImageUpload = async () => {
        if (!newEmployee.profileImage) {
            alert('Please select a profile image');
            return;
        }

        try {
            if (id === undefined) {
                alert('Employee ID is undefined. Cannot upload image.');
                return;
            }
            const result = await uploadProfileImage(id, newEmployee.profileImage);
            console.log('Upload Success:', result);
            alert('Image uploaded successfully!');
        } catch (err) {
            alert('Image upload failed');
        }
    };

    // docs upload handler
    const handleDocumentUpload = async () => {
        if (!newEmployee.documents || newEmployee.documents.length === 0) {
            alert('Please select one or more documents');
            return;
        }

        try {
            if (id === undefined) {
                alert('Employee ID is undefined. Cannot upload image.');
                return;
            }
            const uploaded = await uploadDocuments(id, newEmployee.documents);
            console.log('Uploaded Documents:', uploaded);
            alert('Documents uploaded successfully!');
        } catch (err) {
            alert('Failed to upload documents');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);
        setPasswordError('');
        setLoading(true);
        setRegistering(true);

        if (newEmployee.password !== newEmployee.confirmPassword) {
            setPasswordError('Passwords do not match');
            setLoading(false);
            setRegistering(false);
            return;
        }


        const registerData: UpdateUserData = {
            fullName: newEmployee.fullName,
            email: newEmployee.email,
            roleId: newEmployee.role,
            password: newEmployee.password,
        };

        try {

            const apiData: UpdateEmployeeData = {
                fullName: newEmployee.fullName,
                email: newEmployee.email,
                phoneNumber: Number(newEmployee.phone || 0),
                password: newEmployee.password,
                gender: newEmployee.gender,
                dateOfBirth: newEmployee.dateOfBirth ? new Date(newEmployee.dateOfBirth) : new Date(),
                emergencyContactName: newEmployee.emergencyContactName,
                emergencyContactPhone: newEmployee.emergencyContactPhone,
                address: newEmployee.address,
                fatherName: newEmployee.fatherName,
                roleId: newEmployee.role,
                departmentId: newEmployee.department,
                subDepartmentId: newEmployee.subDepartment,
                designation: newEmployee.designation,
                joiningDate: newEmployee.dateOfJoining ? new Date(newEmployee.dateOfJoining) : new Date(),
                status: newEmployee.status,
                salary: parseFloat(newEmployee.salary || '0'),
                skills: newEmployee.skills,
                workLocation: newEmployee.workLocation,
                shiftId: newEmployee.shiftId,
                shift: newEmployee.shift,
                documents: newEmployee.documents,
                profileImage: newEmployee.profileImage,
            };
            console.log("Creating employee");
            if (newEmployee.password) {
                apiData.password = newEmployee.password;
            }

            if (id) {
                await updateEmployee(id, apiData);
                console.log("Id", id, "Employee updated");
            }
            console.log("New employee added");
            showSuccess("Employee updated!")
            navigate('/admin/employees');

        } catch (error: any) {
            setRegistering(false);

            if (error instanceof RegistrationError && error.validationErrors) {
                setValidationErrors(error.validationErrors);
            } else {
                showError(`Operation failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
            setRegistering(false);
        }
    };


    // Helper function to get field error message
    const getFieldError = (fieldName: string): string | undefined => {
        const error = validationErrors.find(err => err.field === fieldName);
        return error?.message;
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
                                className={`w-full px-3 py-2 border ${getFieldError('fullName') ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                                required
                            />
                            {getFieldError('fullName') && (
                                <p className="text-red-500 text-sm mt-1">{getFieldError('fullName')}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Email Address*</label>
                            <input
                                type="email"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${getFieldError('email') ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                                required
                            />
                            {getFieldError('email') && (
                                <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
                            )}
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
                                value={newEmployee.gender}
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
                                value={newEmployee.emergencyContactName}
                                // onChange={handleEmergencyContactChange}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
                            <input
                                type="tel"
                                name="emergencyContactPhone"
                                value={newEmployee.emergencyContactPhone}
                                onChange={handleInputChange}
                                // onChange={handleEmergencyContactChange}
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

                        {/* Add this new section before the "Employment Information Section" */}
                        <div className="md:col-span-3 mt-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                                User Role
                            </h2>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Role*</label>
                            <select
                                name="role"
                                value={newEmployee.role}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${getFieldError('role') ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                                required
                            >
                                <option value="">Select Role</option>
                                {rolesLoading ? (
                                    <option disabled>Loading roles...</option>
                                ) : (
                                    roles && roles.length > 0 ? roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    )) : <option value="employee">Employee</option>
                                )}
                            </select>
                            {getFieldError('role') && (
                                <p className="text-red-500 text-sm mt-1">{getFieldError('role')}</p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                This will determine what permissions the user has in the system.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">sub-Role*</label>
                            <select
                                name="subRole"
                                value={newEmployee.subRole}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${getFieldError('role') ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
                                required
                            >
                                <option value="">Select Sub-Role</option>
                                {rolesLoading ? (
                                    <option disabled>Loading sub-roles...</option>
                                ) : (
                                    subRole && subRole.length > 0 ? subRole.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    )) : <option value="teamMember">Team-Member</option>
                                )}
                            </select>
                            {getFieldError('subRole') && (
                                <p className="text-red-500 text-sm mt-1">{getFieldError('subRole')}</p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                This will determine what permissions the sub-user has in the system.
                            </p>
                        </div>

                        {/* Employment Information Section */}
                        <div className="md:col-span-3 mt-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
                                Employment Information
                            </h2>
                        </div>

                        {subRole?.find(sr => sr.id === newEmployee.subRole)?.name.toLowerCase() !== "director" && (
                            <>
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
                            </>
                        )}

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
                                name="shift" // matches the string field
                                value={newEmployee.shift || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                            >
                                <option value="">Select Shift</option>
                                {shiftsLoading ? (
                                    <option disabled>Loading shifts...</option>
                                ) : (
                                    shifts && shifts.length > 0 ? shifts.map((shift) => (
                                        <option key={shift.id} value={shift.name}>
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
                            <button
                                onClick={handleImageUpload}
                                className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                            >
                                Upload Image
                            </button>

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
                        <button
                            onClick={handleDocumentUpload}
                            className="w-fit px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1]"
                        >
                            Upload Documents
                        </button>

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
                            disabled={loading || validationErrors.length > 0}
                            className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (registering ? 'Registering User...' : 'Creating Employee...') : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployee; 