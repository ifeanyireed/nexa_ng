"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconCheck,
	IconTrendingUp,
	IconReportMoney
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

export default function IncomeStatementPage() {
	const router = useRouter();

	const [incomeStatement] = useState({
		revenue: {
			haulageRevenue: 125000000.00,
			otherRevenue: 0.00
		},
		costOfSales: {
			fuelDirectCost: 22500000.00,
			driverAllowances: 10800000.00,
			loadingCharges: 0.00
		},
		operatingExpenses: {
			fleetRepairMaintenance: 5270000.00,
			salariesWages: 12400000.00,
			depreciationTrucks: 8500000.00,
			adminOfficeExpenses: 2200000.00,
			financeCharges: 85000.00
		},
		tax: {
			incomeTax: 18973500.00
		}
	});

	const totalRevenue = incomeStatement.revenue.haulageRevenue + incomeStatement.revenue.otherRevenue;
	const totalCostOfSales = incomeStatement.costOfSales.fuelDirectCost + incomeStatement.costOfSales.driverAllowances + incomeStatement.costOfSales.loadingCharges;
	const grossProfit = totalRevenue - totalCostOfSales;
	
	const totalOperatingExpenses = incomeStatement.operatingExpenses.fleetRepairMaintenance + 
		incomeStatement.operatingExpenses.salariesWages + 
		incomeStatement.operatingExpenses.depreciationTrucks + 
		incomeStatement.operatingExpenses.adminOfficeExpenses + 
		incomeStatement.operatingExpenses.financeCharges;

	const operatingProfit = grossProfit - totalOperatingExpenses;
	const netIncome = operatingProfit - incomeStatement.tax.incomeTax;

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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Income Statement</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Profit & Loss · Statement of Financial Performance for FY26</p>
				</div>
				<button
					onClick={() => alert("Exporting Income Statement...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none self-start sm:self-center"
				>
					<IconDownload className="w-4 h-4 text-slate-455" />
					Export Report
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{REPORTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "income-statement"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Financial Summary Banner */}
			{netIncome > 0 && (
				<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 text-xs font-semibold">
					<IconTrendingUp className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
					<p>Company operating with positive net margins! Net Income for current period is {formatNaira(netIncome)}.</p>
				</div>
			)}

			{/* Income Statement Card Layout (Matches Balance Sheet) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-left text-xs font-semibold">
				
				{/* Revenues & Costs Card */}
				<div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-3xl border border-gray-100">
					<h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2 uppercase tracking-wide">Trading Revenue & Direct Costs</h3>
					
					<div className="space-y-4">
						{/* Revenue */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Revenue Streams</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Haulage & Freight Revenue</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.revenue.haulageRevenue)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Other Operating Revenue</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.revenue.otherRevenue)}</span>
							</div>
							<div className="flex justify-between pt-1.5 font-bold text-slate-800">
								<span>Total Revenue</span>
								<span>{formatNaira(totalRevenue)}</span>
							</div>
						</div>

						{/* Cost of Sales */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Direct Costs (Cost of Sales)</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Haulage & Fuel Direct Expenses</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.costOfSales.fuelDirectCost)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Driver Allowances & Logistics Costs</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.costOfSales.driverAllowances)}</span>
							</div>
							<div className="flex justify-between pt-1.5 font-bold text-slate-800">
								<span>Total Cost of Sales</span>
								<span>{formatNaira(totalCostOfSales)}</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t border-gray-200 pt-4 mt-auto text-slate-850 font-black text-sm">
						<span>Gross Profit</span>
						<span className="text-blue-600">{formatNaira(grossProfit)}</span>
					</div>
				</div>

				{/* Expenses & Earnings Card */}
				<div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-3xl border border-gray-100">
					<h3 className="text-sm font-black text-slate-800 border-b border-gray-200 pb-2 uppercase tracking-wide">Operating Overhead & Earnings</h3>
					
					<div className="space-y-4">
						{/* Operating Expenses */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Operating Overhead</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Fleet Repair & Maintenance</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.operatingExpenses.fleetRepairMaintenance)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Salaries and Wages</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.operatingExpenses.salariesWages)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Depreciation of Trucks & Assets</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.operatingExpenses.depreciationTrucks)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Administrative & Office Expenses</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.operatingExpenses.adminOfficeExpenses)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Finance Charges & Bank Fees</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.operatingExpenses.financeCharges)}</span>
							</div>
							<div className="flex justify-between pt-1.5 font-bold text-slate-800">
								<span>Total Operating Expenses</span>
								<span>{formatNaira(totalOperatingExpenses)}</span>
							</div>
						</div>

						{/* Earnings & Tax */}
						<div>
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Earnings & Taxation</h4>
							<div className="flex justify-between border-b border-gray-50 pb-1.5">
								<span className="text-slate-700">Operating Profit (EBIT)</span>
								<span className="text-slate-850 font-bold">{formatNaira(operatingProfit)}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-1.5 mt-1.5">
								<span className="text-slate-700">Company Income Tax (30%)</span>
								<span className="text-slate-850 font-bold">{formatNaira(incomeStatement.tax.incomeTax)}</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t border-gray-200 pt-4 mt-auto text-slate-850 font-black text-sm">
						<span>Net Income (Net Profit)</span>
						<span className="text-emerald-600">{formatNaira(netIncome)}</span>
					</div>
				</div>

			</div>

		</div>
	);
}
