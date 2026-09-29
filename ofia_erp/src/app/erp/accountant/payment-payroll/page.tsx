"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconSearch,
	IconLock,
	IconArrowRight,
	IconCheck
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

interface PayrollRun {
	id: string;
	period: string;
	lockedPayslips: number;
	totalGross: number;
	totalNet: number;
	status: string;
}

export default function PaymentPayrollPage() {
	const router = useRouter();

	const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([
		{ id: "PR-2026-07", period: "July 2026", lockedPayslips: 14, totalGross: 12500000.00, totalNet: 10800000.00, status: "Locked" },
		{ id: "PR-2026-06", period: "June 2026", lockedPayslips: 14, totalGross: 12500000.00, totalNet: 10800000.00, status: "Paid" }
	]);

	const [showAddModal, setShowAddModal] = useState(false);
	const [newPeriod, setNewPeriod] = useState("August 2026");

	const handleAddPayroll = (e: React.FormEvent) => {
		e.preventDefault();
		const padNum = String(payrollHistory.length + 1).padStart(2, "0");
		const run: PayrollRun = {
			id: `PR-2026-${padNum}`,
			period: newPeriod,
			lockedPayslips: 14,
			totalGross: 12500000.00,
			totalNet: 10800000.00,
			status: "Draft"
		};
		setPayrollHistory(prev => [run, ...prev]);
		setShowAddModal(false);
	};

	const handleSendToProcessing = (id: string) => {
		if (confirm(`Send payroll batch ${id} to Payment Processing?`)) {
			// update state locally
			setPayrollHistory(prev => prev.map(p => p.id === id ? { ...p, status: "Sent to Payout" } : p));
			alert("Batch details exported to Payroll Payment Processing queue!");
			router.push("/accountant/payroll-payment-processing");
		}
	};

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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Monthly Payroll Runs</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Review gross employee earnings, calculate deductions, and generate payslips</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Run Monthly Payroll
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "payroll"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Info Warning */}
			<div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 text-xs font-semibold text-left">
				<IconLock className="w-5 h-5 text-amber-600 shrink-0" />
				<div>
					<p className="font-extrabold text-amber-900">Payslip Lock Policy</p>
					<p className="mt-0.5 font-medium text-slate-650">Finalizing payroll generates locked status records. Only Locked batch files can be migrated to Payment Processing runs.</p>
				</div>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60 mt-2">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Period ID</th>
							<th className="pb-3 min-w-[180px]">Payroll Period</th>
							<th className="pb-3 min-w-[150px]">Locked Payslips</th>
							<th className="pb-3 min-w-[150px]">Total Gross Salary</th>
							<th className="pb-3 min-w-[150px]">Total Net Salary</th>
							<th className="pb-3 min-w-[150px]">Status</th>
							<th className="pb-3 text-right w-44">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{payrollHistory.map((run) => (
							<tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 font-mono font-bold text-slate-800">{run.id}</td>
								<td className="py-4 text-slate-800 font-bold">{run.period}</td>
								<td className="py-4 text-slate-600">{run.lockedPayslips} Payslips</td>
								<td className="py-4 text-slate-650">{formatNaira(run.totalGross)}</td>
								<td className="py-4 text-slate-800 font-black">{formatNaira(run.totalNet)}</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
										run.status === "Paid" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
										run.status === "Locked" ? "bg-red-50 border-red-100 text-red-700 animate-pulse" :
										run.status.includes("Sent") ? "bg-blue-50 border-blue-100 text-blue-700" :
										"bg-slate-55/10 border-slate-200 text-slate-700"
									}`}>
										{run.status}
									</span>
								</td>
								<td className="py-4 text-right">
									{run.status === "Locked" ? (
										<button
											onClick={() => handleSendToProcessing(run.id)}
											className="px-3 py-1.5 bg-red-500 hover:bg-red-650 text-white font-extrabold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border-none outline-none shadow-sm ml-auto active:scale-95"
										>
											Send Selected To Payout
											<IconArrowRight className="w-3.5 h-3.5" />
										</button>
									) : run.status === "Sent to Payout" ? (
										<span className="text-[10px] text-blue-600 font-bold flex items-center justify-end gap-1">
											Queued for Payout
										</span>
									) : (
										<span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
											<IconCheck className="w-3.5 h-3.5 stroke-[3]" />
											Paid
										</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* GENERATE RUN MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Run Monthly Payroll</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Initiate gross salary audit for active employees</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddPayroll} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Payroll Period</label>
								<select
									value={newPeriod}
									onChange={(e) => setNewPeriod(e.target.value)}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="August 2026">August 2026</option>
									<option value="September 2026">September 2026</option>
									<option value="October 2026">October 2026</option>
								</select>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Generate Payroll Run
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
