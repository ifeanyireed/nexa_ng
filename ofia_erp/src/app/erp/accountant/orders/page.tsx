"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconFilter,
	IconDotsVertical,
	IconTrash
} from "@tabler/icons-react";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";

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

interface Order {
	id: string;
	client: string;
	total: number;
	orderDate: string;
	note: string;
	status: "Pending" | "Completed" | "Cancelled";
}

export default function OrdersPage() {
	const router = useRouter();

	const [orders, setOrders] = useState<Order[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedClientFilter, setSelectedClientFilter] = useState("All");
	const [showAddModal, setShowAddModal] = useState(false);
	const [pageSize, setPageSize] = useState(10);

	const [newOrder, setNewOrder] = useState({
		client: "",
		total: "",
		orderDate: "",
		note: "",
		status: "Pending" as "Pending" | "Completed" | "Cancelled"
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchOrders = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/orders`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.id,
					client: item.client,
					total: item.total,
					orderDate: item.orderDate ? item.orderDate.split("-").reverse().join("-") : "",
					note: item.note || "No note",
					status: item.status
				}));
				setOrders(mapped);
			}
		} catch (err) {
			console.error("Error fetching orders:", err);
		}
	};

	React.useEffect(() => {
		fetchOrders();
	}, []);

	const filteredOrders = orders.filter(o => {
		const matchesSearch = o.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
			o.note.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesClient = selectedClientFilter === "All" || o.client === selectedClientFilter;
		return matchesSearch && matchesClient;
	});

	const handleAddOrderSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newOrder.client || !newOrder.total || !newOrder.orderDate) {
			alert("Please fill in all required fields.");
			return;
		}

		const orderData = {
			client: newOrder.client,
			total: parseFloat(newOrder.total) || 0,
			orderDate: newOrder.orderDate,
			note: newOrder.note || "No note",
			status: newOrder.status
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/orders`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(orderData)
			});
			if (res.ok) {
				fetchOrders();
			}
		} catch (err) {
			console.error("Error creating order:", err);
		}

		setShowAddModal(false);
		setNewOrder({ client: "", total: "", orderDate: "", note: "", status: "Pending" });
	};

	const handleDeleteOrder = async (id: string) => {
		if (confirm(`Are you sure you want to delete order ${id}?`)) {
			try {
				const res = await fetch(`${FINANCE_API_URL}/orders?id=${id}`, {
					method: "DELETE"
				});
				if (res.ok) {
					fetchOrders();
				}
			} catch (err) {
				console.error("Error deleting order:", err);
			}
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
						className="w-full px-3 py-2 bg-gray-50 border border-gray-255 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
					/>
				</div>

				<div className="md:col-span-3">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Client</label>
					<select
						value={selectedClientFilter}
						onChange={(e) => setSelectedClientFilter(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-255 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
					>
						<option value="All">All</option>
						{Array.from(new Set(orders.map(o => o.client))).map(c => (
							<option key={c} value={c}>{c}</option>
						))}
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
							className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
						/>
						<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					</div>
				</div>

				<div className="md:col-span-2 pt-5">
					<button
						onClick={() => alert("Apply filters...")}
						className="w-full py-2 bg-white hover:bg-slate-50 border border-gray-250 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
					>
						<IconFilter className="w-3.5 h-3.5" />
						Filters
					</button>
				</div>
			</div>

			{/* Sub-menu Tabs */}
			<div className="bg-white p-2.5 rounded-2xl border border-gray-55 flex items-center">
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="orders" colorTheme="red" />
			</div>

			{/* Actions Row */}
			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconPlus className="w-4 h-4" />
					Add New Order
				</button>
				<button
					onClick={() => alert("CSV Export Triggered")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconDownload className="w-4 h-4 text-slate-400" />
					Export
				</button>
			</div>

			{/* Table Block */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[200px]">Client</th>
							<th className="pb-3 min-w-[120px]">Total</th>
							<th className="pb-3 min-w-[140px]">Order Date</th>
							<th className="pb-3 min-w-[250px]">Note</th>
							<th className="pb-3 min-w-[110px]">Status</th>
							<th className="pb-3 text-right w-16">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50 text-xs font-semibold text-slate-700">
						{filteredOrders.length > 0 ? (
							filteredOrders.map((o) => (
								<tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
									<td className="py-4 text-slate-800 font-bold">{o.client}</td>
									<td className="py-4 text-slate-850 font-black">{formatNaira(o.total)}</td>
									<td className="py-4 text-slate-550 font-mono">{o.orderDate}</td>
									<td className="py-4 text-slate-455 max-w-xs truncate">{o.note}</td>
									<td className="py-4">
										<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
											o.status === "Completed"
												? "bg-emerald-50 border-emerald-100 text-emerald-700"
												: o.status === "Cancelled"
												? "bg-red-50 border-red-100 text-red-750"
												: "bg-amber-50 border-amber-100 text-amber-700"
										}`}>
											{o.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<button 
											onClick={() => handleDeleteOrder(o.id)}
											className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
										>
											<IconTrash className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
									No data available in table
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination Footer */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-55 text-xs text-slate-500">
				<div className="flex items-center gap-2">
					<span>Show</span>
					<select 
						value={pageSize}
						onChange={(e) => setPageSize(parseInt(e.target.value))}
						className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
					<span>entries</span>
				</div>
				<div>
					Showing {filteredOrders.length > 0 ? 1 : 0} to {filteredOrders.length} of {filteredOrders.length} entries
				</div>
				<div className="flex gap-2">
					<button className="px-3 py-1.5 border border-gray-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors font-semibold">Previous</button>
					<button className="px-3 py-1.5 border border-gray-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors font-semibold">Next</button>
				</div>
			</div>

			{/* ADD ORDER MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-left">
						<div>
							<h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Add New Order</h3>
							<p className="text-[11px] text-slate-400 font-semibold mt-0.5">Log a customer order into the general sales record</p>
						</div>

						<form onSubmit={handleAddOrderSubmit} className="flex flex-col gap-4">
							<div>
								<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Client Name</label>
								<input
									type="text"
									placeholder="e.g. Dangote Group Plc"
									value={newOrder.client}
									onChange={(e) => setNewOrder(prev => ({ ...prev, client: e.target.value }))}
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
									required
								/>
							</div>

							<div>
								<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Total Amount (NGN)</label>
								<input
									type="number"
									placeholder="e.g. 150000"
									value={newOrder.total}
									onChange={(e) => setNewOrder(prev => ({ ...prev, total: e.target.value }))}
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
									required
								/>
							</div>

							<div>
								<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Order Date</label>
								<input
									type="date"
									value={newOrder.orderDate}
									onChange={(e) => setNewOrder(prev => ({ ...prev, orderDate: e.target.value }))}
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
									required
								/>
							</div>

							<div>
								<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Note / Description</label>
								<textarea
									placeholder="Provide brief transaction context..."
									value={newOrder.note}
									onChange={(e) => setNewOrder(prev => ({ ...prev, note: e.target.value }))}
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 min-h-20 resize-none"
								/>
							</div>

							<div>
								<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Status</label>
								<select
									value={newOrder.status}
									onChange={(e) => setNewOrder(prev => ({ ...prev, status: e.target.value as any }))}
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 font-bold"
								>
									<option value="Pending">Pending</option>
									<option value="Completed">Completed</option>
									<option value="Cancelled">Cancelled</option>
								</select>
							</div>

							<div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors border-none"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors border-none shadow-sm"
								>
									Create Order
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
