import React, { useEffect, useState } from 'react';
import { RootState } from '../store';
import { Calendar, PieChart, Download, Eye, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getMySalary } from '../services/salaryService';
import { getEmployeeById } from '../services/employeeService';
import { getDepartments, getAllSubDepartments } from '../services/departmentService';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // still import to ensure plugin included for some bundlers; dynamic import used below too

interface Allowance {
  type: string;
  amount: number;
}

interface Salary {
  id: string;
  employeeId: string;
  baseSalary: number | string;
  allowances?: Allowance[];
  deductions: number | string;
  bonuses: number | string;
  totalPay: number | string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
  subDepartments: SubDepartment[];
}

interface SubDepartment {
  id: string;
  name: string;
  departmentId: string;
}

interface EmployeeDetailsResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  employee: {
    id: string;
    employeeNumber: string;
    designation: string;
    departmentId?: string;
    subDepartmentId?: string;
    gender: string;
    fatherName?: string;
    address: string;
    salary: string;
    shiftId?: string;
    shift?: string;
    status?: string;
    dateOfBirth: string;
    hireDate: string;
    skills: string[];
    workLocation: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
}

const PayslipDetails: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [salaryDetails, setSalaryDetails] = useState<Salary[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetailsResponse | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);

  const [showDetails, setShowDetails] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Fetch salary details on mount
  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const data = await getMySalary();
        setSalaryDetails(data || []);

        if (data && data.length > 0) {
          const sortedByDate = [...data].sort(
            (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
          );
          const latestMonth = new Date(sortedByDate[0].effectiveFrom).toLocaleString('default', { month: 'long', year: 'numeric' });
          setCurrentMonth(latestMonth);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSalary();
  }, []);

  // Fetch employee details by user.employee.id
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!user?.employee?.id) return;

      try {
        const data = await getEmployeeById(user.employee.id);
        setEmployeeDetails(data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
    fetchEmployeeDetails();
  }, [user]);

  // Fetch departments and sub-departments
  useEffect(() => {
    const fetchDepartmentsData = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts || []);

        const subDepts = await getAllSubDepartments();
        console.log("SUBDEPTS:", subDepts);
        setSubDepartments(subDepts || []);
      } catch (error) {
        console.error('Error fetching departments or sub-departments:', error);
      }
    };
    fetchDepartmentsData();
  }, []);

  // Find salary for the selected month (match by effectiveFrom month)
  const salaryForMonth = salaryDetails.find((salary) => {
    const effectiveMonth = new Date(salary.effectiveFrom).toLocaleString('default', { month: 'long', year: 'numeric' });
    return effectiveMonth === currentMonth;
  }) || salaryDetails[0]; // fallback to latest if no match

  // Ensure salary numbers are numbers (avoid string concat bugs)
  const safeNumber = (val: number | string | undefined) => {
    const n = Number(val ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  // Calculate earnings array (force numeric)
  const earnings = salaryForMonth
    ? [
      { title: 'Basic Salary', amount: safeNumber(salaryForMonth.baseSalary) },
      ...(salaryForMonth.allowances?.map((a) => ({
        title: a.type,
        amount: safeNumber(a.amount),
      })) || []),
      { title: 'Bonuses', amount: safeNumber(salaryForMonth.bonuses) },
    ]
    : [];

  // Calculate totals (numbers)
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = safeNumber(salaryForMonth?.deductions);
  const netSalary = safeNumber(salaryForMonth?.totalPay);

  // Available months for dropdown - generate dynamically from salaryDetails or fallback
  const availableMonths =
    salaryDetails.length > 0
      ? Array.from(
        new Set(
          salaryDetails
            .map((s) =>
              new Date(s.effectiveFrom).toLocaleString('default', { month: 'long', year: 'numeric' })
            )
        )
      ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      : ['May 2025', 'April 2025', 'March 2025', 'February 2025', 'January 2025', 'December 2024'];

  // Resolve department and subDepartment names by IDs
  const departmentName = employeeDetails?.employee?.departmentId
    ? departments.find((d) => d.id === employeeDetails.employee.departmentId)?.name || employeeDetails.employee.departmentId
    : 'N/A';

  const subDepartmentName = employeeDetails?.employee?.subDepartmentId
    ? subDepartments.find((sd) => sd.id === employeeDetails.employee.subDepartmentId)?.name || employeeDetails.employee.subDepartmentId
    : 'N/A';
  console.log('subDepartments:', subDepartments);
  console.log('Looking for subDepartmentId:', employeeDetails?.employee?.subDepartmentId);

  // Employee info with fallbacks
  const employeeName = employeeDetails?.user?.fullName || user?.fullName || 'N/A';
  const employeeNumber = employeeDetails?.employee?.employeeNumber || 'N/A';
  const designation = employeeDetails?.employee?.designation || 'N/A';
  const shift = employeeDetails?.employee?.shift || 'N/A';
  const hireDateRaw = employeeDetails?.employee?.hireDate;
  const hireDate = hireDateRaw ? new Date(hireDateRaw).toLocaleDateString() : 'N/A';
  const workLocation = employeeDetails?.employee?.workLocation || 'N/A';
  const bankAccount = '•••• •••• •••• 4232';

  // PDF generation (dynamic import of autoTable to avoid doc.autoTable issues)
  const generatePDF = async () => {
    try {
      // dynamic import ensures compatibility with different bundlers / versions
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = (autoTableModule as any).default || (autoTableModule as any);

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Payslip', 14, 22);

      // Employee Info
      doc.setFontSize(12);
      doc.text(`Employee: ${employeeName}`, 14, 32);
      doc.text(`Employee No: ${employeeNumber}`, 14, 38);
      doc.text(`Designation: ${designation}`, 14, 44);
      doc.text(`Department: ${departmentName}`, 14, 50);
      doc.text(`Sub Department: ${subDepartmentName}`, 14, 56);
      doc.text(`Shift: ${shift}`, 14, 62);
      doc.text(`Hire Date: ${hireDate}`, 14, 68);
      doc.text(`Work Location: ${workLocation}`, 14, 74);
      doc.text(`Bank Account: ${bankAccount}`, 14, 80);
      doc.text(`Salary Month: ${currentMonth || 'N/A'}`, 14, 88);

      // Earnings table
      const earningsRows = earnings.map((e) => [e.title, `$${e.amount.toLocaleString()}`]);
      autoTable(doc, {
        startY: 95,
        head: [['Earnings', 'Amount']],
        body: earningsRows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 245, 245] },
      });

      // get last Y (safe)
      let lastY = (doc as any).lastAutoTable?.finalY ?? 95 + earningsRows.length * 10 + 10;

      // Deductions table
      autoTable(doc, {
        startY: lastY + 8,
        head: [['Deductions', 'Amount']],
        body: [['Deductions', `-$${totalDeductions.toLocaleString()}`]],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 245, 245] },
      });

      lastY = (doc as any).lastAutoTable?.finalY ?? lastY + 40;

      // Net Salary
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text(`Net Salary: $${netSalary.toLocaleString()}`, 14, lastY + 20);

      // Filename - sanitize month
      const safeMonth = (currentMonth || new Date(salaryForMonth?.effectiveFrom || '').toLocaleString('default', { month: 'long', year: 'numeric' }) || 'latest').replace(/\s+/g, '_');
      doc.save(`Payslip_${employeeNumber}_${safeMonth}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Check console for details.');
    }
  };

  if (!salaryForMonth) {
    return <p className="text-center text-gray-500 p-6">No salary data found for selected month.</p>;
  }

  return (
    <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-lg border border-slate-100 dark:border-gray-700 overflow-hidden">
      {/* Header section */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl text-slate-800 dark:text-gray-200">Payslip Details</h2>
          </div>

          {/* Month selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMonthSelector(!showMonthSelector)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-400 dark:text-gray-400" />
              <span>{currentMonth}</span>
              {showMonthSelector ? (
                <ChevronUp className="h-4 w-4 text-slate-400 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-gray-400" />
              )}
            </button>

            {showMonthSelector && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-slate-200 dark:border-gray-600 py-1 z-10 max-h-56 overflow-y-auto">
                {availableMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => {
                      setCurrentMonth(month);
                      setShowMonthSelector(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors ${month === currentMonth ? 'bg-indigo-50 dark:bg-indigo-800 text-[#255199] dark:text-indigo-300' : 'text-slate-700 dark:text-gray-300'}`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employee information */}
        <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Employee</p>
              <p className="text-slate-800 dark:text-gray-200 font-medium">{employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Employee No</p>
              <p className="text-slate-800 dark:text-gray-200">{employeeNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Designation</p>
              <p className="text-slate-800 dark:text-gray-200">{designation} {user?.subRole?.name ? `- ${user.subRole.name}` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Department</p>
              <p className="text-slate-800 dark:text-gray-200">{departmentName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Sub Department</p>
              <p className="text-slate-800 dark:text-gray-200">{subDepartmentName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Shift</p>
              <p className="text-slate-800 dark:text-gray-200">{shift}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Hire Date</p>
              <p className="text-slate-800 dark:text-gray-200">{hireDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Work Location</p>
              <p className="text-slate-800 dark:text-gray-200">{workLocation}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Bank Account</p>
              <p className="text-slate-800 dark:text-gray-200">{bankAccount}</p>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-1 text-sm text-[#255199] dark:text-indigo-400 hover:text-[#2F66C1] dark:hover:text-indigo-300 font-medium transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-600 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => void generatePDF()}
              className="flex items-center space-x-1 bg-[#255199] px-3 py-1.5 rounded-lg text-sm text-white hover:bg-[#2F66C1] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Salary breakdown */}
      {showDetails && (
        <div className="p-6 pt-2 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Earnings section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Earnings</h3>
              <div className="space-y-3">
                {earnings.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 dark:border-gray-700">
                    <span className="text-slate-700 dark:text-gray-200">{item.title}</span>
                    <span className="font-medium text-slate-800 dark:text-gray-100">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 text-[#255199] dark:text-indigo-400 font-semibold">
                  <span>Total Earnings</span>
                  <span>${totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 dark:border-gray-700">
                  <span className="text-slate-700 dark:text-gray-200">Deductions</span>
                  <span className="font-medium text-slate-800 dark:text-gray-100">-${totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-rose-600 dark:text-rose-400 font-semibold">
                  <span>Total Deductions</span>
                  <span>-${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary section */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-lg font-semibold text-slate-800 dark:text-gray-100">Net Salary</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${netSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipDetails;
