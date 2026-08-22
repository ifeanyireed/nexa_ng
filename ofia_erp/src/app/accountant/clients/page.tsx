"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconUserPlus, 
	IconDownload, 
	IconUpload, 
	IconTrash,
	IconEdit, 
	IconLayoutGrid, 
	IconList, 
	IconSearch,
	IconChevronLeft,
	IconChevronRight
} from "@tabler/icons-react";

const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

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

interface Client {
	id: string | number;
	name: string;
	subName: string;
	email: string;
	category: string;
	status: string;
	created?: string;
	createdAt?: string;
	companyName: string;
	phone: string;
	website: string;
	vat: string;
}

const INITIAL_CLIENTS: Client[] = [
	{
		id: "cli-1",
		name: "Ecologique Transport Solution",
		subName: "Ecologique Transport Solution",
		email: "semiu.abolade@ecologiqueltd.com",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "Ecologique Transport Solution",
		phone: "08164473371",
		website: "https://www.ecologiqueltd.com",
		vat: ""
	},
	{
		id: "cli-2",
		name: "Dulux - Chemical & Allied Product PLC",
		subName: "Dulux - Chemical & Allied Product Plc",
		email: "careline@capplc.com",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "Dulux - Chemical & Allied Product PLC",
		phone: "08159492865",
		website: "https://duluxnigeria.com.ng",
		vat: ""
	},
	{
		id: "cli-3",
		name: "7UP Bottling Company",
		subName: "7Up Bottling Company",
		email: "info@sevenup.org",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "7UP Bottling Company",
		phone: "0805 6900 900",
		website: "https://www.sevenup.org",
		vat: ""
	},
	{
		id: "cli-4",
		name: "YNV - Teknowledge Operations Nigeria Ltd",
		subName: "Ymv - Teknowledge Operations Nigeria Ltd",
		email: "voke.dabonur@teknowledge.com",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "YMV - Teknowledge Operations Nigeria Ltd",
		phone: "08135771574",
		website: "https://teknowledge.com",
		vat: ""
	},
	{
		id: "cli-5",
		name: "GAIO System Nigeria ltd",
		subName: "Gaio System Nigeria Ltd",
		email: "esalomo@gaiosystem.com.ng",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "GAIO System Nigeria ltd",
		phone: "08028416180",
		website: "https://www.en.gaio.co.jp/company",
		vat: ""
	},
	{
		id: "cli-6",
		name: "IHS - Holding Limited",
		subName: "Ihs - Holding Limited",
		email: "hauwa.ohize@ihstowers.com",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "IHS - Holding Limited",
		phone: "+234 700 0777777",
		website: "https://www.ihstowers.com",
		vat: ""
	},
	{
		id: "cli-7",
		name: "Nigerian Bottling Company (NBC)",
		subName: "Nigerian Bottling Company (Nbc)",
		email: "reace.odimba@cchellenic.com",
		category: "COOPERATE CLIENT",
		status: "Active",
		created: "08-06-2026",
		companyName: "Nigerian Bottling Company (NBC)",
		phone: "08150594417",
		website: "https://www.coca-colahellenic.com",
		vat: ""
	},
	{
		id: "cli-8",
		name: "Yikodeen COMPANY LIMITED",
		subName: "Yikodeen Company Limited",
		email: "",
		category: "",
		status: "Active",
		created: "29-07-2025",
		companyName: "YIKODEEN COMPANY LIMITED",
		phone: "",
		website: "",
		vat: "19853071-0001"
	}
];

