import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { getEmployeeById, updateEmployeeContact } from "../../../services/employeeService";
import { getAllSubDepartments, getDepartments } from "../../../services/departmentService";
import { getShifts } from "../../../services/ShiftService";
import { showError, showSuccess } from "../../../lib/toastUtils";

interface EmployeeInfo {
    id: string;
    employeeNumber: string;
    designation: string;
    departmentId: string;
    phoneNumber: string;
    subDepartmentId: string;
    gender: string;
    fatherName: string;
    address: string;
    salary: string;
    shiftId: string;
    status?: string;
    dateOfBirth: string;
    hireDate: string;
    skills: string[] | string;
    workLocation: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    profileImageUrl: string;
    documents: any[];
    images?: any[];
    joiningDate?: string;
}

interface FormDataState {
    email: string;
    phone: string;
    profileImageUrl?: string;
}

const Profile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const empId = user?.employee?.id;

    const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [subDepartments, setSubDepartments] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [editable, setEditable] = useState(false);
    const [formData, setFormData] = useState<FormDataState>({
        email: user?.email || "",
        phone: "",
        profileImageUrl: undefined,
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr.replace(" ", "T"));
        return date.toLocaleDateString("en-GB");
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!empId) return;

            const empRes = await getEmployeeById(empId);

            const empData: EmployeeInfo = {
                ...empRes.employee,
                images: (empRes.employee as any).images || [],
                emergencyContactPhone: empRes.employee.emergencyContactPhone || "",
                joiningDate: empRes.user.dateJoined,
                phoneNumber: empRes.employee.phoneNumber || "",
                shiftId: empRes.employee.shiftId || "",
                profileImageUrl: empRes.employee.profileImageUrl || "/default-avatar.png",
            };

            setEmployeeInfo(empData);

            const [deptRes, subDeptRes, shiftRes] = await Promise.all([
                getDepartments(),
                getAllSubDepartments(),
                getShifts(),
            ]);

            setDepartments(deptRes);
            setSubDepartments(subDeptRes);
            setShifts(shiftRes);

            setFormData({
                email: empRes.user.email || "",
                phone: empData.phoneNumber,
                profileImageUrl: empData.profileImageUrl,
            });
        };

        fetchData();
    }, [empId]);

    const getDepartmentName = (id: string) => departments.find((d) => d.id === id)?.name || "-";
    const getSubDepartmentName = (id: string) => subDepartments.find((sd) => sd.id === id)?.name || "-";
    const getShiftName = (id: string) => shifts.find((s) => s.id === id)?.name || "-";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, profileImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);

            // Upload to backend
            try {
                const updatedData = await updateEmployeeContact({ profileImageFile: file });
                setEmployeeInfo((prev) =>
                    prev ? { ...prev, profileImageUrl: updatedData.profileImageUrl || prev.profileImageUrl } : prev
                );
            } catch (err) {
                showError("Failed to update profile image");
            }
        }
    };

    const handleSave = async () => {

        // Phone format check
        const phoneRegex = /^\+92-\d{3}-\d{4}-\d{3}$/;
        if (!phoneRegex.test(String(formData.phone || ''))) {
            showError("Phone number must be in a format of: +92-111-2222-333")
            return;
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError("Email must be in a format of: example@domain.com")
            return;
        }

        try {
            const updatedData = await updateEmployeeContact({
                email: formData.email,
                phoneNumber: formData.phone,
            });

            setEmployeeInfo((prev) =>
                prev
                    ? {
                        ...prev,
                        phoneNumber: updatedData.phoneNumber,
                        profileImageUrl: updatedData.profileImageUrl || prev.profileImageUrl,
                    }
                    : prev
            );
            setEditable(false);
            showSuccess("Profile updated successfully!");
        } catch (err) {
            showError("Failed to update profile");
        }
    };

    if (!employeeInfo) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="relative w-24 h-24">
                            <img
                                src={formData.profileImageUrl || "/default-avatar.png"}
                                alt={user?.fullName || "Profile"}
                                className="w-24 h-24 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                            />
                        </div>
                        <label className="mt-2 text-blue-500 text-sm cursor-pointer hover:underline">
                            Change profile image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageChange}
                            />
                        </label>
                    </div>

                    <div className="flex-1 md:ml-6 mt-4 md:mt-0 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{user?.fullName}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{employeeInfo.designation}</p>
                        </div>
                        <button
                            className="mt-4 md:mt-0 ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => (editable ? handleSave() : setEditable(true))}
                        >
                            {editable ? "Save" : "Edit Info"}
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Editable Fields */}
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!editable}
                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            placeholder="example@domain.com"
                            className={`w-full px-3 py-2 border rounded ${editable ? "border-blue-400" : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!editable}
                            pattern="\+92-\d{3}-\d{4}-\d{3}"
                            placeholder="+92-111-2222-333"
                            className={`w-full px-3 py-2 border rounded ${editable ? "border-blue-400" : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                }`}
                        />
                    </div>

                    {/* Static Fields */}
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Employee Number</label>
                        <input
                            type="text"
                            value={employeeInfo.employeeNumber}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Department</label>
                        <input
                            type="text"
                            value={getDepartmentName(employeeInfo.departmentId)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Sub-Department</label>
                        <input
                            type="text"
                            value={getSubDepartmentName(employeeInfo.subDepartmentId)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Shift</label>
                        <input
                            type="text"
                            value={getShiftName(employeeInfo.shiftId)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Status</label>
                        <input
                            type="text"
                            value={employeeInfo.status}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Gender</label>
                        <input
                            type="text"
                            value={employeeInfo.gender}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Father Name</label>
                        <input
                            type="text"
                            value={employeeInfo.fatherName || "-"}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Date of Birth</label>
                        <input
                            type="text"
                            value={formatDate(employeeInfo.dateOfBirth)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Hire Date</label>
                        <input type="text" value={formatDate(employeeInfo.hireDate)} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Joining Date</label>
                        <input type="text" value={formatDate(employeeInfo.joiningDate)} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Work Location</label>
                        <input type="text" value={employeeInfo.workLocation} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Address</label>
                        <input type="text" value={employeeInfo.address} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Emergency Contact</label>
                        <input type="text" value={`${employeeInfo.emergencyContactName} - ${employeeInfo.emergencyContactPhone}`} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Salary</label>
                        <input type="text" value={employeeInfo.salary} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Skills</label>
                        <input type="text" value={Array.isArray(employeeInfo.skills) ? employeeInfo.skills.join(", ") : employeeInfo.skills} disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>

                    {/* Documents */}
                    {employeeInfo.documents?.length > 0 && (
                        <div className="md:col-span-2">
                            <label className="block text-gray-600 dark:text-gray-300 mb-1">Documents</label>
                            <ul className="list-disc ml-5">
                                {employeeInfo.documents.map((doc) => (
                                    <li key={doc.name}>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {doc.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;