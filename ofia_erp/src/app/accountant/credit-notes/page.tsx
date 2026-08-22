"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
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

interface CreditNote {
	id: string;
	invoiceNumber: string;
	clientName: string;
	total: number;
	date: string;
	status: string;
}

export default function CreditNotesPage() {
	const router = useRouter();

	const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
	const [paidInvoicesMock, setPaidInvoicesMock] = useState<any[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedClientFilter, setSelectedClientFilter] = useState("All");

	const [selectedInvoiceForNote, setSelectedInvoiceForNote] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	
	const [newCreditNote, setNewCreditNote] = useState({
		amount: "",
		dateText: ""
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchCreditNotes = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/credit-notes`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.creditNoteNumber,
					invoiceNumber: item.invoiceId || "N/A",
					clientName: item.clientName || "Unknown Client",
					total: item.amount,
					date: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					status: item.status
				}));
				setCreditNotes(mapped);
			}
		} catch (err) {
			console.error("Error fetching credit notes:", err);
		}
	};

	const fetchInvoices = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/invoices`);
			if (res.ok) {
				const data = await res.json();
				// Filter paid/partial or simply allow all for mock
				setPaidInvoicesMock(data);
			}
		} catch (err) {
			console.error("Error fetching invoices:", err);
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
		fetchCreditNotes();
		fetchInvoices();
		fetchClients();
		setNewCreditNote({ amount: "", dateText: new Date().toISOString().split("T")[0] });
	}, []);

	const filteredCreditNotes = creditNotes.filter(cn => {
		const matchesSearch = cn.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
			cn.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cn.id.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesClient = selectedClientFilter === "All" || cn.clientName === selectedClientFilter;
		return matchesSearch && matchesClient;
	});

	const handleAddCreditNoteClick = () => {
		if (!selectedInvoiceForNote) {
			alert("Please select a paid or partial invoice first");
			return;
		}
		setShowAddModal(true);
	};

	const handleAddCreditNoteSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const amount = parseFloat(newCreditNote.amount);
		if (isNaN(amount) || amount <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		const selectedInvoice = paidInvoicesMock.find(inv => inv.invoiceNumber === selectedInvoiceForNote);
		if (!selectedInvoice) return;

		// Map client name to client ID
		const matchedClient = clients.find(c => c.name.toLowerCase() === selectedInvoice.customerName.toLowerCase());
		const clientId = matchedClient ? matchedClient.id : (clients[0]?.id || "cli-1");

		const padNum = String(creditNotes.length + 1).padStart(5, "0");
		const cnData = {
			creditNoteNumber: `CN${padNum}`,
			clientId: clientId,
			invoiceId: selectedInvoice.invoiceNumber, // in front-end it uses invoiceNumber
			amount: amount,
			reason: "Credit note applied",
			status: "Unused"
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/credit-notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cnData)
			});
			if (res.ok) {
				fetchCreditNotes();
			}
		} catch (err) {
			console.error("Error creating credit note:", err);
		}

		setShowAddModal(false);
		setSelectedInvoiceForNote("");
		setNewCreditNote({ amount: "", dateText: new Date().toISOString().split("T")[0] });
	};

	const handleDeleteCreditNote = (id: string) => {
		if (confirm(`Are you sure you want to remove credit note ${id}?`)) {
			setCreditNotes(prev => prev.filter(cn => cn.id !== id));
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
						<option value="IHS - Holding Limited">IHS - Holding Limited</option>
						<option value="Nigerian Bottling Company (NBC)">Nigerian Bottling Company (NBC)</option>
						<option value="7UP Bottling Company">7UP Bottling Company</option>
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
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="credit-notes" colorTheme="red" />
			</div>

			{/* Form elements for adding credit note */}
			<div className="flex flex-col sm:flex-row gap-3 items-end max-w-2xl text-left mt-2">
				<div className="flex-1 flex flex-col gap-1.5 w-full">
					<label className="text-[10px] font-bold text-slate-455 uppercase">Select paid or partial invoice</label>
					<select
						value={selectedInvoiceForNote}
						onChange={(e) => setSelectedInvoiceForNote(e.target.value)}
						className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-750 font-semibold"
					>
						<option value="">Select paid or partial invoice</option>
						{paidInvoicesMock.map(i => (
							<option key={i.invoiceNumber} value={i.invoiceNumber}>
								{`${i.invoiceNumber} (${i.customerName || "Unknown Client"} - ${formatNaira(i.amount)})`}
							</option>
						))}
					</select>
				</div>
				
				<button
					onClick={handleAddCreditNoteClick}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-605 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none w-full sm:w-auto h-[38px] justify-center"
				>
					<IconPlus className="w-4 h-4" />
					Add Credit Note
				</button>

				<button
					onClick={() => alert("Export credit notes CSV...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all h-[38px] justify-center"
				>
					<IconDownload className="w-4 h-4 text-slate-400" />
					Export
				</button>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-60 mt-4">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[120px]">Credit Note</th>
							<th className="pb-3 min-w-[120px]">Invoice</th>
							<th className="pb-3 min-w-[180px]">Name</th>
							<th className="pb-3 min-w-[130px]">Total</th>
							<th className="pb-3 min-w-[110px]">Credit Note Date</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredCreditNotes.length > 0 ? (
							filteredCreditNotes.map((cn) => (
								<tr key={cn.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${cn.id}`}</p>
									</td>
									<td className="py-4 text-slate-500 font-mono">{cn.invoiceNumber}</td>
									<td className="py-4 text-slate-800">{cn.clientName}</td>
									<td className="py-4 font-bold text-slate-750">{formatNaira(cn.total)}</td>
									<td className="py-4 text-slate-550">{cn.date}</td>
									<td className="py-4">
										<span className="bg-emerald-55/10 text-emerald-800 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
											{cn.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<button
											onClick={() => handleDeleteCreditNote(cn.id)}
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
					{`Showing 0 to ${filteredCreditNotes.length} of ${filteredCreditNotes.length} entries`}
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

			{/* ADD CREDIT NOTE MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add Credit Note</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Issue credits or refunds for selected invoice</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddCreditNoteSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex justify-between border-b border-gray-50 pb-2 text-xs font-semibold">
								<span className="text-slate-400">Selected Invoice:</span>
								<span className="text-slate-800 font-extrabold">{selectedInvoiceForNote}</span>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Credit Note Date</label>
								<input
									type="text"
									required
									value={newCreditNote.dateText}
									onChange={(e) => setNewCreditNote(prev => ({ ...prev, dateText: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Credit Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 5000"
									value={newCreditNote.amount}
									onChange={(e) => setNewCreditNote(prev => ({ ...prev, amount: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Issue Credit Note
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
