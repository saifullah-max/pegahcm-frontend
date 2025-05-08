import React, { useState } from 'react';
import { Calendar, PieChart, Download, Eye, Printer, ChevronDown, ChevronUp } from 'lucide-react';

const PayslipDetails: React.FC = () => {
  const [showDetails, setShowDetails] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('May 2025');
  
  // Sample payslip data - in a real app this would come from an API
  const payslipData = {
    month: currentMonth,
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'Engineering',
    designation: 'Software Engineer',
    bankAccount: '•••• •••• •••• 4232',
    earnings: [
      { title: 'Basic Salary', amount: 4500 },
      { title: 'Housing Allowance', amount: 800 },
      { title: 'Transport Allowance', amount: 300 },
      { title: 'Performance Bonus', amount: 500 }
    ],
    deductions: [
      { title: 'Income Tax', amount: 650 },
      { title: 'Health Insurance', amount: 200 },
      { title: 'Retirement Fund', amount: 450 }
    ],
    totalEarnings: 6100,
    totalDeductions: 1300,
    netSalary: 1000
  };

  // Previous months for the dropdown selector
  const availableMonths = [
    'May 2025',
    'April 2025',
    'March 2025',
    'February 2025',
    'January 2025',
    'December 2024'
  ];

  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setShowMonthSelector(false);
  };

  return (
    <div className="bg-gradient-to-tr from-slate-50 to-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      {/* Header section */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl  text-slate-800">Payslip Details</h2>
          </div>
          
          {/* Month selector dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowMonthSelector(!showMonthSelector)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{currentMonth}</span>
              {showMonthSelector ? 
                <ChevronUp className="h-4 w-4 text-slate-400" /> : 
                <ChevronDown className="h-4 w-4 text-slate-400" />
              }
            </button>
            
            {showMonthSelector && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                {availableMonths.map(month => (
                  <button 
                    key={month}
                    onClick={() => handleMonthChange(month)}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                      month === currentMonth ? 'bg-indigo-50 text-[#255199]' : 'text-slate-700'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Employee information */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Employee</p>
              <p className="text-slate-800 font-medium">{payslipData.employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Employee ID</p>
              <p className="text-slate-800">{payslipData.employeeId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Department</p>
              <p className="text-slate-800">{payslipData.department}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Bank Account</p>
              <p className="text-slate-800">{payslipData.bankAccount}</p>
            </div>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-1 text-sm text-[#255199] hover:text-[#2F66C1] font-medium transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button className="flex items-center space-x-1 bg-[#255199] px-3 py-1.5 rounded-lg text-sm text-white hover:bg-[#2F66C1] transition-colors">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Salary breakdown */}
      {showDetails && (
        <div className="p-6 pt-2 bg-white border-t border-slate-100">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Earnings section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Earnings</h3>
              <div className="space-y-3">
                {payslipData.earnings.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-700">{item.title}</span>
                    <span className="font-medium text-slate-800">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 text-[#255199] font-semibold">
                  <span>Total Earnings</span>
                  <span>${payslipData.totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Deductions section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Deductions</h3>
              <div className="space-y-3">
                {payslipData.deductions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                    <span className="text-slate-700">{item.title}</span>
                    <span className="font-medium text-slate-800">-${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 text-rose-600 font-semibold">
                  <span>Total Deductions</span>
                  <span>-${payslipData.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary section */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-emerald-500" />
                <span className="text-lg font-semibold text-slate-800">Net Salary</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600">${payslipData.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipDetails;