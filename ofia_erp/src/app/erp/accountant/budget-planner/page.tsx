"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
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

interface BudgetPlan {
	id: string;
	name: string;
	fiscalYear: string;
	category: string;
	planned: number;
	spent: number;
}

export default function BudgetPlannerPage() {
	const router = useRouter();

	const [budgets, setBudgets] = useState<BudgetPlan[]>([
		{ id: "B-01", name: "FY26 Logistics Operations", fiscalYear: "2026", category: "Fuel & Fleet Maintenance", planned: 50000000.00, spent: 12500000.00 },
		{ id: "B-02", name: "FY26 Office Infrastructure", fiscalYear: "2026", category: "Rent & Utilities", planned: 15000000.00, spent: 15200000.00 }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	const [newBudget, setNewBudget] = useState({
		name: "",
		fiscalYear: "2026",
		category: "Fuel & Fleet Maintenance",
		planned: ""
	});

	const filteredBudgets = budgets.filter(b =>
		b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		b.category.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddBudgetSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const plannedVal = parseFloat(newBudget.planned);
		if (isNaN(plannedVal) || plannedVal <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		const budgetData: BudgetPlan = {
			id: `B-${Date.now()}`,
			name: newBudget.name,
			fiscalYear: newBudget.fiscalYear,
			category: newBudget.category,
			planned: plannedVal,
			spent: 0
		};

		setBudgets(prev => [...prev, budgetData]);
		setShowAddModal(false);
		setNewBudget({ name: "", fiscalYear: "2026", category: "Fuel & Fleet Maintenance", planned: "" });
	};

	const handleDeleteBudget = (id: string) => {
		if (confirm("Are you sure you want to delete this budget plan?")) {
			setBudgets(prev => prev.filter(b => b.id !== id));
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
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Budget Planner</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Plan corporate spending limits and monitor budget variance logs</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Create Budget
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{TRANSACTIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "budget-planner"
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
						placeholder="Search budgets..."
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
							<th className="pb-3 min-w-[200px]">Budget Name</th>
							<th className="pb-3 min-w-[100px]">Fiscal Year</th>
							<th className="pb-3 min-w-[180px]">Category</th>
							<th className="pb-3 min-w-[140px]">Planned Amount</th>
							<th className="pb-3 min-w-[140px]">Spent Amount</th>
							<th className="pb-3 min-w-[140px]">Variance</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredBudgets.length > 0 ? (
							filteredBudgets.map((b) => {
								const variance = b.planned - b.spent;
								const isExceeded = variance < 0;
								const status = isExceeded ? "Exceeded" : "On Track";
								return (
									<tr key={b.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
										<td className="py-4 text-slate-800 font-bold">{b.name}</td>
										<td className="py-4 text-slate-550">{b.fiscalYear}</td>
										<td className="py-4 text-slate-600">{b.category}</td>
										<td className="py-4 text-slate-800 font-bold">{formatNaira(b.planned)}</td>
										<td className="py-4 text-slate-600">{formatNaira(b.spent)}</td>
										<td className={`py-4 font-extrabold ${isExceeded ? "text-red-500" : "text-emerald-600"}`}>
											{formatNaira(variance)}
										</td>
										<td className="py-4">
											<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
												isExceeded 
													? "bg-red-50 border-red-100 text-red-700 animate-pulse" 
													: "bg-emerald-50 border-emerald-100 text-emerald-700"
											}`}>
												{status}
											</span>
										</td>
										<td className="py-4 text-right">
											<button
												onClick={() => handleDeleteBudget(b.id)}
												className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
											>
												<IconTrash className="w-4 h-4" />
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No budget plans found matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* CREATE BUDGET MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Create Budget Allocation</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Post a fiscal year ceiling adjustment</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddBudgetSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Budget Name</label>
								<input
									type="text"
									required
									placeholder="e.g. FY26 Fuel & Logistics"
									value={newBudget.name}
									onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Fiscal Year</label>
									<select
										value={newBudget.fiscalYear}
										onChange={(e) => setNewBudget(prev => ({ ...prev, fiscalYear: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="2026">2026</option>
										<option value="2027">2027</option>
									</select>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Category</label>
									<select
										value={newBudget.category}
										onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-805 font-bold"
									>
										<option value="Fuel & Fleet Maintenance">Fuel & Fleet Maintenance</option>
										<option value="Rent & Utilities">Rent & Utilities</option>
										<option value="Imprest Petty Cash">Imprest Petty Cash</option>
										<option value="Wages & Salaries">Wages & Salaries</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Planned Limit Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 50000000"
									value={newBudget.planned}
									onChange={(e) => setNewBudget(prev => ({ ...prev, planned: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Save Budget Allocation
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
