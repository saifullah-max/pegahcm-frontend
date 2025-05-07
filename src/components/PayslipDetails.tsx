import React from 'react';

const PayslipDetails: React.FC = () => {
  const payslipData = {
    month: 'May 2025',
    basicSalary: 800,
    allowances: 200,
    deductions: 100,
    netSalary: 900,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Payslip Details</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Month:</span> {payslipData.month}</p>
        <p><span className="font-medium">Basic Salary:</span> ${payslipData.basicSalary}</p>
        <p><span className="font-medium">Allowances:</span> ${payslipData.allowances}</p>
        <p><span className="font-medium">Deductions:</span> ${payslipData.deductions}</p>
        <p className="text-lg font-semibold mt-4">
          Net Salary: ${payslipData.netSalary}
        </p>
      </div>
    </div>
  );
};

export default PayslipDetails;