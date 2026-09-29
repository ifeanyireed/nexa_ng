"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconFileText, 
	IconPlus,
	IconEye, 
	IconSearch 
} from "@tabler/icons-react";

const RELATIONS_TABS = [
	{ id: "clients", label: "Clients", slug: "/accountant/clients" },
	{ id: "vendors", label: "Vendors", slug: "/accountant/vendors" },
	{ id: "bills", label: "Bills", slug: "/accountant/bills" },
	{ id: "debit-notes", label: "Debit Notes", slug: "/accountant/debit-notes" }
];

interface Bill {
	id: string;
	vendorName: string;
	date: string;
	dueDate: string;
	location: string;
	paymentStatus: "Paid" | "Unpaid" | "Pending";
	receivingStatus: "Received" | "Pending" | "Not Received";
	amount: number;
	dueAmount: number;
}

export default function AccountantBills() {
	const router = useRouter();

	const [billsList, setBillsList] = useState<Bill[]>([]);
	const [vendors, setVendors] = useState<any[]>([]);

	// Filter states
	const [selectedVendor, setSelectedVendor] = useState("All");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [activeVendorFilter, setActiveVendorFilter] = useState("All");
	const [activeStatusFilter, setActiveStatusFilter] = useState("All");

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

	const [newBill, setNewBill] = useState({
		vendorName: "Mr. David",
		date: "",
		dueDate: "",
		location: "New Era Transports Services",
		paymentStatus: "Paid" as "Paid" | "Unpaid",
		receivingStatus: "Received" as "Received" | "Pending",
		amount: ""
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchBills = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/bills`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.billNumber,
					vendorName: item.vendorName || "Unknown Vendor",
					date: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					dueDate: item.dueDate ? item.dueDate.split("-").reverse().join("-") : "",
					location: "New Era Transports Services",
					paymentStatus: item.status === "Paid" ? "Paid" : "Unpaid",
					receivingStatus: "Received",
					amount: item.amount,
					dueAmount: item.status === "Paid" ? 0 : item.amount
				}));
				setBillsList(mapped);
			}
		} catch (err) {
			console.error("Error fetching bills:", err);
		}
	};

	const fetchVendors = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/vendors`);
			if (res.ok) {
				const data = await res.json();
				setVendors(data);
			}
		} catch (err) {
			console.error("Error fetching vendors:", err);
		}
	};

	React.useEffect(() => {
		fetchBills();
		fetchVendors();
	}, []);

	const handleApplyFilters = () => {
		setActiveVendorFilter(selectedVendor);
		setActiveStatusFilter(selectedStatus);
	};

	const filteredBills = billsList.filter(b => {
		const matchesVendor = activeVendorFilter === "All" || b.vendorName === activeVendorFilter;
		const matchesStatus = activeStatusFilter === "All" || 
			b.paymentStatus === activeStatusFilter || 
			b.receivingStatus === activeStatusFilter;
		return matchesVendor && matchesStatus;
	});

	const handleCreateBillSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newBill.vendorName || !newBill.dueDate || !newBill.amount) {
			alert("Please fill in required fields.");
			return;
		}

		const matchedVendor = vendors.find(v => v.name.toLowerCase() === newBill.vendorName.toLowerCase());
		const vendorId = matchedVendor ? matchedVendor.id : (vendors[0]?.id || "vend-1");

		const padNum = String(billsList.length + 1).padStart(5, "0");
		const billData = {
			billNumber: `BILL${padNum}`,
			vendorId: vendorId,
			amount: parseFloat(newBill.amount) || 0,
			dueDate: newBill.dueDate,
			status: newBill.paymentStatus,
			description: "Logged via dashboard"
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/bills`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(billData)
			});
			if (res.ok) {
				fetchBills();
			}
		} catch (err) {
			console.error("Error creating bill:", err);
		}

		setShowCreateModal(false);
		setNewBill({
			vendorName: "Mr. David",
			date: "",
			dueDate: "",
			location: "New Era Transports Services",
			paymentStatus: "Paid",
			receivingStatus: "Received",
			amount: ""
		});
	};

	const formatNaira = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 2
		}).format(amount);
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Bills</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Vendor purchases, payable status, and receiving history</p>
				</div>
				<button
					onClick={() => setShowCreateModal(true)}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none self-start sm:self-center"
				>
					<IconPlus className="w-4 h-4" />
					Create Bill
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{RELATIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "bills"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Filters Row */}
			<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
				<div className="sm:col-span-5">
					<select
						value={selectedVendor}
						onChange={(e) => setSelectedVendor(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-750 font-bold"
					>
						<option value="All">All vendors</option>
						<option value="Mr. David">Mr. David</option>
						<option value="Mr. Salam">Mr. Salam</option>
						<option value="Mr. Samuel">Mr. Samuel</option>
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
						<option value="Pending">Pending</option>
						<option value="Received">Received</option>
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

			{/* Main table section */}
			<div className="overflow-x-auto min-h-72">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[130px]">Bill</th>
							<th className="pb-3 min-w-[140px]">Vendor</th>
							<th className="pb-3 min-w-[110px]">Date</th>
							<th className="pb-3 min-w-[110px]">Due Date</th>
							<th className="pb-3 min-w-[200px]">Location</th>
							<th className="pb-3 min-w-[150px]">Status</th>
							<th className="pb-3 min-w-[120px]">Amount</th>
							<th className="pb-3 min-w-[120px]">Due</th>
							<th className="pb-3 text-right w-20">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredBills.length > 0 ? (
							filteredBills.map((bill) => (
								<tr key={bill.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold">
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${bill.id}`}</p>
									</td>
									<td className="py-4 text-slate-800">{bill.vendorName}</td>
									<td className="py-4 text-slate-550">{bill.date}</td>
									<td className="py-4 text-slate-550">{bill.dueDate}</td>
									<td className="py-4 text-slate-550 truncate max-w-[180px]">{bill.location}</td>
									<td className="py-4 flex gap-1.5 items-center flex-wrap">
										<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
											bill.paymentStatus === "Paid" 
												? "bg-slate-100 border-slate-200 text-slate-800" 
												: "bg-amber-50 border-amber-100 text-amber-700"
										}`}>
											{bill.paymentStatus}
										</span>
										<span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase ${
											bill.receivingStatus === "Received"
												? "bg-emerald-50 border-emerald-100 text-emerald-700"
												: "bg-slate-100 border-slate-200 text-slate-800"
										}`}>
											{bill.receivingStatus}
										</span>
									</td>
									<td className="py-4 text-slate-800 font-bold">{formatNaira(bill.amount)}</td>
									<td className="py-4 text-slate-600">{formatNaira(bill.dueAmount)}</td>
									<td className="py-4 text-right">
										<button
											onClick={() => {
												setSelectedBill(bill);
												setShowViewModal(true);
											}}
											className="px-2.5 py-1 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 inline-block text-center"
										>
											<IconEye className="w-3.5 h-3.5" />
											View
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No bills found matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* MODAL 1: CREATE BILL */}
			{showCreateModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Create New Bill</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Log a vendor purchase or utility expense</p>
							</div>
							<button
								onClick={() => setShowCreateModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleCreateBillSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Vendor</label>
								<select
									value={newBill.vendorName}
									onChange={(e) => setNewBill(prev => ({ ...prev, vendorName: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="Mr. David">Mr. David</option>
									<option value="Mr. Salam">Mr. Salam</option>
									<option value="Mr. Samuel">Mr. Samuel</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Bill Date</label>
									<input
										type="date"
										required
										value={newBill.date}
										onChange={(e) => setNewBill(prev => ({ ...prev, date: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Due Date</label>
									<input
										type="date"
										required
										value={newBill.dueDate}
										onChange={(e) => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Delivery Location</label>
								<input
									type="text"
									required
									value={newBill.location}
									onChange={(e) => setNewBill(prev => ({ ...prev, location: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Payment Status</label>
									<select
										value={newBill.paymentStatus}
										onChange={(e) => setNewBill(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="Paid">Paid</option>
										<option value="Unpaid">Unpaid</option>
										<option value="Pending">Pending</option>
									</select>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Receiving Status</label>
									<select
										value={newBill.receivingStatus}
										onChange={(e) => setNewBill(prev => ({ ...prev, receivingStatus: e.target.value as any }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="Received">Received</option>
										<option value="Pending">Pending</option>
										<option value="Not Received">Not Received</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Amount (NGN)</label>
								<input
									type="number"
									required
									placeholder="e.g. 48500"
									value={newBill.amount}
									onChange={(e) => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Create Vendor Bill
							</button>
						</form>
					</div>
				</div>
			)}

			{/* MODAL 2: VIEW BILL DETAILS */}
			{showViewModal && selectedBill && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Bill #{selectedBill.id} Details</h3>
								<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Vendor invoice logs summary</p>
							</div>
							<button
								onClick={() => {
									setShowViewModal(false);
									setSelectedBill(null);
								}}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<div className="p-6 space-y-4 text-xs font-semibold text-slate-700 text-left">
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-450 text-[10px] uppercase">Vendor</span>
								<span className="text-slate-800 font-extrabold">{selectedBill.vendorName}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-450 text-[10px] uppercase">Bill Date</span>
								<span className="text-slate-800">{selectedBill.date}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-450 text-[10px] uppercase">Due Date</span>
								<span className="text-slate-800">{selectedBill.dueDate}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-450 text-[10px] uppercase">Delivery Location</span>
								<span className="text-slate-800 truncate max-w-[200px]">{selectedBill.location}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-455 text-[10px] uppercase">Payment Status</span>
								<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] uppercase border border-gray-200">{selectedBill.paymentStatus}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-455 text-[10px] uppercase">Receiving Status</span>
								<span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-100">{selectedBill.receivingStatus}</span>
							</div>
							<div className="flex justify-between border-b border-gray-50 pb-2">
								<span className="text-slate-450 text-[10px] uppercase">Bill Total</span>
								<span className="text-blue-600 font-black text-sm">{formatNaira(selectedBill.amount)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-450 text-[10px] uppercase">Due Balance</span>
								<span className="text-slate-800 font-extrabold">{formatNaira(selectedBill.dueAmount)}</span>
							</div>

							<button
								onClick={() => {
									setShowViewModal(false);
									setSelectedBill(null);
								}}
								className="w-full py-2.5 mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-colors border-none outline-none cursor-pointer"
							>
								Close Window
							</button>
						</div>
					</div>
				</div>
			)}

		</div>
	);
}
