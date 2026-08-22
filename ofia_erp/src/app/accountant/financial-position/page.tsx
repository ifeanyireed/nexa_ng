"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconCheck,
	IconTrendingUp
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

export default function FinancialPositionPage() {
	const router = useRouter();

	const [financials] = useState({
		assets: {
			cashBank: 299948500.00,
			receivables: 5000000.00,
			inventory: 0.00
		},
		liabilities: {
			payables: 150000000.00,
			accruals: 0.00
		},
		equity: {
			shareCapital: 199948500.00,
			retainedEarnings: -45000000.00
		}
	});

	const totalAssets = financials.assets.cashBank + financials.assets.receivables + financials.assets.inventory;
	const totalLiabilities = financials.liabilities.payables + financials.liabilities.accruals;
	const totalEquity = financials.equity.shareCapital + financials.equity.retainedEarnings;
	const totalLiabilitiesEquity = totalLiabilities + totalEquity;

	const formatNaira = (amount: number) => {
		const formatted = new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 2
		}).format(Math.abs(amount));
		return amount < 0 ? `-${formatted}` : formatted;
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Statement of Financial Position</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Balance Sheet · FY26 Current Standing Summary</p>
				</div>
				<button
					onClick={() => alert("Exporting Statement of Financial Position...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconDownload className="w-4 h-4 text-slate-455" />
					Export Position
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{REPORTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "financial-position"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Balance Check Banner */}
			{totalAssets === totalLiabilitiesEquity && (
				<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 text-xs font-semibold">
					<IconCheck className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
					<p>Accounting equation balances successfully! Total Assets matches Liabilities + Owner's Equity ({formatNaira(totalAssets)}).</p>
				</div>
			)}

			{/* Balance Sheet Grid Layout */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-left text-xs font-semibold">
				
				{/* Assets column */}
				<div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-3xl border border-gray-100">
					<h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2 uppercase tracking-wide">Assets</h3>
					
					<div className="space-y-3">
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Assets</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Cash and Cash Equivalents</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.assets.cashBank)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Accounts Receivable (Debtors)</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.assets.receivables)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Product Stocks & Inventory</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.assets.inventory)}</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t border-gray-200 pt-4 mt-auto text-slate-850 font-black text-sm">
						<span>Total Assets</span>
						<span className="text-blue-600">{formatNaira(totalAssets)}</span>
					</div>
				</div>

				{/* Liabilities & Equity column */}
				<div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-3xl border border-gray-100">
					<h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2 uppercase tracking-wide">Liabilities & Equity</h3>
					
					<div className="space-y-4">
						{/* Liabilities */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Liabilities</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Accounts Payable (Creditors)</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.liabilities.payables)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Operating Impresst Accruals</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.liabilities.accruals)}</span>
							</div>
							<div className="flex justify-between pt-1.5 font-bold text-slate-800">
								<span>Total Liabilities</span>
								<span>{formatNaira(totalLiabilities)}</span>
							</div>
						</div>

						{/* Equity */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner's Equity</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Share Capital Contributions</span>
								<span className="text-slate-850 font-bold">{formatNaira(financials.equity.shareCapital)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Retained Earnings Ledger</span>
								<span className={`font-bold ${financials.equity.retainedEarnings < 0 ? "text-red-500" : "text-slate-850"}`}>
									{formatNaira(financials.equity.retainedEarnings)}
								</span>
							</div>
							<div className="flex justify-between pt-1.5 font-bold text-slate-800">
								<span>Total Owner's Equity</span>
								<span>{formatNaira(totalEquity)}</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t border-gray-200 pt-4 mt-auto text-slate-850 font-black text-sm">
						<span>Total Liabilities & Equity</span>
						<span className="text-blue-600">{formatNaira(totalLiabilitiesEquity)}</span>
					</div>
				</div>

			</div>

		</div>
	);
}
