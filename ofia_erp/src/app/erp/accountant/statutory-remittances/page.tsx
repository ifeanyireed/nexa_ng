"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconSearch,
	IconTrash,
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

interface RemittanceRecord {
	id: string;
	agency: string;
	type: string;
	period: string;
	amount: number;
	filedOn: string;
	status: string;
}

export default function StatutoryRemittancesPage() {
	const router = useRouter();

	const [records, setRecords] = useState<RemittanceRecord[]>([
		{ id: "REM-001", agency: "Federal Inland Revenue Service (FIRS)", type: "PAYE Tax", period: "July 2026", amount: 1250000.00, filedOn: "15-07-2026", status: "Settled" },
		{ id: "REM-002", agency: "Lagos State Internal Revenue (LIRS)", type: "PAYE Tax", period: "July 2026", amount: 450000.00, filedOn: "15-07-2026", status: "Settled" },
		{ id: "REM-003", agency: "TrustFund Pension managers", type: "Pension Fund (8% + 10%)", period: "July 2026", amount: 850000.00, filedOn: "--", status: "Awaiting Release" }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	const [newRecord, setNewRecord] = useState({
		agency: "Federal Inland Revenue Service (FIRS)",
		type: "PAYE Tax",
		period: "July 2026",
		amount: ""
	});

	const filteredRecords = records.filter(r =>
		r.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
		r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
		r.id.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddRemittance = (e: React.FormEvent) => {
		e.preventDefault();
		const amountVal = parseFloat(newRecord.amount);
		if (isNaN(amountVal) || amountVal <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		const padNum = String(records.length + 1).padStart(3, "0");
		const r: RemittanceRecord = {
			id: `REM-${padNum}`,
			agency: newRecord.agency,
			type: newRecord.type,
			period: newRecord.period,
			amount: amountVal,
			filedOn: "--",
			status: "Awaiting Release"
		};

		setRecords(prev => [r, ...prev]);
		setShowAddModal(false);
		setNewRecord({
			agency: "Federal Inland Revenue Service (FIRS)",
			type: "PAYE Tax",
			period: "July 2026",
			amount: ""
		});
	};

	const handleSettle = (id: string) => {
		if (confirm(`Mark remittance ${id} as settled?`)) {
			setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Settled", filedOn: new Date().toLocaleDateString("en-GB").replace(/\//g, "-") } : r));
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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Statutory Remittances</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">File and track statutory PAYE tax, pension funds, and industrial insurance remittances</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Record Remittance
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "statutory-remittances"
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
						placeholder="Search agencies..."
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
							<th className="pb-3 min-w-[120px]">Remittance ID</th>
							<th className="pb-3 min-w-[220px]">Agency / Fund</th>
							<th className="pb-3 min-w-[150px]">Type</th>
							<th className="pb-3 min-w-[110px]">Period</th>
							<th className="pb-3 min-w-[140px]">Amount</th>
							<th className="pb-3 min-w-[110px]">Filed On</th>
							<th className="pb-3 min-w-[130px]">Status</th>
							<th className="pb-3 text-right w-24">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filteredRecords.map((r) => (
							<tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 font-mono font-bold text-slate-805">{r.id}</td>
								<td className="py-4 text-slate-800 font-bold">{r.agency}</td>
								<td className="py-4 text-slate-600">{r.type}</td>
								<td className="py-4 text-slate-550">{r.period}</td>
								<td className="py-4 text-slate-805 font-bold">{formatNaira(r.amount)}</td>
								<td className="py-4 text-slate-550">{r.filedOn}</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
										r.status === "Settled"
											? "bg-emerald-50 border-emerald-100 text-emerald-700"
											: "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
									}`}>
										{r.status}
									</span>
								</td>
								<td className="py-4 text-right">
									{r.status !== "Settled" ? (
										<button
											onClick={() => handleSettle(r.id)}
											className="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
										>
											Settle
										</button>
									) : (
										<span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
											<IconCheck className="w-3.5 h-3.5 stroke-[3]" />
											Settled
										</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* RECORD REMITTANCE MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Record Statutory Remittance</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Post a new tax or pension agency filing log</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddRemittance} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Agency / Fund</label>
								<select
									value={newRecord.agency}
									onChange={(e) => setNewRecord(prev => ({ ...prev, agency: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="Federal Inland Revenue Service (FIRS)">Federal Inland Revenue Service (FIRS)</option>
									<option value="Lagos State Internal Revenue (LIRS)">Lagos State Internal Revenue (LIRS)</option>
									<option value="TrustFund Pension managers">TrustFund Pension managers</option>
									<option value="NSITF (Social Insurance Fund)">NSITF (Social Insurance Fund)</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Remittance Type</label>
									<select
										value={newRecord.type}
										onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="PAYE Tax">PAYE Tax</option>
										<option value="Pension Fund">Pension Fund</option>
										<option value="Social Insurance">Social Insurance</option>
									</select>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Period</label>
									<select
										value={newRecord.period}
										onChange={(e) => setNewRecord(prev => ({ ...prev, period: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 font-bold"
									>
										<option value="July 2026">July 2026</option>
										<option value="August 2026">August 2026</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 500000"
									value={newRecord.amount}
									onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Record Payout Run
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
