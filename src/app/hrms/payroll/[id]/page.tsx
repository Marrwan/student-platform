'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PayslipPage({ params }: { params: { id: string } }) {
    const [payroll, setPayroll] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // @ts-ignore
                const data = await api.getPayrollDetails(params.id);
                setPayroll(data);
            } catch (error) {
                console.error("Failed to fetch payslip", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!payroll) return <div>Payslip not found</div>;

    // Helper to format currency
    const format = (val: any) => parseFloat(val || 0).toLocaleString();

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden my-8 border border-gray-200">
            <div className="bg-gray-50 p-8 border-b border-gray-200 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AFEX</h1>
                    <p className="text-xs text-gray-500 mt-2 max-w-xs">
                        11th Floor, Bank of Industry, Tower 2, House Plot 256, Zone A, Off Herbert Macaulay Way, Abuja
                    </p>
                </div>
                <div className="text-right">
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide">HR System Report</span>
                    <h2 className="text-lg font-bold text-gray-900 mt-4 uppercase">{payroll.month} {payroll.year} Payroll</h2>
                    <p className="text-sm text-gray-500">Date: {new Date(payroll.paymentDate).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="p-8">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Employee Name</p>
                        <p className="font-bold text-gray-900">{payroll.employee?.firstName} {payroll.employee?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Employee Email</p>
                        <p className="font-bold text-gray-900">{payroll.employee?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Job Title</p>
                        <p className="font-bold text-gray-900">{payroll.employee?.jobTitle || '---'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <p className="font-bold text-gray-900">{payroll.employee?.staffRole || '---'}</p>
                    </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-black">
                            <span className="font-bold text-sm">Earnings</span>
                            <span className="font-bold text-sm">Value (₦)</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Basic Salary</span>
                                <span className="font-medium text-gray-900">{format(payroll.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Housing</span>
                                <span className="font-medium text-gray-900">{format(payroll.housing)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Transport</span>
                                <span className="font-medium text-gray-900">{format(payroll.transport)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Bonus</span>
                                <span className="font-medium text-gray-900">{format(payroll.bonus)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Other Allowances</span>
                                <span className="font-medium text-gray-900">{format(payroll.allowances)}</span>
                            </div>

                            <div className="pt-4 border-t border-black flex justify-between items-center font-bold">
                                <span>Gross Pay</span>
                                <span>{format(payroll.grossPay)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-black">
                            <span className="font-bold text-sm">Deductions</span>
                            <span className="font-bold text-sm">Value (₦)</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium text-gray-900">{format(payroll.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Pension</span>
                                <span className="font-medium text-gray-900">{format(payroll.pensionEmployee)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Health Insurance</span>
                                <span className="font-medium text-gray-900">{format(payroll.healthInsurance)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Other Deductions</span>
                                <span className="font-medium text-gray-900">{format(payroll.otherDeductions)}</span>
                            </div>

                            <div className="pt-4 border-t border-black flex justify-between items-center font-bold">
                                <span>Total Deductions</span>
                                <span>{format(payroll.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Pay */}
                <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 gap-12">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm">Net Pay</span>
                        </div>
                        <div className="pt-2 border-t border-black">
                            <span className="font-bold text-xl">₦ {format(payroll.netPay)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-200">
                <button className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium">
                    Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                </button>
            </div>

            <div className="bg-red-600 text-white text-center py-1 text-xs font-bold">
                AFEX Nigeria. 2024
            </div>
        </div>
    );
}
