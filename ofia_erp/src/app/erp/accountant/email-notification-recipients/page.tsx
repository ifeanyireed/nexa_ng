"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconSearch,
	IconTrash,
	IconCheck
} from "@tabler/icons-react";

const PAYMENTS_TABS = [
	{ id: "payment-processing", label: "Payment Processing", slug: "/accountant/payment-processing" },
	{ id: "expenses", label: "Expenses", slug: "/accountant/expenses" },
	{ id: "payroll", label: "Payroll", slug: "/accountant/payment-payroll" },
	{ id: "payroll-processing", label: "Payroll Payment Processing", slug: "/accountant/payroll-payment-processing" },
	{ id: "statutory-remittances", label: "Statutory Remittances", slug: "/accountant/statutory-remittances" },
	{ id: "employee-salaries", label: "Employee Salaries", slug: "/accountant/employee-salaries" },
	{ id: "email-recipients", label: "Email Notification Recipients", slug: "/accountant/email-notification-recipients" }
];

interface Recipient {
	id: string;
	name: string;
	email: string;
	role: string;
	frequency: string;
	status: string;
}

export default function EmailNotificationRecipientsPage() {
	const router = useRouter();

	const [recipients, setRecipients] = useState<Recipient[]>([
		{ id: "R-01", name: "Oluwatobiloba Olateju", email: "olateju.o@neweratransport.com", role: "CFO / Finance", frequency: "Instantly on Payout", status: "Active" },
		{ id: "R-02", name: "Queen Okonkwo", email: "queen.o@neweratransport.com", role: "Finance Lead", frequency: "Instantly on Payout", status: "Active" },
		{ id: "R-03", name: "Ifeanyi Ibeh", email: "ibeanyi.i@neweratransport.com", role: "Managing Director", frequency: "Daily Payout Digests", status: "Active" }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	const [newRecipient, setNewRecipient] = useState({
		name: "",
		email: "",
		role: "CFO / Finance",
		frequency: "Instantly on Payout"
	});

	const filtered = recipients.filter(r =>
		r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		r.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddRecipient = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newRecipient.name || !newRecipient.email) {
			alert("Please fill in all fields");
			return;
		}

		const r: Recipient = {
			id: `R-${Date.now()}`,
			name: newRecipient.name,
			email: newRecipient.email,
			role: newRecipient.role,
			frequency: newRecipient.frequency,
			status: "Active"
		};

		setRecipients(prev => [...prev, r]);
		setShowAddModal(false);
		setNewRecipient({ name: "", email: "", role: "CFO / Finance", frequency: "Instantly on Payout" });
	};

	const handleDeleteRecipient = (id: string) => {
		if (confirm("Are you sure you want to remove this notification recipient?")) {
			setRecipients(prev => prev.filter(r => r.id !== id));
		}
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Email Notification Recipients</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Configure automated email recipients for payroll payments and ledger disbursement logs</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Add Recipient
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{PAYMENTS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "email-recipients"
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
						placeholder="Search recipients..."
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
							<th className="pb-3 min-w-[200px]">Recipient Name</th>
							<th className="pb-3 min-w-[220px]">Email Address</th>
							<th className="pb-3 min-w-[150px]">Role / Section</th>
							<th className="pb-3 min-w-[180px]">Notification Frequency</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filtered.map((r) => (
							<tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
								<td className="py-4 text-slate-800 font-bold">{r.name}</td>
								<td className="py-4 text-blue-600 font-mono">{r.email}</td>
								<td className="py-4 text-slate-600">{r.role}</td>
								<td className="py-4 text-slate-550">{r.frequency}</td>
								<td className="py-4">
									<span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
										{r.status}
									</span>
								</td>
								<td className="py-4 text-right">
									<button
										onClick={() => handleDeleteRecipient(r.id)}
										className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
									>
										<IconTrash className="w-4 h-4" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* ADD RECIPIENT MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add Alert Recipient</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Subscribe user to automated transaction reports</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddRecipient} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Recipient Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Queen Okonkwo"
									value={newRecipient.name}
									onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
								<input
									type="email"
									required
									placeholder="e.g. queen@neweratransport.com"
									value={newRecipient.email}
									onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">User Role</label>
									<select
										value={newRecipient.role}
										onChange={(e) => setNewRecipient(prev => ({ ...prev, role: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 font-bold"
									>
										<option value="CFO / Finance">CFO / Finance</option>
										<option value="Finance Lead">Finance Lead</option>
										<option value="Managing Director">Managing Director</option>
									</select>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Frequency</label>
									<select
										value={newRecipient.frequency}
										onChange={(e) => setNewRecipient(prev => ({ ...prev, frequency: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 font-bold"
									>
										<option value="Instantly on Payout">Instantly on Payout</option>
										<option value="Daily Payout Digests">Daily Payout Digests</option>
										<option value="Weekly Executive Digest">Weekly Executive Digest</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Confirm Subscription
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
