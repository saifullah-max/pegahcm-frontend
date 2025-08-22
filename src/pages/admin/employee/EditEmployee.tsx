import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { createEmployee, CreateEmployeeData, Document, Employee, EmployeeData, FileObject, getEmployeeById, updateEmployee, UpdateEmployeeData, } from '../../../services/employeeService';
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
import { showError, showInfo, showSuccess } from '../../../lib/toastUtils';
import SalaryFormModal from '../salary/SalaryFormModal';
import { createSalary, Salary } from '../../../services/salaryService';

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
    id: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    fatherName: string;
    phoneNumber: string;
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
    documents?: File[]; // for new uploads
    existingDocuments?: Document[]; // for already uploaded docs
    profileImage?: File; // new file if uploaded
    profileImageUrl?: string | null; // preview of existing image
    shiftId?: string;
    role: string;
    subRole: string;
    shift: string;
}


export const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "terminated", label: "Terminated" },
    { value: "resigned", label: "Resigned" },
    { value: "retired", label: "Retired" },
    { value: "onLeave", label: "On Leave" },
    { value: "probation", label: "Probation" },
];

const EditEmployee: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [newEmployee, setNewEmployee] = useState<EmployeeFormData>({
        id: '',
        fullName: '',
        email: '',
        fatherName: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        department: '',
        subDepartment: '',
        designation: '',
        status: statusOptions[0].value,
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
        shift: '',
        documents: [],
        existingDocuments: [],
        profileImage: undefined,
        profileImageUrl: null,
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
    const [userName, setUserName] = useState('');
    const [salaryModal, setSalaryModal] = useState(false);
    const location = useLocation();



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
                console.log("Sub-roles:", rolesData);
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

    function normalizeDocuments(docs: (Document | string | File)[] | undefined): Document[] {
        if (!docs) return [];

        return docs.map((doc) => {
            if (typeof doc === 'string') {
                return {
                    name: doc.split('/').pop() || 'document',
                    url: `${import.meta.env.VITE_API_URL}/${doc.replace(/\\/g, '/')}`,
                    mimeType: 'application/octet-stream',
                    uploadedAt: new Date(),
                } as unknown as Document;
            } else if (doc instanceof File) {
                // convert File to Document-like object for frontend preview
                return {
                    name: doc.name,
                    url: URL.createObjectURL(doc),
                    mimeType: doc.type || 'application/octet-stream',
                    uploadedAt: new Date(),
                } as unknown as Document;
            } else {
                return doc as Document;
            }
        });
    }

    const fetchSingleEmployee = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await getEmployeeById(id);
            console.log("Fetched Single Employee:", response);

            const { user, employee } = response as { user: any; employee: EmployeeData };

            // Normalize profile image & images array
            const images: FileObject[] = Array.isArray(employee.profileImage) ? employee.profileImage : [];
            const profileImageUrl =
                images.length > 0 && typeof images[0] === 'object' && 'url' in images[0]
                    ? (images[0] as FileObject).url
                    : employee.profileImageUrl || null;
            console.log("IMAGE", images);
            console.log("PROFILE IMAGE URL", profileImageUrl);

            // Normalize documents array
            const existingDocuments: Document[] = normalizeDocuments(employee.documents);
            console.log("EXISTING DOCS", existingDocuments);


            const status = (employee as any).status || '';
            const shift = employee.shiftId || '';

            setUserName(user.fullName);

            setNewEmployee({
                id: employee.id || '',
                fullName: user.fullName || '',
                email: user.email || '',
                fatherName: employee.fatherName || '',
                department: employee.departmentId || '',
                phoneNumber: employee.phoneNumber || '',
                subDepartment: employee.subDepartmentId || '',
                designation: employee.designation || '',
                password: '',
                confirmPassword: '',
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
                subRole: user.subRoleId || 'teamMember',

                // Images & documents
                profileImage: undefined, // new upload if any
                profileImageUrl,          // preview of existing image
                documents: [],            // new uploads
                existingDocuments,        // normalized existing docs
            });

            console.log("Normalized profileImageUrl:", profileImageUrl);
            console.log("Normalized existingDocuments:", existingDocuments);
        } catch (error) {
            console.error('Error fetching employee:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

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

    useEffect(() => {
        if (location.hash === "#salaryButton") {
            const element = document.getElementById("salaryButton");
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });

                // Add highlight class
                element.classList.add("highlight-temp");

                // Remove class after 2s (optional if using animation keyframes)
                const timer = setTimeout(() => {
                    element.classList.remove("highlight-temp");
                }, 2000);

                return () => clearTimeout(timer);
            }
        }
    }, [location]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        // Clear validation errors when the user edits a field
        setValidationErrors(prev => prev.filter(error => error.field !== name));
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

    const handleRemoveDocument = (index: number, type: 'existing' | 'new') => {
        if (type === 'existing') {
            setNewEmployee(prev => ({
                ...prev,
                existingDocuments: prev.existingDocuments?.filter((_, i) => i !== index),
            }));
        } else {
            setNewEmployee(prev => ({
                ...prev,
                documents: prev.documents?.filter((_, i) => i !== index),
            }));
        }
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

        // Phone format check
        const phoneRegex = /^\+92-\d{3}-\d{4}-\d{3}$/;
        if (!phoneRegex.test(String(newEmployee.phoneNumber || ''))) {
            setValidationErrors(prev => [
                ...prev,
                { field: "phoneNumber", message: "Phone must be in the format +92-111-2222-333" }
            ]);
            setLoading(false);
            setRegistering(false);
            return;
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmployee.email)) {
            setValidationErrors(prev => [
                ...prev,
                { field: "email", message: "Email must be a valid format (e.g., example@domain.com)" }
            ]);
            setLoading(false);
            setRegistering(false);
            return;
        }

        try {
            // Only new files go to `documents`
            const newFiles = newEmployee.documents || [];

            // Remaining existing documents metadata
            const existingDocsMeta = (newEmployee.existingDocuments || []).map(doc => ({
                name: doc.name,
                url: doc.url,
                mimeType: doc.mimeType,
                uploadedAt: doc.uploadedAt,
            }));

            // Build partial employee data
            const employeeData: Partial<CreateEmployeeData> & { documentsMetadata?: Document[] } = {
                fullName: newEmployee.fullName,
                email: newEmployee.email,
                phoneNumber: newEmployee.phoneNumber,
                gender: newEmployee.gender,
                dateOfBirth: newEmployee.dateOfBirth ? new Date(newEmployee.dateOfBirth) : undefined,
                emergencyContactName: newEmployee.emergencyContactName,
                emergencyContactPhone: newEmployee.emergencyContactPhone,
                address: newEmployee.address,
                fatherName: newEmployee.fatherName,
                roleId: String(newEmployee.role),
                subRoleId: String(newEmployee.subRole),
                departmentId: String(newEmployee.department),
                subDepartmentId: String(newEmployee.subDepartment),
                designation: newEmployee.designation,
                joiningDate: newEmployee.dateOfJoining ? new Date(newEmployee.dateOfJoining) : undefined,
                status: newEmployee.status,
                salary: newEmployee.salary ? Number(newEmployee.salary) : undefined,
                skills: newEmployee.skills || [],
                workLocation: newEmployee.workLocation,
                shiftId: String(newEmployee.shiftId),
                password: newEmployee.password || '',
                profileImage: newEmployee.profileImage,
                documents: newFiles, // Only new File uploads
                documentsMetadata: existingDocsMeta, // Remaining existing docs metadata
            };

            console.log("Submitting employee data for update...", employeeData);

            if (id) {
                await updateEmployee(id, employeeData);
                console.log("Id", id, "Employee updated");
            }

            showSuccess("Employee updated!");
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

    const handleSalarySubmit = async (data: Partial<Salary>) => {
        try {
            setLoading(true);
            const payload = {
                employeeId: newEmployee.id,
                baseSalary: Number(data.baseSalary),
                deductions: Number(data.deductions) || 0,
                bonuses: Number(data.bonuses) || 0,
                effectiveFrom: new Date(data.effectiveFrom!).toISOString(),
                effectiveTo: new Date(data.effectiveTo!).toISOString(),
                allowances: (data.allowances || [])
                    .filter(a => a.type?.trim() && a.amount)
                    .map(a => ({
                        type: a.type!.trim(),
                        amount: Number(a.amount) || 0
                    }))
            };

            await createSalary(payload);

            showSuccess('Salary created successfully!');
            navigate('/salary');
        } catch (err) {
            console.error('Error creating salary:', err);
            showError('Failed to create salary.');
        } finally {
            setLoading(false);
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
                    <UserRound /> Edit {userName}'s Information
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
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                placeholder="example@domain.com"
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
                                name="phoneNumber"
                                value={newEmployee.phoneNumber || ''}
                                onChange={handleInputChange}
                                pattern="\+92-\d{3}-\d{4}-\d{3}"
                                placeholder="+92-111-2222-333"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                                required />
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
                                className={`w-full px-3 py-2 border ${getFieldError('subRole') ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200`}
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

                                {subRole?.find(sr => sr.id === newEmployee.subRole)?.name.toLowerCase() !== "manager" && (
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
                                )}
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
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">
                                Status*
                            </label>
                            <select
                                name="status"
                                value={newEmployee.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                                required
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                id="salaryButton"
                                type="button"
                                className="px-4 py-2 text-white rounded-md bg-[#255199] hover:bg-[#2F66C1] flex items-center gap-1"
                                onClick={() => setSalaryModal(true)}
                                disabled={loading}
                            >
                                {loading ? "Opening..." : "Add Salary details"}
                            </button>
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

                            {/* Show existing image if available */}
                            {newEmployee.profileImageUrl && (
                                <div className="mb-3">
                                    <img
                                        src={newEmployee.profileImageUrl!} // full URL from backend
                                        alt="Current Profile"
                                        className="w-32 h-32 object-cover rounded-md border mb-2"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Current profile image
                                    </p>
                                </div>
                            )}

                            {/* Upload new image */}
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Upload New Profile Image</label>
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

                            {/* Show existing documents */}
                            {newEmployee.existingDocuments && newEmployee.existingDocuments.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-gray-700 dark:text-gray-300 mb-2">Current Documents</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {newEmployee.existingDocuments.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200"
                                            >
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline text-blue-600 dark:text-blue-400"
                                                >
                                                    {doc.name}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocument(index, 'existing')}
                                                    className="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload new documents */}
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Upload New Documents</label>
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

                            {/* Show newly selected documents */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {newEmployee.documents?.map((file, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        {file.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(index, 'new')}
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
                            disabled={loading || validationErrors.length > 0}
                            className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-[#255199] hover:bg-[#2F66C1] disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (registering ? 'Registering User...' : 'Creating Employee...') : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>

            <SalaryFormModal
                isOpen={salaryModal}
                onClose={() => setSalaryModal(false)}
                onSubmit={handleSalarySubmit}
                selectedEmployee={newEmployee as unknown as Employee}
            />
        </div>
    );
};

export default EditEmployee; 