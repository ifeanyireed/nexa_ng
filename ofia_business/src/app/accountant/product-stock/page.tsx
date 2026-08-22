"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPrinter, 
	IconSearch,
	IconEdit,
	IconArrowsLeftRight,
	IconEye,
	IconRefresh
} from "@tabler/icons-react";

const INVENTORY_TABS = [
	{ id: "products", label: "Products", slug: "/accountant/products" },
	{ id: "product-stock", label: "Product Stock", slug: "/accountant/product-stock" }
];

interface StockRecord {
	id: string;
	name: string;
	sku: string;
	currentQty: number;
	centralStock: number;
	newEraQty: number;
	kinghouseQty: number;
	skillUpQty: number;
	netsLogisticsQty: number;
}

export default function ProductStockPage() {
	const router = useRouter();

	const [stocks, setStocks] = useState<StockRecord[]>([
		{
			id: "s1",
			name: "Bus Rentals - OLAM",
			sku: "--",
			currentQty: 0.00,
			centralStock: 0.00,
			newEraQty: 0.00,
			kinghouseQty: 0.00,
			skillUpQty: 0.00,
			netsLogisticsQty: 0.00
		},
		{
			id: "s2",
			name: "Company Handbook and Acknowledgement Form",
			sku: "--",
			currentQty: 0.00,
			centralStock: 0.00,
			newEraQty: 0.00,
			kinghouseQty: 0.00,
			skillUpQty: 0.00,
			netsLogisticsQty: 0.00
		},
		{
			id: "s3",
			name: "Haulage - DULUX",
			sku: "--",
			currentQty: 0.00,
			centralStock: 0.00,
			newEraQty: 0.00,
			kinghouseQty: 0.00,
			skillUpQty: 0.00,
			netsLogisticsQty: 0.00
		},
		{
			id: "s4",
			name: "International Delivery",
			sku: "--",
			currentQty: 0.00,
			centralStock: 0.00,
			newEraQty: 0.00,
			kinghouseQty: 0.00,
			skillUpQty: 0.00,
			netsLogisticsQty: 0.00
		}
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [showTransferModal, setShowTransferModal] = useState(false);
	const [selectedStock, setSelectedStock] = useState<StockRecord | null>(null);

	const [transferForm, setTransferForm] = useState({
		fromLocation: "centralStock",
		toLocation: "newEraQty",
		qty: ""
	});

	const filteredStocks = stocks.filter(s =>
		s.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleStockTransferSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStock) return;
		
		const qtyToMove = parseFloat(transferForm.qty);
		if (isNaN(qtyToMove) || qtyToMove <= 0) {
			alert("Please enter a valid quantity");
			return;
		}

		if (transferForm.fromLocation === transferForm.toLocation) {
			alert("Origin and destination locations must be different");
			return;
		}

		const originVal = (selectedStock as any)[transferForm.fromLocation] || 0;
		// Allow unlimited stock if adding to centralStock, or check if origin has enough stock
		if (transferForm.fromLocation !== "centralStock" && originVal < qtyToMove) {
			alert("Insufficient stock in selected origin location");
			return;
		}

		setStocks(prev => prev.map(s => {
			if (s.id === selectedStock.id) {
				const updated = { ...s };
				if (transferForm.fromLocation !== "centralStock") {
					(updated as any)[transferForm.fromLocation] = originVal - qtyToMove;
				} else {
					// Deduct from central stock
					(updated as any).centralStock = s.centralStock - qtyToMove;
				}
				(updated as any)[transferForm.toLocation] = ((updated as any)[transferForm.toLocation] || 0) + qtyToMove;
				
				// Recompute currentQty
				updated.currentQty = updated.centralStock + updated.newEraQty + updated.kinghouseQty + updated.skillUpQty + updated.netsLogisticsQty;
				return updated;
			}
			return s;
		}));

		setShowTransferModal(false);
		setSelectedStock(null);
		setTransferForm({ fromLocation: "centralStock", toLocation: "newEraQty", qty: "" });
	};

	return (
		<div className="flex flex-col gap-6 animate-fadeIn text-[#1e293b]">
			
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100/40">
				<div>
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Manage Product Stock</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1">Central stock and branch/location quantity at a glance</p>
				</div>
				<button
					onClick={() => alert("Printing stock info summary...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-center"
				>
					<IconPrinter className="w-4 h-4 text-slate-550" />
					Print Product Stock Info
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/40">
				<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
					{INVENTORY_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => router.push(tab.slug)}
							className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
								tab.id === "product-stock"
									? "border-red-500 text-red-500 font-bold"
									: "border-transparent text-slate-400 hover:text-slate-700"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Table and Info Card */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-5">
				
				{/* Top search & badge */}
				<div className="flex justify-between items-center gap-4">
					<span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-extrabold">
						{`${stocks.length} products`}
					</span>
					
					<div className="relative w-60">
						<input
							type="text"
							placeholder="Search product stock..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
						/>
						<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					</div>
				</div>

				{/* Table Grid */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[10px] font-bold uppercase tracking-wider">
								<th className="pb-3 min-w-[200px]">Name</th>
								<th className="pb-3 min-w-[70px]">SKU</th>
								<th className="pb-3 min-w-[120px]">Current Quantity</th>
								<th className="pb-3 min-w-[100px]">Central Stock</th>
								<th className="pb-3 min-w-[170px]">New Era Transports Services</th>
								<th className="pb-3 min-w-[170px]">Kinghouse Learning Centre</th>
								<th className="pb-3 min-w-[90px]">Skill Up</th>
								<th className="pb-3 min-w-[110px]">Nets Logistics</th>
								<th className="pb-3 text-right w-32">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{filteredStocks.length > 0 ? (
								filteredStocks.map((stock) => (
									<tr key={stock.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
										<td className="py-4 text-slate-800 font-bold max-w-[200px] whitespace-normal leading-relaxed">{stock.name}</td>
										<td className="py-4 text-slate-400 font-mono">{stock.sku}</td>
										<td className="py-4 font-mono font-bold text-slate-800">{stock.currentQty.toFixed(2)}</td>
										<td className="py-4 font-mono text-slate-500">{stock.centralStock.toFixed(2)}</td>
										<td className="py-4 font-mono text-slate-500">{stock.newEraQty.toFixed(2)}</td>
										<td className="py-4 font-mono text-slate-500">{stock.kinghouseQty.toFixed(2)}</td>
										<td className="py-4 font-mono text-slate-500">{stock.skillUpQty.toFixed(2)}</td>
										<td className="py-4 font-mono text-slate-500">{stock.netsLogisticsQty.toFixed(2)}</td>
										<td className="py-4 text-right">
											<div className="flex justify-end gap-1.5">
												<button 
													onClick={() => alert(`Edit SKU/stock details for ${stock.name}`)}
													className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg cursor-pointer transition-colors border-none"
													title="Edit stock settings"
												>
													<IconEdit className="w-4 h-4" />
												</button>
												<button 
													onClick={() => {
														setSelectedStock(stock);
														setShowTransferModal(true);
													}}
													className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors border-none"
													title="Transfer stock"
												>
													<IconArrowsLeftRight className="w-4 h-4" />
												</button>
												<button 
													onClick={() => alert(`View details history for ${stock.name}`)}
													className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
													title="View details"
												>
													<IconEye className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-bold italic">
										No product stocks found matching filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

			</div>

			{/* STOCK TRANSFER MODAL */}
			{showTransferModal && selectedStock && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Stock Relocation</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">{selectedStock.name}</p>
							</div>
							<button
								onClick={() => {
									setShowTransferModal(false);
									setSelectedStock(null);
								}}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleStockTransferSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Source Location</label>
								<select
									value={transferForm.fromLocation}
									onChange={(e) => setTransferForm(prev => ({ ...prev, fromLocation: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="centralStock">{`Central Stock (${selectedStock.centralStock.toFixed(2)})`}</option>
									<option value="newEraQty">{`New Era Transports Services (${selectedStock.newEraQty.toFixed(2)})`}</option>
									<option value="kinghouseQty">{`Kinghouse Learning Centre (${selectedStock.kinghouseQty.toFixed(2)})`}</option>
									<option value="skillUpQty">{`Skill Up (${selectedStock.skillUpQty.toFixed(2)})`}</option>
									<option value="netsLogisticsQty">{`Nets Logistics (${selectedStock.netsLogisticsQty.toFixed(2)})`}</option>
								</select>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Destination Location</label>
								<select
									value={transferForm.toLocation}
									onChange={(e) => setTransferForm(prev => ({ ...prev, toLocation: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="centralStock">{`Central Stock (${selectedStock.centralStock.toFixed(2)})`}</option>
									<option value="newEraQty">{`New Era Transports Services (${selectedStock.newEraQty.toFixed(2)})`}</option>
									<option value="kinghouseQty">{`Kinghouse Learning Centre (${selectedStock.kinghouseQty.toFixed(2)})`}</option>
									<option value="skillUpQty">{`Skill Up (${selectedStock.skillUpQty.toFixed(2)})`}</option>
									<option value="netsLogisticsQty">{`Nets Logistics (${selectedStock.netsLogisticsQty.toFixed(2)})`}</option>
								</select>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-455 uppercase">Quantity to Transfer</label>
								<input
									type="number"
									required
									step="0.01"
									placeholder="e.g. 50"
									value={transferForm.qty}
									onChange={(e) => setTransferForm(prev => ({ ...prev, qty: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Confirm Relocation
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
