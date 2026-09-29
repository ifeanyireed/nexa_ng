"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconDotsVertical,
	IconTrash
} from "@tabler/icons-react";

const BANKING_TABS = [
	{ id: "bank-accounts", label: "Bank Accounts", slug: "/accountant/bank-accounts" },
	{ id: "banking", label: "Banking", slug: "/accountant/banking" }
];

interface BankAccount {
	id: string;
	bankName: string;
	logo: string;
	holderName: string;
	accountType: string;
	chartAccount: string;
	currency: string;
	balance: number;
	status: string;
}

export default function BankAccountsPage() {
	const router = useRouter();

	const [accounts, setAccounts] = useState<BankAccount[]>([
		{
			id: "acc-1",
			bankName: "Globus Bank",
			logo: "/globus.png",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: "1050 - Globus Bank - New Era Transports",
			currency: "NGN (₦)",
			balance: 100000000.00,
			status: "Active"
		},
		{
			id: "acc-2",
			bankName: "Keystone Bank",
			logo: "/keystone.jpg",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: "1020 - Key Stone Bank - New Era Transports",
			currency: "NGN (₦)",
			balance: 100000000.00,
			status: "Active"
		},
		{
			id: "acc-3",
			bankName: "GT Bank",
			logo: "/gtbank.webp",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: "1010 - GT Bank - New Era Transports",
			currency: "NGN (₦)",
			balance: 100000000.00,
			status: "Active"
		},
		{
			id: "acc-4",
			bankName: "Providus Bank",
			logo: "/providus.webp",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: "1030 - Providus Bank - New Era Transports",
			currency: "NGN (₦)",
			balance: 100000000.00,
			status: "Active"
		},
		{
			id: "acc-5",
			bankName: "Monie Point",
			logo: "/moniepoint.webp",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: "1040 - Monie Point - New Era Transports",
			currency: "NGN (₦)",
			balance: 99951500.00,
			status: "Active"
		}
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [pageSize, setPageSize] = useState(10);
	const [showAddModal, setShowAddModal] = useState(false);
	
	const [newAccount, setNewAccount] = useState({
		bankName: "",
		chartAccount: "1060 - New Bank Account",
		balance: ""
	});

	const filteredAccounts = accounts.filter(acc => {
		const query = searchQuery.toLowerCase();
		return (
			acc.bankName.toLowerCase().includes(query) ||
			acc.chartAccount.toLowerCase().includes(query) ||
			acc.holderName.toLowerCase().includes(query)
		);
	});

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedIds(filteredAccounts.map(a => a.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: string) => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		);
	};

	const handleAddAccountSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const bal = parseFloat(newAccount.balance) || 0;
		const accData: BankAccount = {
			id: `acc-${Date.now()}`,
			bankName: newAccount.bankName,
			logo: "generic",
			holderName: "New Era Transports Services",
			accountType: "Bank",
			chartAccount: newAccount.chartAccount,
			currency: "NGN (₦)",
			balance: bal,
			status: "Active"
		};
		setAccounts(prev => [...prev, accData]);
		setShowAddModal(false);
		setNewAccount({ bankName: "", chartAccount: "1060 - New Bank Account", balance: "" });
	};

	const handleDeleteBatch = () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected account(s)?`)) {
			setAccounts(prev => prev.filter(a => !selectedIds.includes(a.id)));
			setSelectedIds([]);
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
			<div>
				<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Bank Accounts</h2>
				<p className="text-xs text-slate-455 font-semibold mt-1">Manage physical bank accounts connected to the financial system</p>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{BANKING_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "bank-accounts"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Actions row */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={() => setShowAddModal(true)}
						className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
					>
						<IconPlus className="w-4 h-4" />
						Add Bank Account
					</button>
					<button
						onClick={() => alert("CSV Export Triggered")}
						className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
					>
						<IconDownload className="w-4 h-4 text-slate-400" />
						Export
					</button>
					{selectedIds.length > 0 && (
						<button
							onClick={handleDeleteBatch}
							className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none shadow-sm"
						>
							<IconTrash className="w-4 h-4" />
							Delete Selected ({selectedIds.length})
						</button>
					)}
				</div>

				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search bank accounts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto min-h-72">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 w-12 pr-3">
								<input
									type="checkbox"
									onChange={handleSelectAll}
									checked={filteredAccounts.length > 0 && selectedIds.length === filteredAccounts.length}
									className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
								/>
							</th>
							<th className="pb-3 min-w-[150px]">Bank Account</th>
							<th className="pb-3 min-w-[200px]">Account Holder Name</th>
							<th className="pb-3 min-w-[120px]">Account Type</th>
							<th className="pb-3 min-w-[220px]">Chart of Account</th>
							<th className="pb-3 min-w-[100px]">Currency</th>
							<th className="pb-3 min-w-[150px]">Bank Balance</th>
							<th className="pb-3 min-w-[110px]">Status</th>
							<th className="pb-3 text-right w-16">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredAccounts.length > 0 ? (
							filteredAccounts.slice(0, pageSize).map((acc) => (
								<tr key={acc.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 pr-3">
										<input
											type="checkbox"
											checked={selectedIds.includes(acc.id)}
											onChange={() => handleSelectRow(acc.id)}
											className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
										/>
									</td>
									<td className="py-4">
										<div className="flex items-center gap-2">
											{acc.logo && acc.logo.includes(".") ? (
												<img src={acc.logo} alt={acc.bankName} className="w-5 h-5 rounded-full object-cover shrink-0" />
											) : (
												<span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-black shrink-0">
													{acc.bankName.slice(0, 2).toUpperCase()}
												</span>
											)}
											<span className="font-extrabold text-slate-800">{acc.bankName}</span>
										</div>
									</td>
									<td className="py-4">{acc.holderName}</td>
									<td className="py-4 text-slate-500">{acc.accountType}</td>
									<td className="py-4 text-slate-550 text-[11px] font-mono">{acc.chartAccount}</td>
									<td className="py-4 text-slate-600">{acc.currency}</td>
									<td className="py-4 text-slate-800 font-extrabold">{formatNaira(acc.balance)}</td>
									<td className="py-4">
										<select
											value={acc.status}
											onChange={(e) => {
												const nextVal = e.target.value;
												setAccounts(prev => prev.map(a => a.id === acc.id ? ({ ...a, status: nextVal }) : a));
											}}
											className="px-2 py-1 bg-emerald-55/10 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg focus:outline-none"
										>
											<option value="Active">Active</option>
											<option value="Inactive">Inactive</option>
										</select>
									</td>
									<td className="py-4 text-right">
										<button className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors border-none bg-transparent">
											<IconDotsVertical className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No bank accounts found matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination matching design */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
				<div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
					<span>Show</span>
					<select
						value={pageSize}
						onChange={(e) => setPageSize(Number(e.target.value))}
						className="px-1.5 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-extrabold text-slate-700"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
					</select>
					<span>entries</span>
				</div>
				<p className="text-[11px] text-slate-450 font-bold">
					{`Showing 1 to ${Math.min(filteredAccounts.length, pageSize)} of ${filteredAccounts.length} entries`}
				</p>
				<div className="flex items-center gap-1">
					<button className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-400 rounded-xl text-[10px] font-extrabold cursor-not-allowed" disabled>
						Previous
					</button>
					<button className="w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold bg-red-500 text-white shadow-sm">
						1
					</button>
					<button className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-400 rounded-xl text-[10px] font-extrabold cursor-not-allowed" disabled>
						Next
					</button>
				</div>
			</div>

			{/* ADD ACCOUNT MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add Bank Account</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Integrate a new physical bank account</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddAccountSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Bank Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Globus Bank"
									value={newAccount.bankName}
									onChange={(e) => setNewAccount(prev => ({ ...prev, bankName: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Chart of Account Ledger</label>
								<input
									type="text"
									required
									placeholder="e.g. 1050 - Globus Bank"
									value={newAccount.chartAccount}
									onChange={(e) => setNewAccount(prev => ({ ...prev, chartAccount: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Opening Balance (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 100000000"
									value={newAccount.balance}
									onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Add Bank Account
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
