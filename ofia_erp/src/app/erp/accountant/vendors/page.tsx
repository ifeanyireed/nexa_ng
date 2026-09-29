"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconUserPlus, 
	IconDownload, 
	IconUpload, 
	IconTrash,
	IconEdit, 
	IconLayoutGrid, 
	IconList, 
	IconSearch,
	IconFileText
} from "@tabler/icons-react";

const RELATIONS_TABS = [
	{ id: "clients", label: "Clients", slug: "/accountant/clients" },
	{ id: "vendors", label: "Vendors", slug: "/accountant/vendors" },
	{ id: "bills", label: "Bills", slug: "/accountant/bills" },
	{ id: "debit-notes", label: "Debit Notes", slug: "/accountant/debit-notes" }
];

interface Vendor {
	id: string;
	name: string;
	email: string;
	phone: string;
	billsCount: number;
	billTotal: number;
	status: string;
}

export default function AccountantVendors() {
	const router = useRouter();

	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

	const [newVendor, setNewVendor] = useState({
		name: "",
		email: "",
		phone: ""
	});

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchVendors = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/vendors`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.id,
					name: item.name,
					email: item.email,
					phone: item.phone,
					billsCount: 0,
					billTotal: 0,
					status: item.status
				}));
				setVendors(mapped);
			}
		} catch (err) {
			console.error("Error fetching vendors:", err);
		}
	};

	React.useEffect(() => {
		fetchVendors();
	}, []);

	const filteredVendors = vendors.filter(v => {
		const query = searchQuery.toLowerCase();
		return (
			v.name.toLowerCase().includes(query) ||
			v.id.toLowerCase().includes(query) ||
			v.email.toLowerCase().includes(query) ||
			v.phone.toLowerCase().includes(query)
		);
	});

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedIds(filteredVendors.map(v => v.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: string) => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		);
	};

	const handleAddVendorSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newVendor.name || !newVendor.email) {
			alert("Please fill in name and email.");
			return;
		}

		const padNum = String(vendors.length + 1).padStart(5, "0");
		const vendorData = {
			id: `VEND${padNum}`,
			name: newVendor.name,
			email: newVendor.email,
			phone: newVendor.phone,
			companyName: newVendor.name,
			status: "Active"
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/vendors`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(vendorData)
			});
			if (res.ok) {
				fetchVendors();
			}
		} catch (err) {
			console.error("Error creating vendor:", err);
		}

		setShowAddModal(false);
		setNewVendor({ name: "", email: "", phone: "" });
	};

	const handleEditVendorSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingVendor) return;
		setVendors(prev =>
			prev.map(v => (v.id === editingVendor.id ? editingVendor : v))
		);
		setShowEditModal(false);
		setEditingVendor(null);
	};

	const handleDeleteVendor = (id: string, name: string) => {
		if (confirm(`Are you sure you want to remove vendor "${name}"?`)) {
			setVendors(prev => prev.filter(v => v.id !== id));
			setSelectedIds(prev => prev.filter(x => x !== id));
		}
	};

	const handleDeleteBatch = () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected vendor(s)?`)) {
			setVendors(prev => prev.filter(v => !selectedIds.includes(v.id)));
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
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div>
				<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Manage Vendors</h2>
				<p className="text-xs text-slate-455 font-semibold mt-1">Suppliers, payables, and purchase relationships</p>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				{RELATIONS_TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
							tab.id === "vendors"
								? "border-red-500 text-red-500 font-bold"
								: "border-transparent text-slate-400 hover:text-slate-700"
						}`}
					>
						{tab.label}
					</button>
				))}
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
						Add Vendor
					</button>

					<button
						onClick={handleDeleteBatch}
						disabled={selectedIds.length === 0}
						className={`px-4 py-2.5 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none outline-none shadow-sm ${
							selectedIds.length > 0 
								? "bg-red-500 hover:bg-red-605 text-white active:scale-95" 
								: "bg-red-105 text-red-300 cursor-not-allowed"
						}`}
					>
						<IconTrash className="w-4 h-4" />
						Delete Selected
					</button>
				</div>

				{/* Right side options */}
				<div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
					
					{/* Search bar */}
					<div className="relative w-full sm:w-64">
						<input
							type="text"
							placeholder="Search vendor..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
						/>
						<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					</div>
				</div>

			</div>

			{/* Main table section */}
			<div className="overflow-x-auto min-h-72">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 w-12 pr-3">
								<input
									type="checkbox"
									onChange={handleSelectAll}
									checked={filteredVendors.length > 0 && selectedIds.length === filteredVendors.length}
									className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
								/>
							</th>
							<th className="pb-3 min-w-[150px]">Vendor</th>
							<th className="pb-3 min-w-[200px]">Contact</th>
							<th className="pb-3 w-24">Bills</th>
							<th className="pb-3 min-w-[150px]">Bill Total</th>
							<th className="pb-3 w-24">Status</th>
							<th className="pb-3 text-right w-24">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredVendors.length > 0 ? (
							filteredVendors.map((vendor) => (
								<tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold">
									<td className="py-4 pr-3">
										<input
											type="checkbox"
											checked={selectedIds.includes(vendor.id)}
											onChange={() => handleSelectRow(vendor.id)}
											className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
										/>
									</td>
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${vendor.id}`}</p>
										<p className="text-[11px] text-slate-500 mt-0.5">{vendor.name}</p>
									</td>
									<td className="py-4">
										<p className="text-slate-800">{vendor.email}</p>
										<p className="text-[10px] text-slate-400 mt-0.5">{vendor.phone || "--"}</p>
									</td>
									<td className="py-4 text-slate-600">{vendor.billsCount}</td>
									<td className="py-4 text-slate-700 font-bold">{formatNaira(vendor.billTotal)}</td>
									<td className="py-4">
										<span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
											{vendor.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<div className="flex justify-end gap-2">
											<button
												onClick={() => {
													setEditingVendor(vendor);
													setShowEditModal(true);
												}}
												className="p-1 hover:bg-slate-100 text-blue-600 hover:text-blue-800 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
												title="Edit"
											>
												<IconEdit className="w-4.5 h-4.5" />
											</button>
											<button
												onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
												className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
												title="Delete"
											>
												<IconTrash className="w-4.5 h-4.5" />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No vendors found matching your query.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* MODAL 1: ADD VENDOR */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add New Vendor</h3>
								<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Create a new supplier profile</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddVendorSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Vendor Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Mr. David"
									value={newVendor.name}
									onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Contact Email</label>
								<input
									type="email"
									required
									placeholder="e.g. david@yahoo.com"
									value={newVendor.email}
									onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Phone Number</label>
								<input
									type="text"
									placeholder="e.g. 09000000000"
									value={newVendor.phone}
									onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Add Vendor Profile
							</button>
						</form>
					</div>
				</div>
			)}

			{/* MODAL 2: EDIT VENDOR */}
			{showEditModal && editingVendor && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Edit Vendor</h3>
								<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Update supplier information</p>
							</div>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingVendor(null);
								}}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleEditVendorSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Vendor Name</label>
								<input
									type="text"
									required
									value={editingVendor.name}
									onChange={(e) => setEditingVendor(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Contact Email</label>
								<input
									type="email"
									required
									value={editingVendor.email}
									onChange={(e) => setEditingVendor(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Phone Number</label>
								<input
									type="text"
									value={editingVendor.phone}
									onChange={(e) => setEditingVendor(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Status</label>
								<select
									value={editingVendor.status}
									onChange={(e) => setEditingVendor(prev => prev ? ({ ...prev, status: e.target.value }) : null)}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 font-bold"
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Save Changes
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
