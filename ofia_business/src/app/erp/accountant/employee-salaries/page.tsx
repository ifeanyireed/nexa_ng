"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch,
	IconRefresh 
} from "@tabler/icons-react";

const PAYMENTS_TABS = [
	{ id: "payment-processing", label: "Payment Processing", slug: "/accountant/payment-processing" },
	{ id: "expenses", label: "Expenses", slug: "/accountant/expenses" },
	{ id: "payroll", label: "Payroll", slug: "/accountant/payment-payroll" },
	{ id: "payroll-processing", label: "Payroll Payment Processing", slug: "/accountant/payroll-payment-processing" },
	{ id: "statutory-remittances", label: "Statutory Remittances", slug: "/accountant/statutory-remittances" },
	{ id: "employee-salaries", label: "Employee Salaries", slug: "/accountant/employee-salaries" },
	{ id: "email-recipients", label: "Email Notification Recipients", slug: "/accountant/email-notification-recipients" }
];

interface SalaryConfig {
	code: string;
	name: string;
	designation: string;
	department: string;
	gross: number;
	deductions: number;
	net: number;
	status: string;
}

export default function EmployeeSalariesPage() {
	const router = useRouter();

	const [salaries] = useState<SalaryConfig[]>([
		{ code: "EMP-001", name: "Oluwatobiloba Olateju", designation: "Chief Financial Officer", department: "Finance", gross: 1800000.00, deductions: 220000.00, net: 1580000.00, status: "Active" },
		{ code: "EMP-002", name: "Queen Okonkwo", designation: "Finance Lead", department: "Finance", gross: 1200000.00, deductions: 140000.00, net: 1060000.00, status: "Active" },
		{ code: "EMP-003", name: "Ifeanyi Ibeh", designation: "Managing Director", department: "Management", gross: 2500000.00, deductions: 350000.00, net: 2150000.00, status: "Active" },
		{ code: "EMP-004", name: "Chinedu Okafor", designation: "Fleet Operations Specialist", department: "Operations", gross: 850000.00, deductions: 95000.00, net: 755000.00, status: "Active" }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filtered = salaries.filter(s =>
		s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
		s.department.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const formatNaira = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 2
		}).format(amount);
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Employee Salaries</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Manage corporate pay scales, regular base wages, and fixed benefits</p>
				</div>
				<button
					onClick={() => alert("Re-sync base contract payslips...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconRefresh className="w-4 h-4 text-slate-440" />
					Sync HR Contracts
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "employee-salaries"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Search */}
			<div className="flex justify-end">
				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search contracts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
				</div>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Employee Code</th>
							<th className="pb-3 min-w-[200px]">Employee Name</th>
							<th className="pb-3 min-w-[180px]">Designation</th>
							<th className="pb-3 min-w-[120px]">Department</th>
							<th className="pb-3 min-w-[140px]">Monthly Gross</th>
							<th className="pb-3 min-w-[140px]">Deductions</th>
							<th className="pb-3 min-w-[140px]">Net Salary Scale</th>
							<th className="pb-3 text-right w-24">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filtered.map((s) => (
							<tr key={s.code} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 font-mono font-bold text-slate-550">{s.code}</td>
								<td className="py-4 text-slate-800 font-bold">{s.name}</td>
								<td className="py-4 text-slate-600">{s.designation}</td>
								<td className="py-4 text-slate-550">{s.department}</td>
								<td className="py-4 text-slate-650">{formatNaira(s.gross)}</td>
								<td className="py-4 text-red-500 font-bold">{formatNaira(s.deductions)}</td>
								<td className="py-4 text-slate-850 font-black">{formatNaira(s.net)}</td>
								<td className="py-4 text-right">
									<span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
										{s.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</div>
	);
}
