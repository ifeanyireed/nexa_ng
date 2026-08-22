"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "../FinanceContext";

export default function AccountantCOA() {
	const router = useRouter();
	const {
		chartOfAccounts,
		coaSearchQuery,
		setCoaSearchQuery,
		coaFilterType,
		setCoaFilterType,
		setShowAddAccountModal,
		setLedgerSearchQuery,
		formatNaira,
		accountsList,
		setAccountsList
	} = useFinance();

	const [showEditModal, setShowEditModal] = useState(false);
	const [editingAccount, setEditingAccount] = useState<any>(null);
	const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 animate-fadeIn">
			
			{/* COA Header & Top Action row */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
				<div>
					<h3 className="font-extrabold text-slate-800 text-sm">Chart of Accounts (COA)</h3>
					<p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Organize and manage your general ledger accounts</p>
				</div>
				<button
					onClick={() => setShowAddAccountModal(true)}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10 active:scale-95 transition-all border-none outline-none"
				>
					+ Add Account
				</button>
			</div>

			{/* Search & Category Filter toolbar */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				{/* Search input */}
				<div className="relative w-full md:w-80">
					<input
						type="text"
						placeholder="Search code or name..."
						value={coaSearchQuery}
						onChange={(e) => setCoaSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<div className="absolute left-3 top-2.5 text-slate-400">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
				</div>

				{/* Category quick tabs */}
				<div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100/50">
					{["All", "Assets", "Liabilities", "Equity", "Income", "Expenses"].map((cat) => (
						<button
							key={cat}
							onClick={() => setCoaFilterType(cat)}
							className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border-none outline-none ${
								coaFilterType === cat
									? "bg-white text-blue-600 shadow-sm border border-slate-100"
									: "text-slate-450 hover:text-slate-700 bg-transparent"
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Accounts Listing table */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-100">
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Account Code</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Account Name</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Type</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider">Status</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider text-right">Debit Balance</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider text-right">Credit Balance</th>
							<th className="pb-3 text-xs font-bold text-slate-455 uppercase tracking-wider text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{chartOfAccounts
							.filter(a => {
								const matchesSearch = a.code.toLowerCase().includes(coaSearchQuery.toLowerCase()) ||
									a.name.toLowerCase().includes(coaSearchQuery.toLowerCase());
								const matchesCat = coaFilterType === "All" || a.type === coaFilterType;
								return matchesSearch && matchesCat;
							})
							.map((acct, idx) => (
								<tr key={idx} className="hover:bg-slate-50/50 transition-colors">
									<td className="py-3.5 text-xs font-mono font-bold text-slate-500">
										<span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] border border-slate-200">
											{acct.code}
										</span>
									</td>
									<td className="py-3.5 text-xs font-black text-slate-800">{acct.name}</td>
									<td className="py-3.5 text-[10px] font-semibold">
										<span className={`px-2 py-0.5 rounded-full ${
											acct.type === "Assets" ? "bg-blue-50 text-blue-700 border border-blue-100" :
											acct.type === "Liabilities" ? "bg-amber-50 text-amber-700 border border-amber-100" :
											acct.type === "Equity" ? "bg-purple-50 text-purple-700 border border-purple-100" :
											acct.type === "Income" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
											"bg-red-50 text-red-700 border border-red-100"
										}`}>
											{acct.type}
										</span>
									</td>
									<td className="py-3.5 text-[10px]">
										<span className="flex items-center gap-1.5 text-emerald-700 font-bold">
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
											Active
										</span>
									</td>
									<td className="py-3.5 text-xs font-semibold text-slate-700 text-right">
										{acct.debit > 0 ? formatNaira(acct.debit) : "—"}
									</td>
									<td className="py-3.5 text-xs font-semibold text-slate-700 text-right">
										{acct.credit > 0 ? formatNaira(acct.credit) : "—"}
									</td>
									<td className="py-3.5 text-right text-xs relative">
										<div className="inline-block text-left">
											<button
												onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
												className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-xl transition-all font-extrabold cursor-pointer inline-flex items-center gap-1.5 select-none"
											>
												Actions
												<svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === idx ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
												</svg>
											</button>

											{activeDropdown === idx && (
												<>
													<div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
													<div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-100/80 py-1.5 z-20 animate-fadeIn text-left">
														<button
															onClick={() => {
																setActiveDropdown(null);
																setLedgerSearchQuery(acct.name);
																router.push("/accountant/ledger");
															}}
															className="w-full px-3 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-850 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
														>
															<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
															</svg>
															Ledger logs
														</button>
														
														<button
															onClick={() => {
																setActiveDropdown(null);
																const rawAcct = accountsList.find(a => a.code === acct.code);
																setEditingAccount(rawAcct || {
																	code: acct.code,
																	name: acct.name,
																	type: acct.type,
																	isDebit: acct.debit > 0,
																	baseVal: acct.debit || acct.credit
																});
																setShowEditModal(true);
															}}
															className="w-full px-3 py-2 text-xs font-bold text-blue-650 hover:bg-blue-50/50 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
														>
															<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
															</svg>
															Edit
														</button>
														
														<div className="border-t border-slate-100 my-1" />
														
														<button
															onClick={() => {
																setActiveDropdown(null);
																if (confirm(`Are you sure you want to delete account ${acct.name} (${acct.code})?`)) {
																	setAccountsList(prev => prev.filter(a => a.code !== acct.code));
																}
															}}
															className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
														>
															<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
															Delete
														</button>
													</div>
												</>
											)}
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{/* MODAL: EDIT ACCOUNT */}
			{showEditModal && editingAccount && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						{/* Header */}
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Edit Ledger Account</h3>
								<p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Modify properties for account code {editingAccount.code}</p>
							</div>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingAccount(null);
								}}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						{/* Form Body */}
						<form
							onSubmit={(e) => {
								e.preventDefault();
								setAccountsList(prev => prev.map(a => 
									a.code === editingAccount.code 
										? { 
											...a, 
											name: editingAccount.name, 
											type: editingAccount.type, 
											isDebit: editingAccount.isDebit === true || editingAccount.isDebit === "true"
										  } 
										: a
								));
								setShowEditModal(false);
								setEditingAccount(null);
							}}
							className="p-6 flex flex-col gap-4 text-left"
						>
							{/* Account Name */}
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Account Name</label>
								<input
									type="text"
									required
									value={editingAccount.name}
									onChange={(e) => setEditingAccount((prev: any) => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							{/* Account Type */}
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Account Type</label>
								<select
									value={editingAccount.type}
									onChange={(e) => setEditingAccount((prev: any) => ({ ...prev, type: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="Assets">Assets</option>
									<option value="Liabilities">Liabilities</option>
									<option value="Equity">Equity</option>
									<option value="Income">Income (Revenue)</option>
									<option value="Expenses">Expenses</option>
								</select>
							</div>

							{/* Balance Type (Debit / Credit) */}
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Normal Balance side</label>
								<select
									value={String(editingAccount.isDebit)}
									onChange={(e) => setEditingAccount((prev: any) => ({ ...prev, isDebit: e.target.value === "true" }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="true">Debit Side (Asset / Expense)</option>
									<option value="false">Credit Side (Liability / Equity / Revenue)</option>
								</select>
							</div>

							{/* Actions */}
							<div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={() => {
										setShowEditModal(false);
										setEditingAccount(null);
									}}
									className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-blue-500/10 border-none"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
