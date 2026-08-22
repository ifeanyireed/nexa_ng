"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch,
	IconCheck 
} from "@tabler/icons-react";

const REPORTS_TABS = [
	{ id: "finance-reports", label: "Finance Reports", slug: "/accountant/finance-reports" },
	{ id: "ledger-summary", label: "Ledger Summary", slug: "/accountant/ledger-summary" },
	{ id: "trial-balance", label: "Trial Balance", slug: "/accountant/trial-balance" },
	{ id: "income-statement", label: "Income Statement", slug: "/accountant/income-statement" },
	{ id: "financial-position", label: "Financial Position", slug: "/accountant/financial-position" },
	{ id: "aged-receivables", label: "Aged Receivables", slug: "/accountant/aged-receivables" },
	{ id: "aged-payables", label: "Aged Payables", slug: "/accountant/aged-payables" }
];

interface TrialBalanceRow {
	code: string;
	name: string;
	debit: number;
	credit: number;
}

export default function TrialBalancePage() {
	const router = useRouter();

	const [balances] = useState<TrialBalanceRow[]>([
		{ code: "1000", name: "Cash and Bank", debit: 99948500.00, credit: 0 },
		{ code: "1010", name: "GT Bank", debit: 100000000.00, credit: 0 },
		{ code: "1050", name: "Globus Bank", debit: 100000000.00, credit: 0 },
		{ code: "2000", name: "Accounts Payable", debit: 0, credit: 150000000.00 },
		{ code: "3000", name: "Share Capital Equity", debit: 0, credit: 199948500.00 },
		{ code: "5000", name: "Operating Expenses", debit: 150000000.00, credit: 0 }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filteredBalances = balances.filter(b =>
		b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		b.code.includes(searchQuery)
	);

	const totalDebit = filteredBalances.reduce((acc, curr) => acc + curr.debit, 0);
	const totalCredit = filteredBalances.reduce((acc, curr) => acc + curr.credit, 0);

	const formatNaira = (amount: number) => {
		if (amount === 0) return "--";
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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Trial Balance</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Audit ending balances for all double-entry cash and capital ledger accounts</p>
				</div>
				<button
					onClick={() => alert("Exporting trial balance report...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconDownload className="w-4 h-4 text-slate-455" />
					Export Sheet
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{REPORTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "trial-balance"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Status Banner */}
			{totalDebit === totalCredit && totalDebit > 0 && (
				<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 text-xs font-semibold">
					<IconCheck className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
					<p>Trial Balance balances successfully! Total Debits match Total Credits.</p>
				</div>
			)}

			{/* Search */}
			<div className="flex justify-end">
				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search trial balance..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[100px]">Account Code</th>
							<th className="pb-3 min-w-[220px]">Account Name</th>
							<th className="pb-3 min-w-[150px]">Debit Balance</th>
							<th className="pb-3 min-w-[150px]">Credit Balance</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filteredBalances.map((b) => (
							<tr key={b.code} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 font-mono font-bold text-slate-550">{b.code}</td>
								<td className="py-4 text-slate-800 font-bold">{b.name}</td>
								<td className="py-4 text-emerald-650 font-bold">{formatNaira(b.debit)}</td>
								<td className="py-4 text-red-500 font-bold">{formatNaira(b.credit)}</td>
							</tr>
						))}
						{/* Totals Row */}
						<tr className="bg-slate-50/50 border-t border-b border-gray-200 font-extrabold text-slate-800 text-sm">
							<td className="py-4" colSpan={2}>Grand Total</td>
							<td className="py-4 text-emerald-700">{formatNaira(totalDebit)}</td>
							<td className="py-4 text-red-700">{formatNaira(totalCredit)}</td>
						</tr>
					</tbody>
				</table>
			</div>

		</div>
	);
}
