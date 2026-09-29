"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconUpload,
	IconFilter,
	IconTrash
} from "@tabler/icons-react";

const CLIENTS_TABS = [
	{ id: "clients", label: "Clients", slug: "/accountant/clients" },
	{ id: "proposals", label: "Proposals", slug: "/accountant/proposals" },
	{ id: "estimates", label: "Estimates", slug: "/accountant/estimates" },
	{ id: "orders", label: "Orders", slug: "/accountant/orders" },
	{ id: "invoices", label: "Invoices", slug: "/accountant/invoices" },
	{ id: "payments", label: "Payments", slug: "/accountant/payments" },
	{ id: "credit-notes", label: "Credit Notes", slug: "/accountant/credit-notes" },
	{ id: "retainers", label: "Retainers", slug: "/accountant/retainers" }
];

interface Payment {
	id: string;
	dtRowIndex: number;
	code: string;
	project: string;
	invoiceNumber: string;
	clientName: string;
	orderNumber: string;
	amount: number;
	paidOn: string;
	gateway: string;
	status: string;
}

export default function PaymentsPage() {
	const router = useRouter();

	const [payments, setPayments] = useState<Payment[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedClientFilter, setSelectedClientFilter] = useState("All");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);

	const [newPayment, setNewPayment] = useState({
		clientName: "7UP Bottling Company",
		invoiceNumber: "INV-109",
		amount: "",
		paidOn: "",
		gateway: "Bank Transfer"
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchPayments = async () => {
		try {
			// Fetch all credit transactions (revenue collections)
			const res = await fetch(`${FINANCE_API_URL}/transactions`);
			if (res.ok) {
				const data = await res.json();
				// Filter for type == "Credit" (Revenue)
				const credits = data.filter((item: any) => item.type === "Credit");
				const mapped = credits.map((item: any, index: number) => {
					// Extract client name from description if format is "Payment received from [Client]"
					let clientName = "Unknown Client";
					if (item.description && item.description.includes("received from ")) {
						clientName = item.description.split("received from ")[1].split(" for")[0];
					} else if (item.description) {
						clientName = item.description;
					}
					return {
						id: item.id,
						dtRowIndex: index + 1,
						code: "--",
						project: "--",
						invoiceNumber: item.referenceId || "N/A",
						clientName: clientName,
						orderNumber: "ORD-000",
						amount: item.amount,
						paidOn: item.date ? item.date.split("-").reverse().join("-") : "",
						gateway: item.category || "Bank Transfer",
						status: "Complete"
					};
				});
				setPayments(mapped);
			}
		} catch (err) {
			console.error("Error fetching payments:", err);
		}
	};

	React.useEffect(() => {
		fetchPayments();
		setNewPayment(prev => ({ ...prev, paidOn: new Date().toISOString().split("T")[0] }));
	}, []);

	const filteredPayments = payments.filter(p => {
		const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
			p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.gateway.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesClient = selectedClientFilter === "All" || p.clientName === selectedClientFilter;
		return matchesSearch && matchesClient;
	});

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedIds(filteredPayments.map(p => p.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: string) => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		);
	};

	const handleAddPaymentSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPayment.clientName || !newPayment.amount || !newPayment.paidOn) {
			alert("Please fill in required fields.");
			return;
		}

		const txData = {
			referenceId: newPayment.invoiceNumber,
			type: "Credit",
			category: newPayment.gateway,
			amount: parseFloat(newPayment.amount) || 0,
			date: newPayment.paidOn,
			description: `Payment received from ${newPayment.clientName} for invoice ${newPayment.invoiceNumber}`
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/transactions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(txData)
			});
			if (res.ok) {
				fetchPayments();
			}
		} catch (err) {
			console.error("Error creating transaction:", err);
		}

		setShowAddModal(false);
		setNewPayment({ clientName: "7UP Bottling Company", invoiceNumber: "INV-109", amount: "", paidOn: new Date().toISOString().split("T")[0], gateway: "Bank Transfer" });
	};

	const handleDeleteBatch = () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected record(s)?`)) {
			setPayments(prev => prev.filter(p => !selectedIds.includes(p.id)));
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
			
			{/* Top Filters Block */}
			<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pb-4 border-b border-gray-50">
				<div className="md:col-span-3">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Duration</label>
					<input
						type="text"
						placeholder="Start Date To End Date"
						className="w-full px-3 py-2 bg-gray-50 border border-gray-250 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
					/>
				</div>

				<div className="md:col-span-3">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Client</label>
					<select
						value={selectedClientFilter}
						onChange={(e) => setSelectedClientFilter(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-250 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
					>
						<option value="All">All clients</option>
						<option value="Ecologique Transport Solution">Ecologique Transport Solution</option>
						<option value="7UP Bottling Company">7UP Bottling Company</option>
						<option value="IHS - Holding Limited">IHS - Holding Limited</option>
					</select>
				</div>

				<div className="md:col-span-4 relative mt-4 md:mt-0">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Search</label>
					<div className="relative">
						<input
							type="text"
							placeholder="Start typing to search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
						/>
						<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					</div>
				</div>

				<div className="md:col-span-2 pt-5">
					<button
						onClick={() => alert("Apply filters...")}
						className="w-full py-2 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
					>
						<IconFilter className="w-3.5 h-3.5" />
						Filters
					</button>
				</div>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="payments" colorTheme="red" />
			</div>

			{/* Table Actions Row */}
			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconPlus className="w-4 h-4" />
					Add Payment
				</button>
				<button
					onClick={() => alert("Import CSV payment adjustments...")}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconUpload className="w-4 h-4" />
					Import
				</button>
				<button
					onClick={() => alert("Bulk capture form...")}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconPlus className="w-4 h-4" />
					Add Bulk Payment
				</button>
				<button
					onClick={() => alert("Export payment list...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconDownload className="w-4 h-4 text-slate-400" />
					Export
				</button>
				{selectedIds.length > 0 && (
					<button
						onClick={handleDeleteBatch}
						className="px-4 py-2.5 bg-red-105 hover:bg-red-200 text-red-600 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none shadow-sm"
					>
						<IconTrash className="w-4 h-4" />
						Delete Selected ({selectedIds.length})
					</button>
				)}
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 w-12 pr-3">
								<input
									type="checkbox"
									onChange={handleSelectAll}
									checked={filteredPayments.length > 0 && selectedIds.length === filteredPayments.length}
									className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
								/>
							</th>
							<th className="pb-3 min-w-[120px]">D T Row Index</th>
							<th className="pb-3 min-w-[80px]">Code</th>
							<th className="pb-3 min-w-[80px]">Project</th>
							<th className="pb-3 min-w-[100px]">Invoice#</th>
							<th className="pb-3 min-w-[180px]">Client</th>
							<th className="pb-3 min-w-[100px]">Order#</th>
							<th className="pb-3 min-w-[130px]">Amount</th>
							<th className="pb-3 min-w-[110px]">Paid On</th>
							<th className="pb-3 min-w-[150px]">Payment Gateway</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-16">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredPayments.length > 0 ? (
							filteredPayments.map((p) => (
								<tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 pr-3">
										<input
											type="checkbox"
											checked={selectedIds.includes(p.id)}
											onChange={() => handleSelectRow(p.id)}
											className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
										/>
									</td>
									<td className="py-4 text-slate-500 font-bold">{p.dtRowIndex}</td>
									<td className="py-4 text-slate-400 font-mono">{p.code}</td>
									<td className="py-4 text-slate-400 font-mono">{p.project}</td>
									<td className="py-4 text-slate-800 font-mono">{p.invoiceNumber}</td>
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{p.clientName}</p>
									</td>
									<td className="py-4 text-slate-500 font-mono">{p.orderNumber}</td>
									<td className="py-4 text-emerald-600 font-bold">{formatNaira(p.amount)}</td>
									<td className="py-4 text-slate-550">{p.paidOn}</td>
									<td className="py-4 text-slate-600">{p.gateway}</td>
									<td className="py-4">
										<span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
											{p.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<button
											onClick={() => setPayments(prev => prev.filter(x => x.id !== p.id))}
											className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
											title="Delete Record"
										>
											<IconTrash className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={12} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No data available in table
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination area */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
				<div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
					<span>Show</span>
					<select className="px-1.5 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-extrabold text-slate-700">
						<option value={10}>10</option>
					</select>
					<span>entries</span>
				</div>
				<p className="text-[11px] text-slate-455 font-bold">
					{`Showing 0 to ${filteredPayments.length} of ${filteredPayments.length} entries`}
				</p>
				<div className="flex items-center gap-1">
					<button className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-400 rounded-xl text-[10px] font-extrabold cursor-not-allowed" disabled>
						Previous
					</button>
					<button className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-400 rounded-xl text-[10px] font-extrabold cursor-not-allowed" disabled>
						Next
					</button>
				</div>
			</div>

			{/* ADD PAYMENT MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add Client Payment Record</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Manually log a cash or wire adjustment receipt</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddPaymentSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Client</label>
								<select
									value={newPayment.clientName}
									onChange={(e) => setNewPayment(prev => ({ ...prev, clientName: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="7UP Bottling Company">7UP Bottling Company</option>
									<option value="Ecologique Transport Solution">Ecologique Transport Solution</option>
									<option value="IHS - Holding Limited">IHS - Holding Limited</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Invoice#</label>
									<input
										type="text"
										required
										placeholder="INV-109"
										value={newPayment.invoiceNumber}
										onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceNumber: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Paid On</label>
									<input
										type="date"
										required
										value={newPayment.paidOn}
										onChange={(e) => setNewPayment(prev => ({ ...prev, paidOn: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Amount (NGN)</label>
									<input
										type="number"
										required
										placeholder="e.g. 75000"
										value={newPayment.amount}
										onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Gateway</label>
									<select
										value={newPayment.gateway}
										onChange={(e) => setNewPayment(prev => ({ ...prev, gateway: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="Bank Transfer">Bank Transfer</option>
										<option value="Cash">Cash</option>
										<option value="Card">Card</option>
										<option value="Monie Point">Monie Point</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Add Payment Receipt
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
