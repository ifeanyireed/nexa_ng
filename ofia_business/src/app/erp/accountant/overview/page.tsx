"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "../FinanceContext";
import {
	IconClipboardList,
	IconCalendarClock,
	IconReceipt,
	IconReportMoney,
	IconChevronRight
} from "@tabler/icons-react";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { Building2, CreditCard, PieChart, TrendingUp, DollarSign } from "lucide-react";

export default function AccountantOverview() {
	const router = useRouter();
	const {
		stats,
		expenses,
		invoices,
		reconciliations,
		transactions,
		formatNaira,
		formatNairaShort,
		chartOfAccounts
	} = useFinance();

	const totalAssets = stats.totalRevenue - stats.totalExpenses + 12000000;
	const totalLiabilities = stats.pendingPayables + 50000;
	const equity = totalAssets - totalLiabilities;
	const netPosition = stats.totalRevenue - stats.totalExpenses;

	return (
		<div className="flex flex-col gap-6 animate-fadeIn">
			{/* Balance Sheet KPI cards */}
			<ErpStatGrid
				stats={[
					{ label: "Assets", value: formatNairaShort(totalAssets), change: totalAssets >= 0 ? "Solvent" : "Deficit", changeType: totalAssets >= 0 ? "success" : "danger", sub: "Cash & Current Receivables", icon: <Building2 className="w-5 h-5 text-blue-500" />, iconBg: "bg-blue-500/10 text-blue-500" },
					{ label: "Liabilities", value: formatNairaShort(totalLiabilities), change: "Obligations", changeType: "warning", sub: "Payables & short-term debt", icon: <CreditCard className="w-5 h-5 text-rose-500" />, iconBg: "bg-rose-500/10 text-rose-500" },
					{ label: "Total Equity", value: formatNairaShort(equity), change: equity >= 0 ? "Healthy" : "Negative", changeType: equity >= 0 ? "success" : "danger", sub: "Shareholder retained capital", icon: <PieChart className="w-5 h-5 text-purple-500" />, iconBg: "bg-purple-500/10 text-purple-500" },
					{ label: "Net Position", value: formatNairaShort(netPosition), change: netPosition >= 0 ? "+Profitable" : "-Loss", changeType: netPosition >= 0 ? "success" : "danger", sub: "Operating income margin", icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, iconBg: "bg-emerald-500/10 text-emerald-500" },
				]}
			/>

			{/* Grid: Financial Health & Shortcut links */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				
				{/* Financial Health Indicators (8cols) */}
				<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-8 flex flex-col gap-5">
					<div className="flex justify-between items-center pb-3 border-b border-gray-100">
						<div>
							<h3 className="font-extrabold text-slate-800 text-sm">Financial Health Indicators</h3>
							<p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Risk signals and cash efficiency metrics</p>
						</div>
						<span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded font-extrabold uppercase tracking-wide border border-blue-100">CFO Signals</span>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
						{[
							{ label: "Cash Runway", val: "-2.7 Months", desc: "Based on approved monthly expenses.", status: "border-red-500 bg-red-50/20" },
							{ label: "Collection Risk", val: "0.0%", desc: "Overdue from open corporate receivables.", status: "border-slate-300 bg-slate-50/20" },
							{ label: "Expense Spike", val: "-62.0%", desc: "Current month vs previous month.", status: "border-emerald-500 bg-emerald-50/20" },
							{ label: "Profit Trend", val: "+62.0%", desc: "Net operational profit monthly delta.", status: "border-emerald-500 bg-emerald-50/20" },
							{ label: "Tax Exposure", val: formatNaira(3.75), desc: "Taxes currently sitting in payable account.", status: "border-blue-500 bg-blue-50/20" },
							{ label: "Payables Due Soon", val: formatNaira(stats.pendingPayables), desc: "Vendor obligations due in the next 7 days.", status: "border-rose-500 bg-rose-50/20" }
						].map((h, i) => (
							<div key={i} className={`flex flex-col gap-1.5 p-3.5 border-l-4 ${h.status} rounded-r-2xl hover:bg-white hover:shadow-md transition-all duration-200`}>
								<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h.label}</span>
								<span className="text-xs font-black text-slate-800">{h.val}</span>
								<p className="text-[9px] text-slate-400 leading-relaxed mt-1 font-semibold">{h.desc}</p>
							</div>
						))}
					</div>
				</div>

				{/* Quick Workspace menu (4cols) */}
				<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-4 flex flex-col gap-4">
					<div>
						<h3 className="font-extrabold text-slate-800 text-sm">Finance Workspace</h3>
						<p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Shortcuts to ledger modules</p>
					</div>
					<div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
						{[
							{ title: "Chart of Accounts", desc: "Account structure and classifications.", icon: <IconClipboardList className="w-5 h-5 text-blue-600" />, route: "/accountant/coa" },
							{ title: "Aged Receivables", desc: "Who owes us and how old it is.", icon: <IconCalendarClock className="w-5 h-5 text-emerald-600" />, route: "/accountant/invoices" },
							{ title: "Aged Payables", desc: "What we owe vendors and when.", icon: <IconReceipt className="w-5 h-5 text-red-500" />, route: "/accountant/expenses" },
							{ title: "Bank Reconciliation", desc: "Match statements with transaction logs.", icon: <IconReportMoney className="w-5 h-5 text-purple-600" />, route: "/accountant/reconcile" }
						].map((wItem, index) => (
							<button
								key={index}
								onClick={() => router.push(wItem.route)}
								className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-all rounded-xl text-left border border-gray-100/50 hover:border-blue-200/50 hover:shadow-sm hover:scale-[1.01] cursor-pointer"
							>
								<div className="flex items-center gap-3.5">
									<div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">{wItem.icon}</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">{wItem.title}</h4>
										<p className="text-[10px] text-slate-400 font-semibold">{wItem.desc}</p>
									</div>
								</div>
								<IconChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
							</button>
						))}
					</div>
				</div>

			</div>
		</div>
	);
}
