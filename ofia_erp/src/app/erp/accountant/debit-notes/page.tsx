"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconArrowLeft, 
	IconCheck,
	IconFileText, 
	IconTrash 
} from "@tabler/icons-react";

const RELATIONS_TABS = [
	{ id: "clients", label: "Clients", slug: "/accountant/clients" },
	{ id: "vendors", label: "Vendors", slug: "/accountant/vendors" },
	{ id: "bills", label: "Bills", slug: "/accountant/bills" },
	{ id: "debit-notes", label: "Debit Notes", slug: "/accountant/debit-notes" }
];

interface DebitNote {
	id: string;
	billId: string;
	vendorName: string;
	date: string;
	amount: number;
	description?: string;
}

export default function AccountantDebitNotes() {
	const router = useRouter();

	const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
	const [billsOptions, setBillsOptions] = useState<any[]>([]);
	const [selectedBillId, setSelectedBillId] = useState("");
	const [dateText, setDateText] = useState("");
	const [amountText, setAmountText] = useState("");
	const [description, setDescription] = useState("");

	const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

	const fetchDebitNotes = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/debit-notes`);
			if (res.ok) {
				const data = await res.json();
				const mapped = data.map((item: any) => ({
					id: item.debitNoteNumber,
					billId: item.billId || "N/A",
					vendorName: item.vendorName || "Unknown Vendor",
					date: item.createdAt ? item.createdAt.split("T")[0].split("-").reverse().join("-") : "",
					amount: item.amount,
					description: item.reason || ""
				}));
				setDebitNotes(mapped);
			}
		} catch (err) {
			console.error("Error fetching debit notes:", err);
		}
	};

	const fetchBills = async () => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/bills`);
			if (res.ok) {
				const data = await res.json();
				setBillsOptions(data);
			}
		} catch (err) {
			console.error("Error fetching bills:", err);
		}
	};

	React.useEffect(() => {
		fetchDebitNotes();
		fetchBills();
		const today = new Date().toISOString().split("T")[0];
		setDateText(today);
	}, []);

	const handleSaveDebitNote = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBillId) {
			alert("Please select a bill");
			return;
		}
		const amount = parseFloat(amountText);
		if (isNaN(amount) || amount <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		// billsOptions uses billNumber as id in mapping
		const selectedBill = billsOptions.find(b => b.billNumber === selectedBillId);
		if (!selectedBill) {
			alert("Could not locate bill " + selectedBillId);
			return;
		}

		const padNum = String(debitNotes.length + 1).padStart(5, "0");
		const dnData = {
			debitNoteNumber: `DN${padNum}`,
			vendorId: selectedBill.vendorId,
			billId: selectedBill.billNumber,
			amount: amount,
			reason: description
		};

		try {
			const res = await fetch(`${FINANCE_API_URL}/debit-notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dnData)
			});
			if (res.ok) {
				fetchDebitNotes();
			}
		} catch (err) {
			console.error("Error creating debit note:", err);
		}

		setSelectedBillId("");
		setAmountText("");
		setDescription("");
		setDateText(new Date().toISOString().split("T")[0]);
	};

	const handleDeleteNote = (id: string) => {
		if (confirm(`Are you sure you want to remove debit note ${id}?`)) {
			setDebitNotes(prev => prev.filter(dn => dn.id !== id));
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
		<div className="flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Top Header Row with Title & Back Button */}
			<div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100/40">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Debit Notes</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Vendor credits that reduce open bills and accounts payable</p>
				</div>
				<button
					onClick={() => router.push("/accountant/bills")}
					className="px-4 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
				>
					<IconArrowLeft className="w-4 h-4" />
					Back
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/40">
				<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
					{RELATIONS_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => router.push(tab.slug)}
							className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
								tab.id === "debit-notes"
									? "border-red-500 text-red-500 font-bold"
									: "border-transparent text-slate-400 hover:text-slate-700"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Create Debit Note Card Form */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4 text-left">
				<h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-gray-50">Create Debit Note</h3>
				
				<form onSubmit={handleSaveDebitNote} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
						<div className="flex flex-col gap-1.5">
							<label className="text-[10px] font-bold text-slate-455 uppercase">Bill <span className="text-red-500">*</span></label>
							<select
								value={selectedBillId}
								onChange={(e) => setSelectedBillId(e.target.value)}
								required
								className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-750 font-semibold"
							>
								<option value="">Nothing selected</option>
								{billsOptions.map(b => (
									<option key={b.billNumber} value={b.billNumber}>
										{`#${b.billNumber} (${b.vendorName || "Unknown Vendor"} - ${formatNaira(b.amount)})`}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-[10px] font-bold text-slate-455 uppercase">Date <span className="text-red-500">*</span></label>
							<input
								type="text"
								required
								value={dateText}
								onChange={(e) => setDateText(e.target.value)}
								className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
							/>
						</div>

						<div className="flex flex-col gap-1.5 relative">
							<label className="text-[10px] font-bold text-slate-455 uppercase">Amount <span className="text-red-500">*</span></label>
							<div className="flex gap-2">
								<input
									type="number"
									required
									placeholder="e.g. 10000"
									value={amountText}
									onChange={(e) => setAmountText(e.target.value)}
									className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
								<button
									type="submit"
									className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
								>
									<IconCheck className="w-4 h-4 stroke-[3]" />
									Save
								</button>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Description</label>
						<textarea
							rows={3}
							placeholder="Add description or notes regarding vendor adjustments..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
						/>
					</div>
				</form>
			</div>

			{/* Debit Notes List Table Card */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
				<div className="overflow-x-auto min-h-[200px]">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
								<th className="pb-3 min-w-[150px]">Debit Note</th>
								<th className="pb-3 min-w-[120px]">Bill</th>
								<th className="pb-3 min-w-[150px]">Vendor</th>
								<th className="pb-3 min-w-[120px]">Date</th>
								<th className="pb-3 min-w-[120px]">Amount</th>
								<th className="pb-3 text-right w-20">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{debitNotes.length > 0 ? (
								debitNotes.map((dn) => (
									<tr key={dn.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold">
										<td className="py-4">
											<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{`#${dn.id}`}</p>
											{dn.description && <p className="text-[10px] text-slate-400 mt-0.5">{dn.description}</p>}
										</td>
										<td className="py-4 text-slate-600">{`#${dn.billId}`}</td>
										<td className="py-4 text-slate-800">{dn.vendorName}</td>
										<td className="py-4 text-slate-550">{dn.date}</td>
										<td className="py-4 text-slate-800 font-bold">{formatNaira(dn.amount)}</td>
										<td className="py-4 text-right">
											<button
												onClick={() => handleDeleteNote(dn.id)}
												className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
												title="Delete"
											>
												<IconTrash className="w-4.5 h-4.5" />
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-bold">
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
			</div>

		</div>
	);
}
