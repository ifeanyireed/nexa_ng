"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "../FinanceContext";
import { 
	IconPlus, 
	IconSearch,
	IconRefresh,
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

export default function AccountantExpenses() {
	const router = useRouter();
	const {
		stats,
		expenses,
		formatNaira,
		setShowExpenseModal,
		handleUpdateExpenseStatus
	} = useFinance();

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Imprests & Expenses</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Awaiting Settlement: {formatNaira(stats.pendingPayables)}</p>
				</div>
				<button
					onClick={() => setShowExpenseModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Request Imprest
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "expenses"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[200px]">Expense Item</th>
							<th className="pb-3 min-w-[130px]">Category</th>
							<th className="pb-3 min-w-[130px]">Amount</th>
							<th className="pb-3 min-w-[150px]">Requested By</th>
							<th className="pb-3 min-w-[120px]">Status</th>
							<th className="pb-3 text-right w-36">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{expenses.map((exp) => (
							<tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4">
									<p className="font-bold text-slate-800 text-xs">{exp.title}</p>
									<p className="text-[10px] text-slate-450 mt-0.5">{exp.description || "No description provided"}</p>
								</td>
								<td className="py-4 text-slate-650">{exp.category}</td>
								<td className="py-4 text-slate-800 font-bold">{formatNaira(exp.amount)}</td>
								<td className="py-4 text-slate-550">{exp.requestedBy}</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
										exp.status === "Disbursed" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
										exp.status === "Approved" ? "bg-blue-50 border-blue-100 text-blue-700" :
										exp.status === "Rejected" ? "bg-red-50 border-red-100 text-red-700" :
										"bg-amber-50 border-amber-100 text-amber-700"
									}`}>
										{exp.status}
									</span>
								</td>
								<td className="py-4 text-right flex gap-1 justify-end">
									{exp.status === "Pending" && (
										<>
											<button
												onClick={() => handleUpdateExpenseStatus(exp.id, "Approved")}
												className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[9px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
											>
												Approve
											</button>
											<button
												onClick={() => handleUpdateExpenseStatus(exp.id, "Rejected")}
												className="px-2.5 py-1.5 bg-red-105 hover:bg-red-200 text-red-600 font-extrabold rounded-xl text-[9px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
											>
												Reject
											</button>
										</>
									)}
									{exp.status === "Approved" && (
										<button
											onClick={() => handleUpdateExpenseStatus(exp.id, "Disbursed")}
											className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
										>
											Disburse Cash
										</button>
									)}
									{exp.status === "Disbursed" && (
										<span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
											<IconCheck className="w-3.5 h-3.5 stroke-[3]" />
											Disbursed
										</span>
									)}
									{exp.status === "Rejected" && (
										<span className="text-[10px] text-red-500 font-bold">Declined</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</div>
	);
}
