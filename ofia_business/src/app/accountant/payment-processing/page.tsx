"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch,
	IconWallet,
	IconCheck,
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

interface PendingPayout {
	id: string;
	vendorName: string;
	amount: number;
	dueDate: string;
	mappedBank: string;
	status: string;
}

export default function PaymentProcessingPage() {
	const router = useRouter();

	const [payouts, setPayouts] = useState<PendingPayout[]>([
		{ id: "BILL-009", vendorName: "Dangote Cement PLC", amount: 1200000.00, dueDate: "25-07-2026", mappedBank: "1030 - Providus Bank", status: "Awaiting CFO Approval" },
		{ id: "BILL-008", vendorName: "Total Energies Nigeria", amount: 4500000.00, dueDate: "28-07-2026", mappedBank: "1050 - Globus Bank", status: "Pending Release" },
		{ id: "BILL-007", vendorName: "Julius Berger PLC", amount: 220000.00, dueDate: "30-07-2026", mappedBank: "1030 - Providus Bank", status: "Pending Release" }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filteredPayouts = payouts.filter(p =>
		p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.id.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleProcessRelease = (id: string) => {
		if (confirm(`Approve and disburse funds for ${id}?`)) {
			setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "Complete (Paid)" } : p));
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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Payment Processing</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Review accounts payable disbursements and run bank payouts</p>
				</div>
				<button
					onClick={() => alert("Re-sync pending billing payables...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconRefresh className="w-4 h-4 text-slate-440" />
					Sync Bills
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "payment-processing"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<span className="text-[10px] font-bold text-slate-400 uppercase">Unpaid Accounts Payable</span>
					<p className="text-xl font-black text-slate-850 mt-1">{formatNaira(5920000.00)}</p>
					<p className="text-[10px] text-slate-455 mt-1 font-semibold">Overdue and pending vendor invoices</p>
				</div>
				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<span className="text-[10px] font-bold text-slate-400 uppercase">Pending Release Approval</span>
					<p className="text-xl font-black text-amber-600 mt-1">{formatNaira(4720000.00)}</p>
					<p className="text-[10px] text-slate-455 mt-1 font-semibold">Payout runs queued for CFO signature</p>
				</div>
				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<span className="text-[10px] font-bold text-slate-400 uppercase">Providus Wallet Balance</span>
					<p className="text-xl font-black text-emerald-650 mt-1">{formatNaira(99948500.00)}</p>
					<p className="text-[10px] text-slate-455 mt-1 font-semibold">Available cash reserves for payout</p>
				</div>
			</div>

			{/* Search */}
			<div className="flex justify-end mt-2">
				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search payouts..."
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
							<th className="pb-3 min-w-[120px]">Bill ID</th>
							<th className="pb-3 min-w-[200px]">Vendor Name</th>
							<th className="pb-3 min-w-[140px]">Amount</th>
							<th className="pb-3 min-w-[110px]">Due Date</th>
							<th className="pb-3 min-w-[180px]">Mapped Bank</th>
							<th className="pb-3 min-w-[150px]">Status</th>
							<th className="pb-3 text-right w-24">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filteredPayouts.map((p) => (
							<tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 font-mono font-bold text-slate-800">{p.id}</td>
								<td className="py-4 text-slate-800 font-bold">{p.vendorName}</td>
								<td className="py-4 text-slate-800">{formatNaira(p.amount)}</td>
								<td className="py-4 text-slate-550">{p.dueDate}</td>
								<td className="py-4 text-slate-600 font-mono">{p.mappedBank}</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
										p.status.startsWith("Complete")
											? "bg-emerald-50 border-emerald-100 text-emerald-700"
											: p.status.includes("Approval")
											? "bg-amber-50 border-amber-100 text-amber-700"
											: "bg-blue-50 border-blue-100 text-blue-700"
									}`}>
										{p.status}
									</span>
								</td>
								<td className="py-4 text-right">
									{!p.status.startsWith("Complete") ? (
										<button
											onClick={() => handleProcessRelease(p.id)}
											className="px-3 py-1.5 bg-red-500 hover:bg-red-650 text-white font-extrabold rounded-xl text-[10px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
										>
											Release
										</button>
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

		</div>
	);
}
