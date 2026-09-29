"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconDownload, 
	IconSearch,
	IconRefresh,
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

interface AuditRecord {
	id: string;
	timestamp: string;
	user: string;
	action: string;
	section: string;
	ip: string;
	details: string;
}

export default function AuditTrailPage() {
	const router = useRouter();

	const [audits, setAudits] = useState<AuditRecord[]>([
		{ id: "A-01", timestamp: "18-07-2026 12:15:32", user: "Oluwatobiloba Olateju", action: "Posted Journal Entry (JE-00002)", section: "Journal Entries", ip: "192.168.1.45", details: "Debited Providus Bank, Credited Globus Bank ₦49,000.00" },
		{ id: "A-02", timestamp: "18-07-2026 11:42:10", user: "Oluwatobiloba Olateju", action: "Created Retainer Request (RET00001)", section: "Retainers", ip: "192.168.1.45", details: "Logged deposit ₦150,000.00 for Dulux PLC" },
		{ id: "A-03", timestamp: "18-07-2026 10:15:02", user: "Oluwatobiloba Olateju", action: "Updated Client Profile", section: "Clients", ip: "192.168.1.45", details: "Changed VAT registration parameters for IHS Holding" }
	]);

	const [searchQuery, setSearchQuery] = useState("");

	const filteredAudits = audits.filter(a =>
		a.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
		a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
		a.section.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleClearLogs = () => {
		if (confirm("Are you sure you want to purge all active session audit logs?")) {
			setAudits([]);
		}
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Audit Trail</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Review ledger modification histories and general user action log sheets</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => alert("Exporting audit logs as PDF/Excel...")}
						className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all outline-none"
					>
						<IconDownload className="w-4 h-4 text-slate-455" />
						Export logs
					</button>
					<button
						onClick={handleClearLogs}
						className="px-4 py-2.5 bg-red-105 hover:bg-red-200 text-red-600 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none outline-none shadow-sm"
					>
						<IconTrash className="w-4 h-4" />
						Clear Logs
					</button>
				</div>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{TRANSACTIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "audit-trail"
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
						placeholder="Search audit trail..."
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
							<th className="pb-3 min-w-[150px]">Timestamp</th>
							<th className="pb-3 min-w-[150px]">User</th>
							<th className="pb-3 min-w-[200px]">Action Performed</th>
							<th className="pb-3 min-w-[120px]">Section</th>
							<th className="pb-3 min-w-[110px]">IP Address</th>
							<th className="pb-3 min-w-[250px]">Details</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredAudits.length > 0 ? (
							filteredAudits.map((a) => (
								<tr key={a.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 text-slate-550 font-mono">{a.timestamp}</td>
									<td className="py-4 text-slate-800 font-bold">{a.user}</td>
									<td className="py-4 text-slate-800">{a.action}</td>
									<td className="py-4">
										<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-gray-200">
											{a.section}
										</span>
									</td>
									<td className="py-4 text-slate-450 font-mono">{a.ip}</td>
									<td className="py-4 text-slate-500 leading-relaxed max-w-xs">{a.details}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No audit logs recorded matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

		</div>
	);
}
