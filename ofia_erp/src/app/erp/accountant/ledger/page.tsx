"use client";

import React from "react";
import { useFinance } from "../FinanceContext";

export default function AccountantLedger() {
	const {
		transactions,
		ledgerSearchQuery,
		setLedgerSearchQuery,
		formatNaira
	} = useFinance();

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 animate-fadeIn">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
				<div>
					<h3 className="font-bold text-slate-800 text-sm">General Journal Cashbook Ledger</h3>
					<p className="text-[10px] text-slate-400 font-semibold">Historically recorded operational transactions</p>
				</div>
				{/* Search Ledger */}
				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search description/category..."
						value={ledgerSearchQuery}
						onChange={(e) => setLedgerSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<div className="absolute left-3 top-2.5 text-slate-400">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-100">
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Date</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Category</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Description</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Type</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider text-right">Amount</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{transactions
							.filter(txn => {
								if (!ledgerSearchQuery) return true;
								const q = ledgerSearchQuery.toLowerCase();
								return txn.category.toLowerCase().includes(q) ||
									(txn.description && txn.description.toLowerCase().includes(q));
							})
							.map((txn) => (
							<tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 text-xs font-semibold text-slate-500">
									{new Date(txn.date).toLocaleDateString()}
								</td>
								<td className="py-4 text-xs font-bold text-slate-800">{txn.category}</td>
								<td className="py-4 text-xs font-semibold text-slate-500">{txn.description}</td>
								<td className="py-4">
									<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
										txn.type === "Credit" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
									}`}>
										{txn.type === "Credit" ? "Credit (Rev)" : "Debit (Exp)"}
									</span>
								</td>
								<td className="py-4 text-xs font-black text-slate-700 text-right">{formatNaira(txn.amount)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
