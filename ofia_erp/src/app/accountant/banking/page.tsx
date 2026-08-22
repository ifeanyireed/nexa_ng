"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconArrowsLeftRight, 
	IconLink,
	IconRefresh,
	IconPlus,
	IconTrash
} from "@tabler/icons-react";

const BANKING_TABS = [
	{ id: "bank-accounts", label: "Bank Accounts", slug: "/accountant/bank-accounts" },
	{ id: "banking", label: "Banking", slug: "/accountant/banking" }
];

interface BankLink {
	id: string;
	accountName: string;
	bankName: string;
	chartAccount: string;
	balance: number;
}

interface TransferRecord {
	id: string;
	date: string;
	fromBank: string;
	toBank: string;
	reference: string;
	journal: string;
	amount: number;
}

export default function BankingPage() {
	const router = useRouter();

	const [links, setLinks] = useState<BankLink[]>([
		{
			id: "link-1",
			accountName: "New Era Transports Services",
			bankName: "Globus Bank",
			chartAccount: "1050 - Globus Bank - New Era Transports",
			balance: 100000000.00
		},
		{
			id: "link-2",
			accountName: "New Era Transports Services",
			bankName: "GT Bank",
			chartAccount: "1010 - GT Bank - New Era Transports",
			balance: 100000000.00
		},
		{
			id: "link-3",
			accountName: "New Era Transports Services",
			bankName: "Keystone Bank",
			chartAccount: "1020 - Key Stone Bank - New Era Transports",
			balance: 100000000.00
		},
		{
			id: "link-4",
			accountName: "New Era Transports Services",
			bankName: "Monie Point",
			chartAccount: "1040 - Monie Point - New Era Transports",
			balance: 99951500.00
		},
		{
			id: "link-5",
			accountName: "New Era Transports Services",
			bankName: "Providus Bank",
			chartAccount: "1030 - Providus Bank - New Era Transports",
			balance: 100000000.00
		}
	]);

	const [transfers, setTransfers] = useState<TransferRecord[]>([]);
	const [showTransferModal, setShowTransferModal] = useState(false);
	
	const [newTransfer, setNewTransfer] = useState({
		fromBankId: "link-1",
		toBankId: "link-2",
		dateText: "18-07-2026",
		reference: "",
		amount: ""
	});

	const handleCreateTransferSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = parseFloat(newTransfer.amount);
		if (isNaN(amount) || amount <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		if (newTransfer.fromBankId === newTransfer.toBankId) {
			alert("Origin and destination accounts must be different");
			return;
		}

		const fromAccount = links.find(l => l.id === newTransfer.fromBankId);
		const toAccount = links.find(l => l.id === newTransfer.toBankId);

		if (!fromAccount || !toAccount) return;

		if (fromAccount.balance < amount) {
			alert("Insufficient balance in the origin account");
			return;
		}

		// Perform transfer: update balances
		setLinks(prev => prev.map(l => {
			if (l.id === fromAccount.id) {
				return { ...l, balance: l.balance - amount };
			}
			if (l.id === toAccount.id) {
				return { ...l, balance: l.balance + amount };
			}
			return l;
		}));

		// Add record
		const padNum = String(transfers.length + 1).padStart(5, "0");
		const txRecord: TransferRecord = {
			id: `TXN${padNum}`,
			date: newTransfer.dateText,
			fromBank: fromAccount.bankName,
			toBank: toAccount.bankName,
			reference: newTransfer.reference || "System Transfer",
			journal: "General Ledger Adjustment",
			amount: amount
		};

		setTransfers(prev => [txRecord, ...prev]);
		setShowTransferModal(false);
		setNewTransfer({
			fromBankId: "link-1",
			toBankId: "link-2",
			dateText: "18-07-2026",
			reference: "",
			amount: ""
		});
	};

	const handleDeleteTransfer = (id: string, amount: number, fromName: string, toName: string) => {
		if (confirm(`Are you sure you want to reverse transfer ${id}?`)) {
			// Reverse balances
			setLinks(prev => prev.map(l => {
				if (l.bankName === fromName) {
					return { ...l, balance: l.balance + amount };
				}
				if (l.bankName === toName) {
					return { ...l, balance: l.balance - amount };
				}
				return l;
			}));
			setTransfers(prev => prev.filter(t => t.id !== id));
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
		<div className="flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100/40">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Banking</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Bank accounts linked to chart accounts, transfers, and reconciliation controls</p>
				</div>
				<button
					onClick={() => setShowTransferModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconArrowsLeftRight className="w-4 h-4" />
					New Transfer
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/40">
				<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
					{BANKING_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => router.push(tab.slug)}
							className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
								tab.id === "banking"
									? "border-red-500 text-red-500 font-bold"
									: "border-transparent text-slate-400 hover:text-slate-700"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Table 1: Connected Bank Links */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
				<h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-gray-50">Linked Bank Accounts</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
								<th className="pb-3 min-w-[200px]">Account</th>
								<th className="pb-3 min-w-[150px]">Bank</th>
								<th className="pb-3 min-w-[220px]">Chart of Account</th>
								<th className="pb-3 min-w-[150px]">Current Balance</th>
								<th className="pb-3 text-right w-20">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{links.map((link) => (
								<tr key={link.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{link.accountName}</p>
										<p className="text-[10px] text-slate-450 mt-0.5">Bank · NGN</p>
									</td>
									<td className="py-4 text-slate-800">{link.bankName}</td>
									<td className="py-4 text-slate-500 text-[11px] font-mono">{link.chartAccount}</td>
									<td className="py-4 text-slate-800 font-extrabold">{formatNaira(link.balance)}</td>
									<td className="py-4 text-right">
										<button 
											onClick={() => {
												setNewTransfer(prev => ({ ...prev, fromBankId: link.id }));
												setShowTransferModal(true);
											}}
											className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer transition-colors border-none"
											title="Transfer from here"
										>
											<IconLink className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Section: Recent Transfers */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
				<h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-gray-50">Recent Transfers</h3>
				<div className="overflow-x-auto min-h-[160px]">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
								<th className="pb-3 min-w-[110px]">Date</th>
								<th className="pb-3 min-w-[150px]">From</th>
								<th className="pb-3 min-w-[150px]">To</th>
								<th className="pb-3 min-w-[180px]">Reference</th>
								<th className="pb-3 min-w-[200px]">Journal</th>
								<th className="pb-3 min-w-[120px]">Amount</th>
								<th className="pb-3 text-right w-20">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{transfers.length > 0 ? (
								transfers.map((tx) => (
									<tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
										<td className="py-4 text-slate-550">{tx.date}</td>
										<td className="py-4 text-slate-800 font-bold">{tx.fromBank}</td>
										<td className="py-4 text-slate-800 font-bold">{tx.toBank}</td>
										<td className="py-4 text-slate-600 font-mono text-[11px]">{tx.reference}</td>
										<td className="py-4 text-slate-500">{tx.journal}</td>
										<td className="py-4 text-red-500 font-extrabold">{formatNaira(tx.amount)}</td>
										<td className="py-4 text-right">
											<button
												onClick={() => handleDeleteTransfer(tx.id, tx.amount, tx.fromBank, tx.toBank)}
												className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
												title="Reverse"
											>
												<IconTrash className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-bold">
										<div className="flex flex-col items-center justify-center gap-2">
											<IconRefresh className="w-8 h-8 text-slate-300 animate-spin-slow" />
											<span>- No record found. -</span>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* TRANSFER MODAL */}
			{showTransferModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">New Fund Transfer</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Transfer funds between linked bank accounts</p>
							</div>
							<button
								onClick={() => setShowTransferModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleCreateTransferSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">From Account</label>
								<select
									value={newTransfer.fromBankId}
									onChange={(e) => setNewTransfer(prev => ({ ...prev, fromBankId: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									{links.map(l => (
										<option key={l.id} value={l.id}>
											{`${l.bankName} (${formatNaira(l.balance)})`}
										</option>
									))}
								</select>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">To Account</label>
								<select
									value={newTransfer.toBankId}
									onChange={(e) => setNewTransfer(prev => ({ ...prev, toBankId: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									{links.map(l => (
										<option key={l.id} value={l.id}>
											{`${l.bankName} (${formatNaira(l.balance)})`}
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Date</label>
									<input
										type="text"
										required
										value={newTransfer.dateText}
										onChange={(e) => setNewTransfer(prev => ({ ...prev, dateText: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Amount (NGN)</label>
									<input
										type="number"
										required
										placeholder="e.g. 50000"
										value={newTransfer.amount}
										onChange={(e) => setNewTransfer(prev => ({ ...prev, amount: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Reference / Description</label>
								<input
									type="text"
									placeholder="e.g. Interbank Transfer ref #9281"
									value={newTransfer.reference}
									onChange={(e) => setNewTransfer(prev => ({ ...prev, reference: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Transfer Funds
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