export default function AccountantClients() {
	const router = useRouter();

	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// UI State management
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const [activeDropdown, setActiveDropdown] = useState<string | number | null>(null);
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [pageSize, setPageSize] = useState(10);

	// Modals state
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);

	// Form States
	const [newClient, setNewClient] = useState<Omit<Client, "id" | "status" | "created" | "createdAt" | "updatedAt">>({
		name: "",
		subName: "",
		email: "",
		category: "COOPERATE CLIENT",
		companyName: "",
		phone: "",
		website: "",
		vat: ""
	});

	// Fetch all data from the finance microservice
	const fetchClients = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${FINANCE_API_URL}/clients`);
			if (res.ok) {
				const data = await res.json();
				setClients(data);
				setError(null);
			} else {
				throw new Error("Failed to fetch clients from server");
			}
		} catch (err) {
			console.warn("Unable to load clients from API, using local mock fallback.", err);
			setClients(prev => prev.length > 0 ? prev : INITIAL_CLIENTS);
			setError("Offline fallback data in use");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClients();
	}, []);

	// Filter clients list
	const filteredClients = clients.filter(c => {
		const query = searchQuery.toLowerCase();
		return (
			c.name.toLowerCase().includes(query) ||
			c.email.toLowerCase().includes(query) ||
			c.companyName.toLowerCase().includes(query) ||
			c.phone.toLowerCase().includes(query) ||
			c.website.toLowerCase().includes(query) ||
			c.vat.toLowerCase().includes(query)
		);
	});

	// Checkbox multi-select logic
	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedIds(filteredClients.map(c => c.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: string | number) => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		);
	};

	// Actions
	const handleAddClientSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const clientData = {
			name: newClient.name,
			subName: newClient.subName || newClient.name,
			email: newClient.email,
			category: newClient.category,
			status: "Active",
			companyName: newClient.companyName || newClient.name,
			phone: newClient.phone,
			website: newClient.website,
			vat: newClient.vat
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/clients`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(clientData)
			});
			if (res.ok) {
				fetchClients();
			} else {
				alert("Failed to save client to live database");
			}
		} catch (err) {
			console.error("API Error: ", err);
			// offline fallback
			setClients(prev => [...prev, { ...clientData, id: Date.now(), created: new Date().toLocaleDateString("en-GB").replace(/\//g, "-") }]);
		}

		setShowAddModal(false);
		setNewClient({
			name: "",
			subName: "",
			email: "",
			category: "COOPERATE CLIENT",
			companyName: "",
			phone: "",
			website: "",
			vat: ""
		});
	};

	const handleEditClientSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingClient) return;

		try {
			const res = await fetch(`${FINANCE_API_URL}/clients`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editingClient)
			});
			if (res.ok) {
				fetchClients();
			} else {
				alert("Failed to update client on live database");
			}
		} catch (err) {
			console.error("API Error: ", err);
			// offline fallback
			setClients(prev =>
				prev.map(c => (c.id === editingClient.id ? editingClient : c))
			);
		}

		setShowEditModal(false);
		setEditingClient(null);
	};

	const handleDeleteClient = async (id: string | number, name: string) => {
		if (confirm(`Are you sure you want to remove client "${name}"?`)) {
			try {
				const res = await fetch(`${FINANCE_API_URL}/clients?id=${id}`, {
					method: "DELETE"
				});
				if (res.ok) {
					fetchClients();
					setSelectedIds(prev => prev.filter(x => x !== id));
				} else {
					alert("Failed to delete client from database");
				}
			} catch (err) {
				console.error("API Error: ", err);
				// offline fallback
				setClients(prev => prev.filter(c => c.id !== id));
				setSelectedIds(prev => prev.filter(x => x !== id));
			}
		}
	};

	const handleDeleteBatch = async () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected client(s)?`)) {
			try {
				const idsParam = selectedIds.join(",");
				const res = await fetch(`${FINANCE_API_URL}/clients?id=${idsParam}`, {
					method: "DELETE"
				});
				if (res.ok) {
					fetchClients();
					setSelectedIds([]);
				} else {
					alert("Failed to delete clients from database");
				}
			} catch (err) {
				console.error("API Error: ", err);
				// offline fallback
				setClients(prev => prev.filter(c => !selectedIds.includes(c.id)));
				setSelectedIds([]);
			}
		}
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div>
				<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Clients</h2>
				<p className="text-xs text-slate-450 font-semibold mt-1">Manage corporate clients, contacts, and account statuses</p>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="clients" colorTheme="red" />
			</div>
			
			{/* Top Toolbars & Buttons */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				
				{/* Left side actions */}
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={() => setShowAddModal(true)}
						className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
					>
						<IconUserPlus className="w-4 h-4" />
						Add Client
					</button>

					<button
						onClick={() => alert("CSV Import Triggered")}
						className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
					>
						<IconUpload className="w-4 h-4 text-slate-400" />
						Import
					</button>

					<button
						onClick={() => alert("Export list as CSV")}
						className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-850 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
					>
						<IconDownload className="w-4 h-4 text-slate-400" />
						Export
					</button>

					<button
						onClick={handleDeleteBatch}
						disabled={selectedIds.length === 0}
						className={`px-4 py-2.5 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none outline-none shadow-sm ${
							selectedIds.length > 0 
								? "bg-red-500 hover:bg-red-650 text-white active:scale-95" 
								: "bg-red-100 text-red-300 cursor-not-allowed"
						}`}
					>
						<IconTrash className="w-4 h-4" />
						Export By Batch
					</button>
				</div>

				{/* Right side options */}
				<div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
					
					{/* Search bar */}
					<div className="relative w-full sm:w-64">
						<input
							type="text"
							placeholder="Search client..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
						/>
						<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					</div>

					{/* View mode toggle icons */}
					<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-xl text-[#64748b]">
						<button
							onClick={() => setViewMode("list")}
							className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none ${
								viewMode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent"
							}`}
							title="List View"
						>
							<IconList className="w-4 h-4" />
						</button>
						<button
							onClick={() => setViewMode("grid")}
							className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none ${
								viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent"
							}`}
							title="Grid View"
						>
							<IconLayoutGrid className="w-4 h-4" />
						</button>
					</div>

				</div>

			</div>

			{/* Main table section */}
			{viewMode === "list" ? (
				<div className="overflow-x-auto min-h-72">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
								<th className="pb-3 w-12 pr-3">
									<input
										type="checkbox"
										onChange={handleSelectAll}
										checked={filteredClients.length > 0 && selectedIds.length === filteredClients.length}
										className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
									/>
								</th>
								<th className="pb-3 w-8">#</th>
								<th className="pb-3 min-w-[200px]">Name</th>
								<th className="pb-3 min-w-[180px]">Email</th>
								<th className="pb-3 min-w-[140px]">Category</th>
								<th className="pb-3 w-20">Status</th>
								<th className="pb-3 min-w-[100px]">Created</th>
								<th className="pb-3 min-w-[200px]">Company Name</th>
								<th className="pb-3 min-w-[130px]">Office Phone Number</th>
								<th className="pb-3 min-w-[180px]">Official Website</th>
								<th className="pb-3 min-w-[130px]">GST/VAT Number</th>
								<th className="pb-3 text-right w-16">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{filteredClients.length > 0 ? (
								filteredClients.map((client, idx) => (
									<tr key={client.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold">
										<td className="py-4 pr-3">
											<input
												type="checkbox"
												checked={selectedIds.includes(client.id)}
												onChange={() => handleSelectRow(client.id)}
												className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
											/>
										</td>
										<td className="py-4 text-slate-400 font-mono">{idx + 1}</td>
										<td className="py-4">
											<p className="font-extrabold text-slate-800">{client.name}</p>
											<p className="text-[10px] text-slate-400 mt-0.5">{client.subName}</p>
										</td>
										<td className="py-4 text-slate-500">{client.email || "--"}</td>
										<td className="py-4 text-slate-500 text-[10px] font-bold">{client.category || "--"}</td>
										<td className="py-4">
											<span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
												{client.status}
											</span>
										</td>
										<td className="py-4 text-slate-500">
											{client.createdAt 
												? new Date(client.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
												: client.created || "--"}
										</td>
										<td className="py-4 text-slate-700">{client.companyName}</td>
										<td className="py-4 text-slate-600">{client.phone || "--"}</td>
										<td className="py-4">
											{client.website ? (
												<a 
													href={client.website} 
													target="_blank" 
													rel="noopener noreferrer" 
													className="text-blue-500 hover:text-blue-700 transition-colors truncate max-w-[160px] inline-block font-bold"
												>
													{client.website}
												</a>
											) : (
												<span className="text-slate-400">--</span>
											)}
										</td>
										<td className="py-4 text-slate-600 font-mono">{client.vat || "--"}</td>
										<td className="py-4 text-right relative">
											<div className="inline-block text-left">
												<button
													onClick={() => setActiveDropdown(activeDropdown === client.id ? null : client.id)}
													className="w-7 h-7 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-none bg-transparent"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01" />
													</svg>
												</button>

												{activeDropdown === client.id && (
													<>
														<div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
														<div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100/80 py-1.5 z-20 animate-fadeIn text-left">
															<button
																onClick={() => {
																	setActiveDropdown(null);
																	setEditingClient(client);
																	setShowEditModal(true);
																}}
																className="w-full px-3 py-2 text-xs font-bold text-blue-650 hover:bg-blue-50/50 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
															>
																<IconEdit className="w-4 h-4 text-blue-500" />
																Edit
															</button>
															<button
																onClick={() => {
																	setActiveDropdown(null);
																	handleDeleteClient(client.id, client.name);
																}}
																className="w-full px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50/50 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
															>
																<IconTrash className="w-4 h-4 text-red-500" />
																Delete
															</button>
														</div>
													</>
												)}
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={12} className="py-12 text-center text-slate-400">
										No clients found matching the search query.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			) : (
				/* Grid view cards */
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[300px]">
					{filteredClients.length > 0 ? (
						filteredClients.map((client) => (
							<div key={client.id} className="border border-slate-100 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.01] bg-white">
								<div className="flex flex-col gap-3">
									<div className="flex justify-between items-start">
										<span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">
											{client.category || "General"}
										</span>
										<span className="flex items-center gap-1 text-emerald-700 font-bold text-[9px] uppercase">
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
											Active
										</span>
									</div>
									<div>
										<h4 className="font-extrabold text-slate-800 text-sm">{client.name}</h4>
										<p className="text-[10px] text-slate-400 mt-0.5">{client.subName}</p>
									</div>
									<div className="flex flex-col gap-1 text-xs text-slate-500 mt-2">
										<p className="truncate"><span className="text-slate-400 font-bold">Email:</span> {client.email || "--"}</p>
										<p><span className="text-slate-400 font-bold">Phone:</span> {client.phone || "--"}</p>
										<p className="truncate"><span className="text-slate-400 font-bold">Web:</span> {client.website || "--"}</p>
										{client.vat && <p><span className="text-slate-400 font-bold">VAT:</span> {client.vat}</p>}
									</div>
								</div>
								
								<div className="flex justify-end gap-2 border-t border-slate-50 pt-3 mt-4">
									<button
										onClick={() => {
											setEditingClient(client);
											setShowEditModal(true);
										}}
										className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none cursor-pointer"
										title="Edit Client"
									>
										<IconEdit className="w-4 h-4" />
									</button>
									<button
										onClick={() => handleDeleteClient(client.id, client.name)}
										className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border-none cursor-pointer"
										title="Delete Client"
									>
										<IconTrash className="w-4 h-4" />
									</button>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full py-12 text-center text-slate-400">
							No clients found matching the search query.
						</div>
					)}
				</div>
			)}

			{/* Pagination controls */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 text-xs font-semibold text-slate-500 select-none">
				<div className="flex items-center gap-1.5">
					Show 
					<select 
						value={pageSize}
						onChange={(e) => setPageSize(parseInt(e.target.value))}
						className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 bg-white font-bold outline-none cursor-pointer focus:border-blue-500"
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
					entries
				</div>
				<p>Showing 1 to {filteredClients.length} of {filteredClients.length} entries</p>
				<div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
					<button 
						disabled
						className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 bg-transparent border-none cursor-not-allowed"
					>
						<IconChevronLeft className="w-4 h-4" />
					</button>
					<button className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 text-white font-bold border-none cursor-pointer shadow-sm shadow-red-500/10">
						1
					</button>
					<button 
						disabled
						className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 bg-transparent border-none cursor-not-allowed"
					>
						<IconChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* MODAL: ADD NEW CLIENT */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						
						{/* Header */}
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add New Client Record</h3>
								<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Integrate a new corporate client into the ledger system</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleAddClientSubmit} className="p-6 flex flex-col gap-4 text-left">
							
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Client Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Dangote Group Plc"
									value={newClient.name}
									onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Sub Name / Alias (Optional)</label>
								<input
									type="text"
									placeholder="e.g. Dangote Group"
									value={newClient.subName}
									onChange={(e) => setNewClient(prev => ({ ...prev, subName: e.target.value }))}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3.5">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
									<input
										type="email"
										placeholder="e.g. billing@dangote.com"
										value={newClient.email}
										onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Category</label>
									<select
										value={newClient.category}
										onChange={(e) => setNewClient(prev => ({ ...prev, category: e.target.value }))}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="COOPERATE CLIENT">COOPERATE CLIENT</option>
										<option value="RETAIL CLIENT">RETAIL CLIENT</option>
										<option value="INDIVIDUAL CLIENT">INDIVIDUAL CLIENT</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Company Registered Name</label>
								<input
									type="text"
									placeholder="Official corporate registered name"
									value={newClient.companyName}
									onChange={(e) => setNewClient(prev => ({ ...prev, companyName: e.target.value }))}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3.5">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Office Phone Number</label>
									<input
										type="text"
										placeholder="e.g. 08164473371"
										value={newClient.phone}
										onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Official Website URL</label>
									<input
										type="url"
										placeholder="https://example.com"
										value={newClient.website}
										onChange={(e) => setNewClient(prev => ({ ...prev, website: e.target.value }))}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">GST / VAT Registration Number</label>
								<input
									type="text"
									placeholder="e.g. 19853071-0001"
									value={newClient.vat}
									onChange={(e) => setNewClient(prev => ({ ...prev, vat: e.target.value }))}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							{/* Actions */}
							<div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm border-none"
								>
									Register Client
								</button>
							</div>

						</form>
					</div>
				</div>
			)}

			{/* MODAL: EDIT CLIENT */}
			{showEditModal && editingClient && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						
						{/* Header */}
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Edit Client Record</h3>
								<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Modify properties for client code #{editingClient.id}</p>
							</div>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingClient(null);
								}}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleEditClientSubmit} className="p-6 flex flex-col gap-4 text-left">
							
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Client Name</label>
								<input
									type="text"
									required
									value={editingClient.name}
									onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Sub Name / Alias</label>
								<input
									type="text"
									value={editingClient.subName}
									onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, subName: e.target.value }) : null)}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3.5">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
									<input
										type="email"
										value={editingClient.email}
										onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Category</label>
									<select
										value={editingClient.category}
										onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="COOPERATE CLIENT">COOPERATE CLIENT</option>
										<option value="RETAIL CLIENT">RETAIL CLIENT</option>
										<option value="INDIVIDUAL CLIENT">INDIVIDUAL CLIENT</option>
										<option value="">None</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Company Registered Name</label>
								<input
									type="text"
									value={editingClient.companyName}
									onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, companyName: e.target.value }) : null)}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3.5">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Office Phone Number</label>
									<input
										type="text"
										value={editingClient.phone}
										onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Official Website URL</label>
									<input
										type="url"
										value={editingClient.website}
										onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, website: e.target.value }) : null)}
										className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">GST / VAT Registration Number</label>
								<input
									type="text"
									value={editingClient.vat}
									onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, vat: e.target.value }) : null)}
									className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							{/* Actions */}
							<div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={() => {
										setShowEditModal(false);
										setEditingClient(null);
									}}
									className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm border-none"
								>
									Save Changes
								</button>
							</div>

						</form>
					</div>
				</div>
			)}

		</div>
	);
}
