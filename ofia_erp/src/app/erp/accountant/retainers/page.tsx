"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconPlus, 
	IconSearch,
	IconFileText,
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

interface Retainer {
	id: string;
	customerName: string;
	issueDate: string;
	dueDate: string;
	status: string;
	total: number;
	due: number;
}

export default function RetainersPage() {
	const router = useRouter();

	const [retainers, setRetainers] = useState<Retainer[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [selectedCustomer, setSelectedCustomer] = useState("All");
	const [selectedStatus, setSelectedStatus] = useState("All");
	
	const [activeCustomerFilter, setActiveCustomerFilter] = useState("All");
	const [activeStatusFilter, setActiveStatusFilter] = useState("All");

	const [showAddModal, setShowAddModal] = useState(false);
	const [newRetainer, setNewRetainer] = useState({
		customerName: "Dulux PLC",
		issueDate: "",
		dueDate: "",
		total: ""
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchRetainers = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/retainers`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.retainerNumber,
					customerName: item.clientName || "Unknown Client",
					issueDate: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					dueDate: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					status: item.status,
					total: item.amount,
					due: item.status === "Paid" ? 0 : item.amount
				}));
				setRetainers(mapped);
			}
		} catch (err) {
			console.error("Error fetching retainers:", err);
		}
	};

	const fetchClients = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/clients`);
			if (res.ok) {
				const data = await res.json();
				setClients(data);
			}
		} catch (err) {
			console.error("Error fetching clients:", err);
		}
	};

	React.useEffect(() => {
		fetchRetainers();
		fetchClients();
	}, []);

	const handleApplyFilters = () => {
		setActiveCustomerFilter(selectedCustomer);
		setActiveStatusFilter(selectedStatus);
	};

	const filteredRetainers = retainers.filter(r => {
		const matchesCustomer = activeCustomerFilter === "All" || r.customerName === activeCustomerFilter;
		const matchesStatus = activeStatusFilter === "All" || r.status === activeStatusFilter;
		return matchesCustomer && matchesStatus;
	});

	const handleAddRetainerSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const total = parseFloat(newRetainer.total) || 0;
		if (!newRetainer.customerName || total <= 0) {
			alert("Please fill in required fields.");
			return;
		}

		const matchedClient = clients.find(c => c.name.toLowerCase() === newRetainer.customerName.toLowerCase());
		const clientId = matchedClient ? matchedClient.id : (clients[0]?.id || "cli-1");

		const padNum = String(retainers.length + 1).padStart(5, "0");
		const rData = {
			retainerNumber: `RET${padNum}`,
			clientId: clientId,
			amount: total,
			status: "Pending"
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/retainers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(rData)
			});
			if (res.ok) {
				fetchRetainers();
			}
		} catch (err) {
			console.error("Error creating retainer:", err);
		}

		setShowAddModal(false);
		setNewRetainer({ customerName: "Dulux PLC", issueDate: "", dueDate: "", total: "" });
	};

	const handleDeleteRetainer = (id: string) => {
		if (confirm(`Are you sure you want to remove retainer ${id}?`)) {
			setRetainers(prev => prev.filter(r => r.id !== id));
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
			
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Retainers</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Advance payment requests linked to leads, customers, and proposals</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Create Retainer
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="retainers" colorTheme="red" />
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
				<div className="sm:col-span-5">
					<select
						value={selectedCustomer}
						onChange={(e) => setSelectedCustomer(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-750 font-bold"
					>
						<option value="All">All leads/customers</option>
						<option value="Dulux PLC">Dulux PLC</option>
						<option value="7UP Bottling Company">7UP Bottling Company</option>
						<option value="Global Logix">Global Logix</option>
					</select>
				</div>

				<div className="sm:col-span-5">
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-750 font-bold"
					>
						<option value="All">All statuses</option>
						<option value="Paid">Paid</option>
						<option value="Unpaid">Unpaid</option>
						<option value="Partially Paid">Partially Paid</option>
					</select>
				</div>

				<div className="sm:col-span-2">
					<button
						onClick={handleApplyFilters}
						className="w-full py-2 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
					>
						Filter
					</button>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Retainer</th>
							<th className="pb-3 min-w-[180px]">Customer</th>
							<th className="pb-3 min-w-[110px]">Issue Date</th>
							<th className="pb-3 min-w-[110px]">Due Date</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 min-w-[120px]">Total</th>
							<th className="pb-3 min-w-[120px]">Due</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredRetainers.length > 0 ? (
							filteredRetainers.map((ret) => (
								<tr key={ret.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${ret.id}`}</p>
									</td>
									<td className="py-4 text-slate-800">{ret.customerName}</td>
									<td className="py-4 text-slate-550">{ret.issueDate}</td>
									<td className="py-4 text-slate-550">{ret.dueDate}</td>
									<td className="py-4">
										<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
											ret.status === "Paid" 
												? "bg-emerald-50 border-emerald-100 text-emerald-700" 
												: "bg-amber-50 border-amber-100 text-amber-700"
										}`}>
											{ret.status}
										</span>
									</td>
									<td className="py-4 text-slate-800 font-bold">{formatNaira(ret.total)}</td>
									<td className="py-4 text-red-500 font-bold">{formatNaira(ret.due)}</td>
									<td className="py-4 text-right">
										<button
											onClick={() => handleDeleteRetainer(ret.id)}
											className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
										>
											<IconTrash className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-bold">
									<div className="flex flex-col items-center justify-center gap-2">
										<IconFileText className="w-8 h-8 text-slate-300" />
										<span>- No record found. -</span>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* CREATE RETAINER MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Create Retainer Request</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Log an advance project deposit request</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddRetainerSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Customer / Lead</label>
								<select
									value={newRetainer.customerName}
									onChange={(e) => setNewRetainer(prev => ({ ...prev, customerName: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="Dulux PLC">Dulux PLC</option>
									<option value="7UP Bottling Company">7UP Bottling Company</option>
									<option value="Global Logix">Global Logix</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Issue Date</label>
									<input
										type="date"
										required
										value={newRetainer.issueDate}
										onChange={(e) => setNewRetainer(prev => ({ ...prev, issueDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Due Date</label>
									<input
										type="date"
										required
										value={newRetainer.dueDate}
										onChange={(e) => setNewRetainer(prev => ({ ...prev, dueDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Total Deposit Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 150000"
									value={newRetainer.total}
									onChange={(e) => setNewRetainer(prev => ({ ...prev, total: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Create Retainer
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
