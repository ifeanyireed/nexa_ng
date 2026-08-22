"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconDotsVertical,
	IconTrash
} from "@tabler/icons-react";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";

const INVENTORY_TABS = [
	{ id: "products", label: "Products", slug: "/accountant/products" },
	{ id: "product-stock", label: "Product Stock", slug: "/accountant/product-stock" }
];

interface Product {
	id: string;
	name: string;
	image: string;
	sku: string;
	type: "Service" | "Product";
	salePrice: number;
	purchasePrice: number;
	quantity: number;
	canPurchase: boolean;
}

export default function ProductsPage() {
	const router = useRouter();

	const [products, setProducts] = useState<Product[]>([
		{ id: "p1", name: "GAIO - Leasing Services", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p2", name: "Cooperate Bus Services", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p3", name: "Bus Rentals", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p4", name: "Shuttle", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p5", name: "NBC - Recovery & Intervention", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p6", name: "NBC - Outsourcing Drivers", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p7", name: "Bus Rentals - OLAM", image: "/favicon.png", sku: "", type: "Product", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p8", name: "Haulage - DULUX", image: "/favicon.png", sku: "", type: "Product", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p9", name: "Haulage - 7UP", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false },
		{ id: "p10", name: "IHS - Fleet Management Service", image: "/favicon.png", sku: "", type: "Service", salePrice: 0, purchasePrice: 0, quantity: 0, canPurchase: false }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddModal, setShowAddModal] = useState(false);

	const [newProduct, setNewProduct] = useState({
		name: "",
		sku: "",
		type: "Service" as "Service" | "Product",
		salePrice: "",
		purchasePrice: ""
	});

	const filteredProducts = products.filter(p => {
		const query = searchQuery.toLowerCase();
		return p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
	});

	const totalPages = Math.ceil(filteredProducts.length / pageSize);
	const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedIds(filteredProducts.map(p => p.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: string) => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		);
	};

	const handleAddProductSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const pData: Product = {
			id: `p-${Date.now()}`,
			name: newProduct.name,
			image: "/favicon.png",
			sku: newProduct.sku,
			type: newProduct.type,
			salePrice: parseFloat(newProduct.salePrice) || 0,
			purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
			quantity: 0,
			canPurchase: false
		};
		setProducts(prev => [pData, ...prev]);
		setShowAddModal(false);
		setNewProduct({ name: "", sku: "", type: "Service", salePrice: "", purchasePrice: "" });
	};

	const handleDeleteBatch = () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected product(s)?`)) {
			setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
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
			
			{/* Header */}
			<div>
				<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Products</h2>
				<p className="text-xs text-slate-455 font-semibold mt-1">Manage catalog of operating services and products</p>
			</div>

			{/* Sub-menu Tabs */}
			<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
				<SubNavTabs tabs={INVENTORY_TABS} activeTabId="products" colorTheme="red" />
			</div>

			{/* Actions row */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={() => setShowAddModal(true)}
						className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
					>
						<IconPlus className="w-4 h-4" />
						Add Product
					</button>
					<button
						onClick={() => alert("CSV Export Triggered")}
						className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
					>
						<IconDownload className="w-4 h-4 text-slate-400" />
						Export
					</button>
					{selectedIds.length > 0 && (
						<button
							onClick={handleDeleteBatch}
							className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border-none shadow-sm"
						>
							<IconTrash className="w-4 h-4" />
							Delete Selected ({selectedIds.length})
						</button>
					)}
				</div>

				<div className="relative w-full sm:w-64">
					<input
						type="text"
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
						className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold outline-none"
					/>
					<IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto min-h-72">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 w-12 pr-3">
								<input
									type="checkbox"
									onChange={handleSelectAll}
									checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
									className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
								/>
							</th>
							<th className="pb-3 min-w-[120px]">Product Image</th>
							<th className="pb-3 min-w-[200px]">Products</th>
							<th className="pb-3 min-w-[80px]">SKU</th>
							<th className="pb-3 min-w-[100px]">Type</th>
							<th className="pb-3 min-w-[180px]">Sale Price (Incl. Taxes)</th>
							<th className="pb-3 min-w-[140px]">Purchase Price</th>
							<th className="pb-3 min-w-[110px]">Quantity</th>
							<th className="pb-3 min-w-[150px]">Client Can Purchase</th>
							<th className="pb-3 text-right w-16">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{paginatedProducts.length > 0 ? (
							paginatedProducts.map((p) => (
								<tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 pr-3">
										<input
											type="checkbox"
											checked={selectedIds.includes(p.id)}
											onChange={() => handleSelectRow(p.id)}
											className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer accent-red-500 mr-3"
										/>
									</td>
									<td className="py-4 text-center">
										<div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
											<img src={p.image} alt={p.name} className="w-6 h-6 object-contain" />
										</div>
									</td>
									<td className="py-4">
										<p className="font-extrabold text-slate-800">{p.name}</p>
									</td>
									<td className="py-4 text-slate-400 font-mono">{p.sku || "--"}</td>
									<td className="py-4">
										<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
											p.type === "Service" ? "bg-indigo-55/10 text-indigo-700" : "bg-cyan-55/10 text-cyan-700"
										}`}>
											{p.type}
										</span>
									</td>
									<td className="py-4 text-slate-700">{formatNaira(p.salePrice)}</td>
									<td className="py-4 text-slate-600">{formatNaira(p.purchasePrice)}</td>
									<td className="py-4 font-mono text-slate-500">{p.quantity.toFixed(6)}</td>
									<td className="py-4">
										<span className="flex items-center gap-1.5 text-red-650 font-bold text-[10px] uppercase">
											<span className="w-1.5 h-1.5 rounded-full bg-red-505 inline-block" />
											{p.canPurchase ? "Allowed" : "Not Allowed"}
										</span>
									</td>
									<td className="py-4 text-right">
										<button className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors border-none bg-transparent">
											<IconDotsVertical className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={10} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No products found matching filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination matching design */}
			{totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
					<div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
						<span>Show</span>
						<select
							value={pageSize}
							onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
							className="px-1.5 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-extrabold text-slate-700"
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={20}>20</option>
						</select>
						<span>entries</span>
					</div>
					<p className="text-[11px] text-slate-455 font-bold">
						{`Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(filteredProducts.length, currentPage * pageSize)} of ${filteredProducts.length} entries`}
					</p>
					<div className="flex items-center gap-1">
						<button 
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-500 disabled:text-slate-300 rounded-xl text-[10px] font-extrabold cursor-pointer disabled:cursor-not-allowed"
						>
							Previous
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
							<button 
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold ${
									currentPage === page ? "bg-red-500 text-white shadow-sm" : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 cursor-pointer"
								}`}
							>
								{page}
							</button>
						))}
						<button 
							onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
							disabled={currentPage === totalPages}
							className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-slate-500 disabled:text-slate-300 rounded-xl text-[10px] font-extrabold cursor-pointer disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			)}

			{/* ADD PRODUCT MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
							<div>
								<h3 className="font-extrabold text-slate-800 text-sm">Add New Product</h3>
								<p className="text-[10px] text-slate-455 mt-0.5 font-semibold">Integrate a new catalog service or product</p>
							</div>
							<button
								onClick={() => setShowAddModal(false)}
								className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleAddProductSubmit} className="p-6 flex flex-col gap-4 text-left">
							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Product Name</label>
								<input
									type="text"
									required
									placeholder="e.g. Bus Rentals - OLAM"
									value={newProduct.name}
									onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">SKU</label>
								<input
									type="text"
									placeholder="e.g. SKU-BUS-OLAM"
									value={newProduct.sku}
									onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-450 uppercase">Type</label>
								<select
									value={newProduct.type}
									onChange={(e) => setNewProduct(prev => ({ ...prev, type: e.target.value as any }))}
									className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
								>
									<option value="Service">Service</option>
									<option value="Product">Product</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Sale Price (NGN)</label>
									<input
										type="number"
										placeholder="e.g. 50000"
										value={newProduct.salePrice}
										onChange={(e) => setNewProduct(prev => ({ ...prev, salePrice: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Purchase Price (NGN)</label>
									<input
										type="number"
										placeholder="e.g. 35000"
										value={newProduct.purchasePrice}
										onChange={(e) => setNewProduct(prev => ({ ...prev, purchasePrice: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
							</div>

							<button
								type="submit"
								className="w-full py-2.5 mt-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] border-none outline-none cursor-pointer"
							>
								Add Product to Catalog
							</button>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}
