"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconFileText,
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

interface Estimate {
	id: string;
	clientName: string;
	total: number;
	validTill: string;
	createdDate: string;
	status: string;
}

export default function EstimatesPage() {
	const router = useRouter();

	const [estimates, setEstimates] = useState<Estimate[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
	const [showAddModal, setShowAddModal] = useState(false);

	const [newEstimate, setNewEstimate] = useState({
		clientName: "",
		total: "",
		validTill: "",
		createdDate: ""
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchEstimates = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/estimates`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.estimateNumber,
					clientName: item.clientName || "Unknown Client",
					total: item.amount,
					validTill: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "", // estimates do not have explicit valid till, we fallback
					createdDate: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					status: item.status
				}));
				setEstimates(mapped);
			}
		} catch (err) {
			console.error("Error fetching estimates:", err);
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
		fetchEstimates();
		fetchClients();
	}, []);

	const filteredEstimates = estimates.filter(est => {
		const matchesSearch = est.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || est.id.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = selectedStatusFilter === "All" || est.status === selectedStatusFilter;
		return matchesSearch && matchesStatus;
	});

	const handleAddEstimateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEstimate.clientName || !newEstimate.total) {
			alert("Please fill in all required fields.");
			return;
		}

		const matchedClient = clients.find(c => c.name.toLowerCase() === newEstimate.clientName.toLowerCase());
		const clientId = matchedClient ? matchedClient.id : (clients[0]?.id || "cli-1");

		const padNum = String(estimates.length + 1).padStart(5, "0");
		const estData = {
			estimateNumber: `EST${padNum}`,
			clientId: clientId,
			amount: parseFloat(newEstimate.total) || 0,
			status: "Waiting"
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/estimates`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(estData)
			});
			if (res.ok) {
				fetchEstimates();
			}
		} catch (err) {
			console.error("Error creating estimate:", err);
		}

		setShowAddModal(false);
		setNewEstimate({ clientName: "", total: "", validTill: "", createdDate: "" });
	};

	const handleDeleteEstimate = (id: string) => {
		if (confirm(`Are you sure you want to remove estimate ${id}?`)) {
			setEstimates(prev => prev.filter(e => e.id !== id));
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
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Status</label>
					<select
						value={selectedStatusFilter}
						onChange={(e) => setSelectedStatusFilter(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-250 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
					>
						<option value="All">All statuses</option>
						<option value="Waiting">Waiting</option>
						<option value="Accepted">Accepted</option>
						<option value="Declined">Declined</option>
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
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="estimates" colorTheme="red" />
			</div>

			{/* Table Actions Row */}
			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => setShowAddModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconPlus className="w-4 h-4" />
					Create Estimate
				</button>
				<button
					onClick={() => alert("Estimate templates settings...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconFileText className="w-4 h-4 text-slate-400" />
					Estimate Template
				</button>
				<button
					onClick={() => alert("Export estimates CSV...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-850 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconDownload className="w-4 h-4 text-slate-400" />
					Export
				</button>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Estimate</th>
							<th className="pb-3 min-w-[180px]">Client</th>
							<th className="pb-3 min-w-[130px]">Total</th>
							<th className="pb-3 min-w-[110px]">Valid Till</th>
							<th className="pb-3 min-w-[110px]">Created Date</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredEstimates.length > 0 ? (
							filteredEstimates.map((est) => (
								<tr key={est.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${est.id}`}</p>
									</td>
									<td className="py-4 text-slate-800">{est.clientName}</td>
									<td className="py-4 font-bold text-slate-750">{formatNaira(est.total)}</td>
									<td className="py-4 text-slate-550">{est.validTill}</td>
									<td className="py-4 text-slate-550">{est.createdDate}</td>
									<td className="py-4">
										<span className="bg-amber-50 text-amber-700 border border-amber-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
											{est.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<button
											onClick={() => handleDeleteEstimate(est.id)}
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
					{`Showing 0 to ${filteredEstimates.length} of ${filteredEstimates.length} entries`}
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

			{/* CREATE ESTIMATE MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Create Client Estimate</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Formulate a project estimate or quotation</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddEstimateSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Client Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Ecologique Transport"
									value={newEstimate.clientName}
									onChange={(e) => setNewEstimate(prev => ({ ...prev, clientName: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Date Created</label>
									<input
										type="date"
										required
										value={newEstimate.createdDate}
										onChange={(e) => setNewEstimate(prev => ({ ...prev, createdDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Valid Till</label>
									<input
										type="date"
										required
										value={newEstimate.validTill}
										onChange={(e) => setNewEstimate(prev => ({ ...prev, validTill: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Estimated Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 350000"
									value={newEstimate.total}
									onChange={(e) => setNewEstimate(prev => ({ ...prev, total: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Create Estimate
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
