"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch,
	IconFilter 
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

interface LedgerSummaryRow {
	code: string;
	name: string;
	category: string;
	opening: number;
	debits: number;
	credits: number;
	closing: number;
}

export default function LedgerSummaryPage() {
	const router = useRouter();

	const [ledgers] = useState<LedgerSummaryRow[]>([
		{ code: "1000", name: "Cash and Bank", category: "Asset", opening: 104000000.00, debits: 5000000.00, credits: 9051500.00, closing: 99948500.00 },
		{ code: "1010", name: "GT Bank", category: "Asset", opening: 100000000.00, debits: 0, credits: 0, closing: 100000000.00 },
		{ code: "1050", name: "Globus Bank", category: "Asset", opening: 100000000.00, debits: 0, credits: 0, closing: 100000000.00 },
		{ code: "2000", name: "Accounts Payable", category: "Liability", opening: 0, debits: 0, credits: 0, closing: 0 },
		{ code: "5000", name: "Operating Expenses", category: "Expense", opening: 0, debits: 51739649.75, credits: 0, closing: 51739649.75 }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filteredLedgers = ledgers.filter(l =>
		l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		l.code.includes(searchQuery)
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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Ledger Summary</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Review aggregated balance totals and net movements for general ledger codes</p>
				</div>
				<button
					onClick={() => alert("Exporting ledger summary...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconDownload className="w-4 h-4 text-slate-455" />
					Export Ledger
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{REPORTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "ledger-summary"
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
						placeholder="Search accounts..."
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
							<th className="pb-3 min-w-[80px]">Code</th>
							<th className="pb-3 min-w-[200px]">Account Name</th>
							<th className="pb-3 min-w-[110px]">Category</th>
							<th className="pb-3 min-w-[150px]">Opening Balance</th>
							<th className="pb-3 min-w-[150px]">Debits</th>
							<th className="pb-3 min-w-[150px]">Credits</th>
							<th className="pb-3 min-w-[150px]">Net Change</th>
							<th className="pb-3 min-w-[150px]">Closing Balance</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs">
						{filteredLedgers.map((l) => {
							const netChange = l.debits - l.credits;
							return (
								<tr key={l.code} className="hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
									<td className="py-4 font-mono font-bold text-slate-550">{l.code}</td>
									<td className="py-4 text-slate-800 font-bold">{l.name}</td>
									<td className="py-4">
										<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
											l.category === "Asset" ? "bg-blue-50 border-blue-100 text-blue-700" :
											l.category === "Expense" ? "bg-amber-50 border-amber-100 text-amber-700" :
											"bg-slate-55/10 border-slate-200 text-slate-700"
										}`}>
											{l.category}
										</span>
									</td>
									<td className="py-4 text-slate-800">{formatNaira(l.opening)}</td>
									<td className="py-4 text-emerald-650 font-bold">{formatNaira(l.debits)}</td>
									<td className="py-4 text-red-500 font-bold">{formatNaira(l.credits)}</td>
									<td className={`py-4 font-bold ${netChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
										{formatNaira(netChange)}
									</td>
									<td className="py-4 text-slate-850 font-black">{formatNaira(l.closing)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

		</div>
	);
}
