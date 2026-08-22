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

const TRANSACTIONS_TABS = [
	{ id: "journal-entries", label: "Journal Entries", slug: "/accountant/journal-entries" },
	{ id: "recurring-journals", label: "Recurring Journals", slug: "/accountant/recurring-journals" },
	{ id: "reconcile", label: "Bank Reconciliation", slug: "/accountant/reconcile" },
	{ id: "budget-planner", label: "Budget Planner", slug: "/accountant/budget-planner" },
	{ id: "period-close", label: "Period Close", slug: "/accountant/period-close" },
	{ id: "audit-trail", label: "Audit Trail", slug: "/accountant/audit-trail" }
];

export default function AccountantReconcile() {
	const router = useRouter();
	const {
		reconciliations,
		formatNaira,
		setShowReconcileModal,
		handleResolveReconciliation
	} = useFinance();

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Bank Reconciliation</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Match transaction values with bank statement records to verify ledger alignment</p>
				</div>
				<button
					onClick={() => setShowReconcileModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					New Reconciliation Run
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{TRANSACTIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "reconcile"
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
							<th className="pb-3 min-w-[200px]">Reconciled Item</th>
							<th className="pb-3 min-w-[130px]">Expected (System)</th>
							<th className="pb-3 min-w-[130px]">Actual (Bank)</th>
							<th className="pb-3 min-w-[130px]">Discrepancy</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-28">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{reconciliations.map((rec) => (
							<tr key={rec.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
								<td className="py-4">
									<p className="font-bold text-slate-800 text-xs">{rec.title}</p>
									<p className="text-[10px] text-slate-450 mt-0.5">Period: {rec.periodStart} to {rec.periodEnd} • Prepared by {rec.preparedBy}</p>
									{rec.notes && <p className="text-[10px] text-amber-700 italic mt-0.5">Notes: {rec.notes}</p>}
								</td>
								<td className="py-4 text-slate-600">{formatNaira(rec.expectedAmount)}</td>
								<td className="py-4 text-slate-600">{formatNaira(rec.actualAmount)}</td>
								<td className={`py-4 font-extrabold ${rec.discrepancy === 0 ? "text-emerald-600" : "text-red-500"}`}>
									{formatNaira(rec.discrepancy)}
								</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
										rec.status === "Resolved" 
											? "bg-emerald-50 border-emerald-100 text-emerald-700" 
											: "bg-red-50 border-red-100 text-red-700 animate-pulse"
									}`}>
										{rec.status}
									</span>
								</td>
								<td className="py-4 text-right">
									{rec.status !== "Resolved" ? (
										<button
											onClick={() => handleResolveReconciliation(rec.id)}
											className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] cursor-pointer transition-all border-none outline-none shadow-sm active:scale-95"
										>
											Mark Resolved
										</button>
									) : (
										<span className="text-[10px] text-slate-450 font-bold flex items-center justify-end gap-1">
											<IconCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
											Resolved
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
