"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch
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

interface AgedPayableRow {
	vendor: string;
	totalDue: number;
	current: number;
	days1_30: number;
	days31_60: number;
	days61_90: number;
	days90_plus: number;
}

export default function AgedPayablesPage() {
	const router = useRouter();

	const [payables] = useState<AgedPayableRow[]>([
		{ vendor: "Dangote Cement PLC", totalDue: 1200000.00, current: 0, days1_30: 1200000.00, days31_60: 0, days61_90: 0, days90_plus: 0 },
		{ vendor: "Total Energies Nigeria", totalDue: 4500000.00, current: 4500000.00, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0 },
		{ vendor: "Julius Berger PLC", totalDue: 220000.00, current: 20000.00, days1_30: 200000.00, days31_60: 0, days61_90: 0, days90_plus: 0 }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filtered = payables.filter(p =>
		p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalDueSum = filtered.reduce((acc, curr) => acc + curr.totalDue, 0);
	const currentSum = filtered.reduce((acc, curr) => acc + curr.current, 0);
	const sum1_30 = filtered.reduce((acc, curr) => acc + curr.days1_30, 0);
	const sum31_60 = filtered.reduce((acc, curr) => acc + curr.days31_60, 0);
	const sum61_90 = filtered.reduce((acc, curr) => acc + curr.days61_90, 0);
	const sum90_plus = filtered.reduce((acc, curr) => acc + curr.days90_plus, 0);

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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Aged Payables</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Review aged vendor unpaid bills and upcoming payables liability books</p>
				</div>
				<button
					onClick={() => alert("Exporting aged payables summary...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconDownload className="w-4 h-4 text-slate-455" />
					Export Payables
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{REPORTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "aged-payables"
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
						placeholder="Search vendors..."
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
							<th className="pb-3 min-w-[200px]">Vendor</th>
							<th className="pb-3 min-w-[140px]">Total Due</th>
							<th className="pb-3 min-w-[120px]">Current</th>
							<th className="pb-3 min-w-[120px]">1-30 Days</th>
							<th className="pb-3 min-w-[120px]">31-60 Days</th>
							<th className="pb-3 min-w-[120px]">61-90 Days</th>
							<th className="pb-3 min-w-[120px]">90+ Days</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filtered.map((p, idx) => (
							<tr key={idx} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 text-slate-800 font-bold">{p.vendor}</td>
								<td className="py-4 text-slate-850 font-black">{formatNaira(p.totalDue)}</td>
								<td className="py-4 text-emerald-650">{formatNaira(p.current)}</td>
								<td className="py-4 text-slate-600">{formatNaira(p.days1_30)}</td>
								<td className="py-4 text-slate-600">{formatNaira(p.days31_60)}</td>
								<td className="py-4 text-slate-600">{formatNaira(p.days61_90)}</td>
								<td className="py-4 text-red-500">{formatNaira(p.days90_plus)}</td>
							</tr>
						))}
						{/* Summary Row */}
						<tr className="bg-slate-50/50 border-t border-b border-gray-200 font-extrabold text-slate-800 text-xs">
							<td className="py-4">Grand Total</td>
							<td className="py-4 text-slate-900 font-black">{formatNaira(totalDueSum)}</td>
							<td className="py-4 text-emerald-700">{formatNaira(currentSum)}</td>
							<td className="py-4 text-slate-700">{formatNaira(sum1_30)}</td>
							<td className="py-4 text-slate-700">{formatNaira(sum31_60)}</td>
							<td className="py-4 text-slate-700">{formatNaira(sum61_90)}</td>
							<td className="py-4 text-red-600">{formatNaira(sum90_plus)}</td>
						</tr>
					</tbody>
				</table>
			</div>

		</div>
	);
}
