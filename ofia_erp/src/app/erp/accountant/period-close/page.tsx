"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconLock,
	IconPlus, 
	IconSearch,
	IconTrash 
} from "@tabler/icons-react";

const TRANSACTIONS_TABS = [
	{ id: "journal-entries", label: "Journal Entries", slug: "/accountant/journal-entries" },
	{ id: "recurring-journals", label: "Recurring Journals", slug: "/accountant/recurring-journals" },
	{ id: "reconcile", label: "Bank Reconciliation", slug: "/accountant/reconcile" },
	{ id: "budget-planner", label: "Budget Planner", slug: "/accountant/budget-planner" },
	{ id: "period-close", label: "Period Close", slug: "/accountant/period-close" },
	{ id: "audit-trail", label: "Audit Trail", slug: "/accountant/audit-trail" }
];

interface ClosePeriodRecord {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	closedOn: string;
	closedBy: string;
	status: string;
}

export default function PeriodClosePage() {
	const router = useRouter();

	const [periods, setPeriods] = useState<ClosePeriodRecord[]>([
		{ id: "PC-01", name: "Q1 FY26 Closed Book", startDate: "01-01-2026", endDate: "31-03-2026", closedOn: "05-04-2026", closedBy: "Oluwatobiloba Olateju", status: "Locked" },
		{ id: "PC-02", name: "Q2 FY26 Closed Book", startDate: "01-04-2026", endDate: "30-06-2026", closedOn: "07-07-2026", closedBy: "Oluwatobiloba Olateju", status: "Locked" }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	const [newPeriod, setNewPeriod] = useState({
		name: "",
		startDate: "",
		endDate: ""
	});

	const filteredPeriods = periods.filter(p =>
		p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.closedBy.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleClosePeriodSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const padNum = String(periods.length + 1).padStart(2, "0");
		const periodData: ClosePeriodRecord = {
			id: `PC-${padNum}`,
			name: newPeriod.name,
			startDate: newPeriod.startDate.split("-").reverse().join("-"),
			endDate: newPeriod.endDate.split("-").reverse().join("-"),
			closedOn: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
			closedBy: "Oluwatobiloba Olateju",
			status: "Locked"
		};

		setPeriods(prev => [periodData, ...prev]);
		setShowAddModal(false);
		setNewPeriod({ name: "", startDate: "", endDate: "" });
	};

	const handleDeletePeriod = (id: string) => {
		if (confirm("Are you sure you want to re-open this closed period ledger?")) {
			setPeriods(prev => prev.filter(p => p.id !== id));
		}
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Period Close</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Lock financial accounting periods to prevent retrospective entries</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Run Period Close
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{TRANSACTIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "period-close"
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
						placeholder="Search closed periods..."
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
							<th className="pb-3 min-w-[200px]">Period Name</th>
							<th className="pb-3 min-w-[110px]">Start Date</th>
							<th className="pb-3 min-w-[110px]">End Date</th>
							<th className="pb-3 min-w-[110px]">Closed On</th>
							<th className="pb-3 min-w-[150px]">Closed By</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredPeriods.length > 0 ? (
							filteredPeriods.map((p) => (
								<tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 text-slate-800 font-bold flex items-center gap-1.5">
										<IconLock className="w-4 h-4 text-red-500" />
										{p.name}
									</td>
									<td className="py-4 text-slate-550">{p.startDate}</td>
									<td className="py-4 text-slate-550">{p.endDate}</td>
									<td className="py-4 text-slate-550">{p.closedOn}</td>
									<td className="py-4 text-slate-600">{p.closedBy}</td>
									<td className="py-4">
										<span className="bg-red-50 text-red-700 border border-red-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
											{p.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<button
											onClick={() => handleDeletePeriod(p.id)}
											className="p-1 hover:bg-slate-100 text-blue-600 hover:text-blue-800 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
											title="Re-open Period"
										>
											Re-open
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No closed periods found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* RUN CLOSE PERIOD MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Run Period Close</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Perform accounting closing balances lock</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleClosePeriodSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Period / Book Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Q3 FY26 Closed Book"
									value={newPeriod.name}
									onChange={(e) => setNewPeriod(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Start Date</label>
									<input
										type="date"
										required
										value={newPeriod.startDate}
										onChange={(e) => setNewPeriod(prev => ({ ...prev, startDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">End Date</label>
									<input
										type="date"
										required
										value={newPeriod.endDate}
										onChange={(e) => setNewPeriod(prev => ({ ...prev, endDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Lock Period Ledger
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
