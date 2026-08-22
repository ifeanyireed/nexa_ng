"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconSearch,
	IconCheck,
	IconTrash,
	IconArrowLeft,
	IconX
} from "@tabler/icons-react";

const TRANSACTIONS_TABS = [
	{ id: "journal-entries", label: "Journal Entries", slug: "/accountant/journal-entries" },
	{ id: "recurring-journals", label: "Recurring Journals", slug: "/accountant/recurring-journals" },
	{ id: "reconcile", label: "Bank Reconciliation", slug: "/accountant/reconcile" },
	{ id: "budget-planner", label: "Budget Planner", slug: "/accountant/budget-planner" },
	{ id: "period-close", label: "Period Close", slug: "/accountant/period-close" },
	{ id: "audit-trail", label: "Audit Trail", slug: "/accountant/audit-trail" }
];

interface JournalEntry {
	id: string;
	date: string;
	accountName: string;
	reference: string;
	debit: number;
	credit: number;
}

export default function JournalEntriesPage() {
	const router = useRouter();

	const [journals, setJournals] = useState<JournalEntry[]>([
		{ id: "JE-00002", date: "18-07-2026", accountName: "1030 - Providus Bank", reference: "Interbank Transfer ref #3019", debit: 49000.00, credit: 0 },
		{ id: "JE-00001", date: "18-07-2026", accountName: "1050 - Globus Bank", reference: "Interbank Transfer ref #3019", debit: 0, credit: 49000.00 }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	// Modal Form States
	const [transactionDate, setTransactionDate] = useState("2026-07-20");
	const [reference, setReference] = useState("");
	const [journalDescription, setJournalDescription] = useState("");
	const [postingLines, setPostingLines] = useState([
		{ id: "1", accountName: "", debit: "", credit: "", description: "" },
		{ id: "2", accountName: "", debit: "", credit: "", description: "" }
	]);

	const filteredJournals = journals.filter(j =>
		j.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
		j.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
		j.id.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getNextJournalNumber = () => {
		const nextIdNum = journals.length > 0 ? Math.max(...journals.map(j => {
			const num = parseInt(j.id.replace(/[^\d]/g, ""), 10);
			return isNaN(num) ? 0 : num;
		})) : 0;
		const journalNumVal = nextIdNum > 2 ? nextIdNum + 1 : 588;
		return `JRN-${String(journalNumVal).padStart(5, "0")}`;
	};

	const handleOpenModal = () => {
		const today = new Date().toISOString().split("T")[0];
		setTransactionDate(today);
		setReference("");
		setJournalDescription("");
		setPostingLines([
			{ id: "1", accountName: "", debit: "", credit: "", description: "" },
			{ id: "2", accountName: "", debit: "", credit: "", description: "" }
		]);
		setShowAddModal(true);
	};

	const handleLineChange = (id: string, field: string, value: string) => {
		setPostingLines(prev => prev.map(line => {
			if (line.id === id) {
				const updatedLine = { ...line, [field]: value };
				// If debit is updated and has value, clear credit
				if (field === "debit" && value !== "") {
					updatedLine.credit = "";
				}
				// If credit is updated and has value, clear debit
				if (field === "credit" && value !== "") {
					updatedLine.debit = "";
				}
				return updatedLine;
			}
			return line;
		}));
	};

	const handleAddLine = () => {
		setPostingLines(prev => [...prev, { id: Date.now().toString(), accountName: "", debit: "", credit: "", description: "" }]);
	};

	const handleDeleteLine = (id: string) => {
		if (postingLines.length <= 2) {
			alert("A journal entry must have at least 2 posting lines.");
			return;
		}
		setPostingLines(prev => prev.filter(line => line.id !== id));
	};

	const formatDateToDMY = (dateStr: string) => {
		if (!dateStr) return "";
		const [y, m, d] = dateStr.split("-");
		return `${d}-${m}-${y}`;
	};

	const formatNumber = (num: number) => {
		return num.toLocaleString("en-NG", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	};

	const handleAddJournalSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (postingLines.length < 2) {
			alert("A journal entry must have at least 2 posting lines.");
			return;
		}

		const hasInvalidLine = postingLines.some(line => !line.accountName);
		if (hasInvalidLine) {
			alert("Please select a ledger account for all posting lines.");
			return;
		}

		const totalDebit = postingLines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
		const totalCredit = postingLines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);

		if (totalDebit === 0 && totalCredit === 0) {
			alert("Please enter debit or credit amounts.");
			return;
		}

		if (Math.abs(totalDebit - totalCredit) > 0.009) {
			alert(`The journal entry is unbalanced.\nTotal Debits: ₦${formatNumber(totalDebit)}\nTotal Credits: ₦${formatNumber(totalCredit)}\nDifference: ₦${formatNumber(Math.abs(totalDebit - totalCredit))}`);
			return;
		}

		const journalNumber = getNextJournalNumber();
		const formattedDate = formatDateToDMY(transactionDate);

		const newItems: JournalEntry[] = postingLines
			.filter(line => line.accountName && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0))
			.map(line => ({
				id: journalNumber,
				date: formattedDate,
				accountName: line.accountName,
				reference: line.description || reference || journalDescription || "Manual Adjustment",
				debit: parseFloat(line.debit) || 0,
				credit: parseFloat(line.credit) || 0
			}));

		setJournals(prev => [...newItems, ...prev]);
		setShowAddModal(false);
	};

	const handleDeleteJournal = (id: string) => {
		if (confirm(`Are you sure you want to remove journal entry ${id}?`)) {
			setJournals(prev => prev.filter(j => j.id !== id));
		}
	};

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
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Journal Entries</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Record double-entry ledger adjustments and general journal entries</p>
				</div>
				<button
					onClick={handleOpenModal}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Add Journal Entry
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{TRANSACTIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "journal-entries"
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
						placeholder="Search journal entry..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
				</div>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Journal ID</th>
							<th className="pb-3 min-w-[110px]">Date</th>
							<th className="pb-3 min-w-[200px]">Account</th>
							<th className="pb-3 min-w-[200px]">Reference</th>
							<th className="pb-3 min-w-[120px]">Debit</th>
							<th className="pb-3 min-w-[120px]">Credit</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredJournals.length > 0 ? (
							filteredJournals.map((j) => (
								<tr key={j.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 font-mono font-bold text-slate-800">{j.id}</td>
									<td className="py-4 text-slate-550">{j.date}</td>
									<td className="py-4 text-slate-800">{j.accountName}</td>
									<td className="py-4 text-slate-600">{j.reference}</td>
									<td className="py-4 text-emerald-650 font-bold">{formatNaira(j.debit)}</td>
									<td className="py-4 text-red-500 font-bold">{formatNaira(j.credit)}</td>
									<td className="py-4 text-right">
										<button
											onClick={() => handleDeleteJournal(j.id)}
											className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
										>
											<IconTrash className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No journal entries found matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* ADD JOURNAL MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto pt-10">
					<div className="bg-slate-50/95 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-slideUp mb-10">
						
						{/* Header */}
						<div className="flex justify-between items-center px-8 py-6 bg-transparent">
							<div>
								<h3 className="font-black text-slate-800 text-lg">Create Journal Entry</h3>
								<p className="text-xs text-slate-500 mt-1 font-semibold">Post a balanced manual debit and credit journal.</p>
							</div>
							<button
								type="button"
								onClick={() => setShowAddModal(false)}
								className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
							>
								<IconArrowLeft className="w-4 h-4" />
								Journals
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleAddJournalSubmit} className="px-8 pb-8 flex flex-col gap-6 text-left">
							
							{/* Card 1: Header Info */}
							<div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col gap-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Journal Number</label>
										<input
											type="text"
											disabled
											value={getNextJournalNumber()}
											className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200 text-xs rounded-lg text-slate-550 font-semibold outline-none cursor-not-allowed font-mono"
										/>
									</div>
									
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Transaction Date</label>
										<input
											type="date"
											required
											value={transactionDate}
											onChange={(e) => setTransactionDate(e.target.value)}
											className="w-full px-3 py-2 bg-white border border-slate-200 text-xs rounded-lg text-slate-800 font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
										/>
									</div>

									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Reference</label>
										<input
											type="text"
											placeholder="Reference code or name"
											value={reference}
											onChange={(e) => setReference(e.target.value)}
											className="w-full px-3 py-2 bg-white border border-slate-200 text-xs rounded-lg text-slate-800 font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
										/>
									</div>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
									<textarea
										placeholder="Describe the overall purpose of this journal entry"
										value={journalDescription}
										onChange={(e) => setJournalDescription(e.target.value)}
										className="w-full px-3 py-2 bg-white border border-slate-200 text-xs rounded-lg text-slate-800 font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 h-20 resize-none"
									/>
								</div>
							</div>

							{/* Card 2: Posting Lines */}
							<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col overflow-hidden">
								
								{/* Card header */}
								<div className="flex justify-between items-center p-5 border-b border-slate-100">
									<h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Posting Lines</h4>
									<button
										type="button"
										onClick={handleAddLine}
										className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 border-none outline-none cursor-pointer"
									>
										<IconPlus className="w-3.5 h-3.5" />
										Add Line
									</button>
								</div>

								{/* Table Column Labels */}
								<div className="grid grid-cols-12 gap-3 px-6 py-3 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
									<div className="col-span-4">Account</div>
									<div className="col-span-2 text-right pr-4">Debit</div>
									<div className="col-span-2 text-right pr-4">Credit</div>
									<div className="col-span-3 pl-2">Description</div>
									<div className="col-span-1"></div>
								</div>

								{/* Dynamic Rows */}
								<div className="divide-y divide-slate-100">
									{postingLines.map((line) => (
										<div key={line.id} className="grid grid-cols-12 gap-3 px-6 py-3 items-center hover:bg-slate-50/30 transition-colors">
											<div className="col-span-4">
												<select
													required
													value={line.accountName}
													onChange={(e) => handleLineChange(line.id, "accountName", e.target.value)}
													className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
												>
													<option value="">Select account</option>
													<option value="1030 - Providus Bank">1030 - Providus Bank</option>
													<option value="1050 - Globus Bank">1050 - Globus Bank</option>
													<option value="1010 - GT Bank">1010 - GT Bank</option>
													<option value="4000 - Professional Service Income">4000 - Professional Service Income</option>
													<option value="5000 - Travel & Transportation Expense">5000 - Travel & Transportation Expense</option>
												</select>
											</div>
											<div className="col-span-2">
												<input
													type="number"
													step="0.01"
													placeholder="0.00"
													value={line.debit}
													onChange={(e) => handleLineChange(line.id, "debit", e.target.value)}
													className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-mono text-right text-slate-800 font-bold focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
												/>
											</div>
											<div className="col-span-2">
												<input
													type="number"
													step="0.01"
													placeholder="0.00"
													value={line.credit}
													onChange={(e) => handleLineChange(line.id, "credit", e.target.value)}
													className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-mono text-right text-slate-800 font-bold focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
												/>
											</div>
											<div className="col-span-3">
												<input
													type="text"
													placeholder="Description"
													value={line.description}
													onChange={(e) => handleLineChange(line.id, "description", e.target.value)}
													className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
												/>
											</div>
											<div className="col-span-1 flex justify-end">
												<button
													type="button"
													onClick={() => handleDeleteLine(line.id)}
													className="p-1.5 border border-red-200 hover:border-red-400 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
													title="Delete Line"
												>
													<IconX className="w-3.5 h-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>

								{/* Totals Row */}
								<div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50/30 border-t border-slate-200 font-bold text-xs text-slate-800 items-center">
									<div className="col-span-4 text-right pr-6 font-black uppercase text-[10px] text-slate-500">Total</div>
									<div className="col-span-2 text-right pr-3 font-mono font-black text-slate-900">
										{formatNumber(postingLines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0))}
									</div>
									<div className="col-span-2 text-right pr-3 font-mono font-black text-slate-900">
										{formatNumber(postingLines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0))}
									</div>
									<div className="col-span-3"></div>
									<div className="col-span-1"></div>
								</div>

								{/* Bottom Actions Bar */}
								<div className="p-5 flex justify-end gap-3 bg-slate-50/20 border-t border-slate-100">
									<button
										type="button"
										onClick={() => setShowAddModal(false)}
										className="px-5 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border-none"
									>
										<IconCheck className="w-4 h-4" />
										Post Journal
									</button>
								</div>

							</div>

						</form>
					</div>
				</div>
			)}

		</div>
	);
}
