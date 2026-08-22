"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SubNavTabs from "@/components/nets_erp/SubNavTabs";
import { 
	IconPlus, 
	IconDownload, 
	IconSearch,
	IconRefresh,
	IconClock,
	IconFilter,
	IconDotsVertical,
	IconTrash,
	IconPrinter,
	IconSparkles,
	IconX,
	IconCheck,
	IconFileText,
	IconUserPlus
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

interface LineItem {
	id: string;
	date: string;
	truckNo: string;
	location: string;
	trackingId: string;
	tonnage: string | number;
	amount: string | number;
	customValues?: Record<string, string>;
}

interface CustomColumn {
	id: string;
	title: string;
}

interface ClientOption {
	id: string | number;
	name: string;
	address?: string;
}

const DEFAULT_CLIENTS: ClientOption[] = [
	{ id: "cli-1", name: "CHEMICAL AND ALLIED PRODUCTS PLC", address: "NO 2, ADENIYI JONES AVENUE, IKEJA LAGOS." },
	{ id: "cli-2", name: "ECOLOGIQUE TRANSPORT SOLUTION", address: "NO 12, MARINA ROAD, VICTORIA ISLAND, LAGOS." },
	{ id: "cli-3", name: "DULUX - CHEMICAL & ALLIED PRODUCT PLC", address: "ADENIYI JONES AVENUE, IKEJA LAGOS." },
	{ id: "cli-4", name: "7UP BOTTLING COMPANY", address: "227 MOBOlAJI JOHNSON AVENUE, OREGUN, IKEJA, LAGOS." },
	{ id: "cli-5", name: "NIGERIAN BOTTLING COMPANY (NBC)", address: "IDDI-MANGORO, AGEGE MOTOR ROAD, LAGOS." },
	{ id: "cli-6", name: "IHS - HOLDING LIMITED", address: "IKOYI, LAGOS." }
];

interface BankAccountOption {
	id: string;
	bankName: string;
	accountName: string;
	accountNumber: string;
}

const DEFAULT_BANK_ACCOUNTS: BankAccountOption[] = [
	{ id: "acc-4", bankName: "PROVIDUS BANK", accountName: "New Era Transport Services", accountNumber: "1304247018" },
	{ id: "acc-3", bankName: "GT BANK", accountName: "New Era Transport Services", accountNumber: "0123456789" },
	{ id: "acc-1", bankName: "GLOBUS BANK", accountName: "New Era Transport Services", accountNumber: "1050293847" },
	{ id: "acc-2", bankName: "KEYSTONE BANK", accountName: "New Era Transport Services", accountNumber: "1029384756" },
	{ id: "acc-5", bankName: "MONIEPOINT", accountName: "New Era Transport Services", accountNumber: "5098765432" }
];

interface Invoice {
	id: string;
	code: string;
	project: string;
	clientName: string;
	addedBy: string;
	total: number;
	paid: number;
	unpaid: number;
	invoiceDate: string;
	status: string;
}

function numberToWordsNaira(num: number): string {
	if (isNaN(num) || num <= 0) return "Zero Naira Only.";

	const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
		"Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
	const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

	function convertChunk(n: number): string {
		let str = "";
		if (n >= 100) {
			str += units[Math.floor(n / 100)] + " Hundred ";
			n %= 100;
		}
		if (n >= 20) {
			str += tens[Math.floor(n / 10)] + " ";
			n %= 10;
		}
		if (n > 0) {
			str += units[n] + " ";
		}
		return str.trim();
	}

	const nairaPart = Math.floor(num);
	const koboPart = Math.round((num - nairaPart) * 100);

	let words = "";
	if (nairaPart > 0) {
		const billion = Math.floor(nairaPart / 1000000000);
		const million = Math.floor((nairaPart % 1000000000) / 1000000);
		const thousand = Math.floor((nairaPart % 1000000) / 1000);
		const remainder = nairaPart % 1000;

		if (billion > 0) words += convertChunk(billion) + " Billion ";
		if (million > 0) words += convertChunk(million) + " Million ";
		if (thousand > 0) words += convertChunk(thousand) + " Thousand, ";
		if (remainder > 0) words += convertChunk(remainder) + " ";
		words = words.trim() + " Naira";
	}

	if (koboPart > 0) {
		const koboWords = convertChunk(koboPart);
		if (words) {
			words += ". " + koboWords + " Kobo Only.";
		} else {
			words = koboWords + " Kobo Only.";
		}
	} else {
		words += " Only.";
	}

	return words;
}

function formatNumberWithCommas(value: number | string): string {
	if (value === undefined || value === null || value === "") return "";
	const rawStr = String(value).replace(/,/g, "");
	const num = parseFloat(rawStr);
	if (isNaN(num)) return String(value);

	const parts = rawStr.split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function parseNumberFromCommas(value: string | number): number {
	if (value === undefined || value === null || value === "") return 0;
	const clean = String(value).replace(/,/g, "");
	return parseFloat(clean) || 0;
}

function getClientAcronym(clientName: string): string {
	if (!clientName) return "GEN";
	const clean = clientName.trim().toUpperCase();

	// 1. Check for parenthesized acronym e.g. "NIGERIAN BOTTLING COMPANY (NBC)" -> "NBC"
	const matchParen = clean.match(/\(([^)]+)\)/);
	if (matchParen && matchParen[1].trim().length >= 2) {
		return matchParen[1].trim().replace(/[^A-Z0-9]/g, "");
	}

	// 2. Specific known client acronym overrides
	if (clean.includes("CHEMICAL") || clean.includes("CAP PLC")) return "CAP";
	if (clean.includes("ECOLOGIQUE")) return "ETS";
	if (clean.includes("7UP")) return "7UP";
	if (clean.includes("DULUX")) return "DULUX";
	if (clean.includes("IHS")) return "IHS";

	// 3. Extract main initials
	const stopWords = new Set(["AND", "&", "PLC", "LTD", "LIMITED", "INC", "CORP", "COMPANY", "CO", "SERVICES", "SERVICE"]);
	const words = clean.split(/[\s\-_]+/).filter(w => w && !stopWords.has(w));

	let acronym = words.map(w => w.charAt(0)).join("").replace(/[^A-Z0-9]/g, "");
	if (acronym.length < 2) {
		acronym = clean.replace(/[^A-Z0-9]/g, "").slice(0, 3);
	}
	return acronym || "GEN";
}

function formatInvoiceCode(clientName: string, dateStr: string, serial: string | number = "008"): string {
	const acronym = getClientAcronym(clientName);
	const year = dateStr && dateStr.includes("-") ? dateStr.split("-")[0] : new Date().getFullYear().toString();
	const formattedSerial = String(serial).padStart(3, "0");
	return `NETS-${acronym}-${year}-${formattedSerial}`;
}

export default function InvoicesPage() {
	const router = useRouter();

	const [invoices, setInvoices] = useState<Invoice[]>([
		{ id: "inv-1", code: "NETS-CAP-2025-008", project: "Chemical Transport", clientName: "Chemical & Allied Products PLC", addedBy: "Oluwatobiloba Olateju", total: 513386.96, paid: 0.00, unpaid: 513386.96, invoiceDate: "15-08-2025", status: "Draft" },
		{ id: "inv-2", code: "NETS-ETS-2026-001", project: "Haulage Logistics", clientName: "Ecologique Transport Solution", addedBy: "Oluwatobiloba Olateju", total: 6000.00, paid: 0.00, unpaid: 6000.00, invoiceDate: "15-07-2026", status: "Draft" },
		{ id: "inv-3", code: "NETS-IHS-2026-002", project: "Tower Maintenance", clientName: "IHS - Holding Limited", addedBy: "Oluwatobiloba Olateju", total: 1000000.00, paid: 0.00, unpaid: 1000000.00, invoiceDate: "13-07-2026", status: "Draft" },
		{ id: "inv-4", code: "NETS-DUL-2026-003", project: "Paint Distribution", clientName: "Dulux - Chemical & Allied Product PLC", addedBy: "Oluwatobiloba Olateju", total: 2000.00, paid: 0.00, unpaid: 2000.00, invoiceDate: "13-07-2026", status: "Draft" },
		{ id: "inv-5", code: "NETS-7UP-2026-004", project: "Beverage Transit", clientName: "7UP Bottling Company", addedBy: "Oluwatobiloba Olateju", total: 6375.00, paid: 0.00, unpaid: 6375.00, invoiceDate: "13-07-2026", status: "Draft" },
		{ id: "inv-6", code: "NETS-NBC-2026-005", project: "Regional Supply", clientName: "Nigerian Bottling Company (NBC)", addedBy: "Queen Okonkwo", total: 5779200.00, paid: 0.00, unpaid: 5779200.00, invoiceDate: "10-07-2026", status: "Draft" }
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedClientFilter, setSelectedClientFilter] = useState("All");
	const [showAddModal, setShowAddModal] = useState(false);

	// Client & Bank Accounts Dropdown & Database Sync State
	const [clientList, setClientList] = useState<ClientOption[]>(DEFAULT_CLIENTS);
	const [bankAccountsList, setBankAccountsList] = useState<BankAccountOption[]>(DEFAULT_BANK_ACCOUNTS);
	const [showAddClientModal, setShowAddClientModal] = useState(false);
	const [newClientName, setNewClientName] = useState("");
	const [newClientAddress, setNewClientAddress] = useState("");
	const [isSavingClient, setIsSavingClient] = useState(false);

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			if (params.get("create") === "true") {
				setShowAddModal(true);
			}
		}

		// Fetch database clients
		fetch(`${FINANCE_API_URL}/clients`)
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data && Array.isArray(data) && data.length > 0) {
					const mapped: ClientOption[] = data.map((item: any) => ({
						id: item.id || `cli-${Date.now()}`,
						name: (item.name || item.companyName || item.subName || "").toUpperCase(),
						address: (item.address || item.website || "").toUpperCase()
					})).filter((c: ClientOption) => c.name);

					if (mapped.length > 0) {
						setClientList(prev => {
							const existingNames = new Set(prev.map(p => p.name.toUpperCase()));
							const newItems = mapped.filter(m => !existingNames.has(m.name.toUpperCase()));
							return [...prev, ...newItems];
						});
					}
				}
			})
			.catch(() => null);

		// Fetch database bank accounts
		fetch(`${FINANCE_API_URL}/bank-accounts`)
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data && Array.isArray(data) && data.length > 0) {
					const mapped: BankAccountOption[] = data.map((item: any) => ({
						id: item.id || `acc-${Date.now()}`,
						bankName: (item.bankName || item.name || "").toUpperCase(),
						accountName: item.holderName || item.accountName || "New Era Transport Services",
						accountNumber: item.accountNumber || item.number || "1304247018"
					})).filter((b: BankAccountOption) => b.bankName);

					if (mapped.length > 0) {
						setBankAccountsList(prev => {
							const existingNames = new Set(prev.map(p => p.bankName.toUpperCase()));
							const newItems = mapped.filter(m => !existingNames.has(m.bankName.toUpperCase()));
							return [...prev, ...newItems];
						});
					}
				}
			})
			.catch(() => null);
	}, []);

	const handleCreateClientOnTheFly = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newClientName.trim()) return;

		setIsSavingClient(true);
		const nameUpper = newClientName.trim().toUpperCase();
		const addrUpper = newClientAddress.trim().toUpperCase();

		const newClientObj: ClientOption = {
			id: `cli-${Date.now()}`,
			name: nameUpper,
			address: addrUpper
		};

		// Select new client immediately
		setClientList(prev => [newClientObj, ...prev]);
		setBilledToName(nameUpper);
		if (addrUpper) setBilledToAddress(addrUpper);

		// Post to backend database
		try {
			await fetch(`${FINANCE_API_URL}/clients`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: nameUpper,
					companyName: nameUpper,
					subName: nameUpper,
					category: "COOPERATE CLIENT",
					status: "Active",
					email: `${nameUpper.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.com`,
					phone: "08000000000",
					address: addrUpper
				})
			}).catch(() => null);
		} catch (err) {
			// Fallback
		} finally {
			setIsSavingClient(false);
			setNewClientName("");
			setNewClientAddress("");
			setShowAddClientModal(false);
		}
	};

	// Invoice Document Form State
	const [invSerial, setInvSerial] = useState("008");
	const [invDate, setInvDate] = useState("2025-08-15");
	const [billedToName, setBilledToName] = useState("CHEMICAL AND ALLIED PRODUCTS PLC");
	const [invNumber, setInvNumber] = useState(() => formatInvoiceCode("CHEMICAL AND ALLIED PRODUCTS PLC", "2025-08-15", "008"));

	// Auto-update invoice code dynamically: NETS-[CLIENT_ACRONYM]-[YEAR]-[SERIAL]
	React.useEffect(() => {
		const dynamicCode = formatInvoiceCode(billedToName, invDate, invSerial);
		setInvNumber(dynamicCode);
	}, [billedToName, invDate, invSerial]);

	const [coyRegNumber, setCoyRegNumber] = useState("RC. 463290");
	const [poNumber, setPoNumber] = useState("");
	const [bankers, setBankers] = useState("providus");
	const [accountName, setAccountName] = useState("New Era Transport Services");
	const [accountNumber, setAccountNumber] = useState("1304247018");
	const [tinNumber, setTinNumber] = useState("19300499-0001");
	const [billedToAddress, setBilledToAddress] = useState("NO 2, ADENIYI JONES AVENUE, IKEJA LAGOS.");
	const [purposeOfInvoice, setPurposeOfInvoice] = useState("JULY 2025 INVOICE");
	const [salesRepId, setSalesRepId] = useState("");
	const [shippingMethod, setShippingMethod] = useState("Hand Delivery");
	const [dueDate, setDueDate] = useState("2025-08-30");

	const [lineItems, setLineItems] = useState<LineItem[]>([
		{ id: "1", date: "", truckNo: "MUS 07 YK", location: "", trackingId: "", tonnage: "", amount: "" }
	]);

	const [chargeInput, setChargeInput] = useState<number | string>("");
	const [vatPercent, setVatPercent] = useState<number>(7.5);
	const [opCoordination, setOpCoordination] = useState("Operation Coordination");
	const [headOfFinance, setHeadOfFinance] = useState("Head of Finance");

	// Core dynamic column headers state (editable & deletable)
	const [coreColumns, setCoreColumns] = useState({
		truckNo: { visible: true, title: "TRUCK NO" },
		location: { visible: true, title: "LOCATION" },
		trackingId: { visible: true, title: "TRACKING ID" },
		tonnage: { visible: true, title: "TONNAGE" }
	});

	// Calculation logic: CHARGE is editable; EXPENSES = Subtotal - Charge (derived)
	// VAT is applied to Charge when present, or to Subtotal when charge is not inputed
	const subtotal = lineItems.reduce((sum, item) => sum + parseNumberFromCommas(item.amount), 0);
	const charge = parseNumberFromCommas(chargeInput);
	const numExpenses = Math.max(0, subtotal - charge);
	const vatBasis = charge > 0 ? charge : subtotal;
	const vatAmount = (vatBasis * vatPercent) / 100;
	const grandTotal = subtotal + vatAmount;
	const amountInWords = numberToWordsNaira(grandTotal);

	const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);

	const handleAddColumn = () => {
		const colName = prompt("Enter new column header title (e.g. CONTAINER NO, DRIVER NAME, REMARKS):");
		if (colName && colName.trim()) {
			const newColId = `col_${Date.now()}`;
			setCustomColumns(prev => [...prev, { id: newColId, title: colName.trim().toUpperCase() }]);
		}
	};

	const handleAddRow = () => {
		const newId = String(Date.now());
		setLineItems(prev => [
			...prev,
			{ id: newId, date: "", truckNo: "MUS 07 YK", location: "", trackingId: "", tonnage: "", amount: "" }
		]);
	};

	const handleRemoveRow = (id: string) => {
		if (lineItems.length <= 1) return;
		setLineItems(prev => prev.filter(item => item.id !== id));
	};

	const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
		setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
	};

	const handleOpenCreateModal = () => {
		setInvNumber(formatInvoiceCode(billedToName, invDate, invSerial));
		setLineItems([
			{ id: "1", date: "", truckNo: "MUS 07 YK", location: "", trackingId: "", tonnage: "", amount: "" }
		]);
		setChargeInput("");
		setCoreColumns({
			truckNo: { visible: true, title: "TRUCK NO" },
			location: { visible: true, title: "LOCATION" },
			trackingId: { visible: true, title: "TRACKING ID" },
			tonnage: { visible: true, title: "TONNAGE" }
		});
		setCustomColumns([]);
		setShowAddModal(true);
	};

	const loadSampleTemplate = () => {
		setInvNumber("NETS-CAP-2025-008");
		setInvDate("2025-08-15");
		setCoyRegNumber("RC. 463290");
		setPoNumber("PO-88204");
		setBankers("providus");
		setAccountName("New Era Transport Services");
		setAccountNumber("1304247018");
		setTinNumber("19300499-0001");
		setBilledToName("CHEMICAL AND ALLIED PRODUCTS PLC");
		setBilledToAddress("NO 2, ADENIYI JONES AVENUE, IKEJA LAGOS.");
		setPurposeOfInvoice("JULY 2025 INVOICE");
		setSalesRepId("SR-102");
		setShippingMethod("Hand Delivery");
		setDueDate("2025-08-30");

		setLineItems([
			{ id: "1", date: "2025-07-11", truckNo: "MUS 07 YK", location: "IKEJA", trackingId: "16477", tonnage: 4880, amount: 28679.76 },
			{ id: "2", date: "2025-07-24", truckNo: "MUS 07 YK", location: "LEKKI", trackingId: "16644", tonnage: 6980, amount: 114402.20 },
			{ id: "3", date: "2025-07-25", truckNo: "MUS 07 YK", location: "GBAGADA", trackingId: "16656", tonnage: 4720, amount: 39581.92 },
			{ id: "4", date: "2025-07-29", truckNo: "MUS 07 YK", location: "IKEJA", trackingId: "16693", tonnage: 6920, amount: 40668.84 },
			{ id: "5", date: "2025-07-30", truckNo: "MUS 07 YK", location: "YABA", trackingId: "16715", tonnage: 5930, amount: 38865.22 },
			{ id: "6", date: "2025-07-31", truckNo: "MUS 07 YK", location: "ISOLO", trackingId: "16725", tonnage: 6300, amount: 64530.90 },
			{ id: "7", date: "2025-07-31", truckNo: "MUS 07 YK", location: "IBADAN", trackingId: "16744", tonnage: 5920, amount: 177209.28 }
		]);
		setChargeInput(125964.51);
		setVatPercent(7.5);
		setCoreColumns({
			truckNo: { visible: true, title: "TRUCK NO" },
			location: { visible: true, title: "LOCATION" },
			trackingId: { visible: true, title: "TRACKING ID" },
			tonnage: { visible: true, title: "TONNAGE" }
		});
	};

	const filteredInvoices = invoices.filter(inv => {
		const matchesSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.code.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesClient = selectedClientFilter === "All" || inv.clientName === selectedClientFilter;
		return matchesSearch && matchesClient;
	});

	const handleAddInvoiceSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const invData: Invoice = {
			id: `inv-${Date.now()}`,
			code: invNumber || `NETS-${Date.now().toString().slice(-4)}`,
			project: purposeOfInvoice || "Transport Logistics",
			clientName: billedToName || "Chemical & Allied Products PLC",
			addedBy: "Oluwatobiloba Olateju",
			total: grandTotal,
			paid: 0.00,
			unpaid: grandTotal,
			invoiceDate: invDate ? invDate.split("-").reverse().join("-") : "15-08-2025",
			status: "Draft"
		};
		setInvoices(prev => [invData, ...prev]);
		setShowAddModal(false);
	};

	const handleDeleteInvoice = (id: string) => {
		if (confirm("Are you sure you want to delete this invoice?")) {
			setInvoices(prev => prev.filter(i => i.id !== id));
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
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Duration</label>
					<input
						type="text"
						placeholder="Start Date To End Date"
						className="w-full px-3 py-2 bg-gray-50 border border-gray-250 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
					/>
				</div>

				<div className="md:col-span-3">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Client</label>
					<select
						value={selectedClientFilter}
						onChange={(e) => setSelectedClientFilter(e.target.value)}
						className="w-full px-3 py-2 bg-gray-50 border border-gray-250 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
					>
						<option value="All">All clients</option>
						<option value="Chemical & Allied Products PLC">Chemical & Allied Products PLC</option>
						<option value="Ecologique Transport Solution">Ecologique Transport Solution</option>
						<option value="IHS - Holding Limited">IHS - Holding Limited</option>
						<option value="Dulux - Chemical & Allied Product PLC">Dulux PLC</option>
						<option value="7UP Bottling Company">7UP Bottling Company</option>
						<option value="Nigerian Bottling Company (NBC)">Nigerian Bottling Company (NBC)</option>
					</select>
				</div>

				<div className="md:col-span-4 relative mt-4 md:mt-0">
					<label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Search</label>
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
				<SubNavTabs tabs={CLIENTS_TABS} activeTabId="invoices" colorTheme="red" />
			</div>

			{/* Table Actions Row */}
			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={handleOpenCreateModal}
					className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all border-none outline-none"
				>
					<IconPlus className="w-4 h-4" />
					Create Invoice
				</button>
				<button
					onClick={() => alert("Recurring invoices configuration...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconRefresh className="w-4 h-4 text-slate-400" />
					Recurring Invoice
				</button>
				<button
					onClick={() => alert("Time log invoice log options...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconClock className="w-4 h-4 text-slate-400" />
					Create Time Log Invoice
				</button>
				<button
					onClick={() => alert("Export invoices list...")}
					className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-850 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
				>
					<IconDownload className="w-4 h-4 text-slate-400" />
					Export
				</button>
			</div>

			{/* Table Grid */}
			<div className="overflow-x-auto min-h-[400px]">
				<table className="w-full text-left border-collapse select-none">
					<thead>
						<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
							<th className="pb-3 min-w-[140px]">Code / Ref</th>
							<th className="pb-3 min-w-[130px]">Purpose</th>
							<th className="pb-3 min-w-[200px]">Client</th>
							<th className="pb-3 min-w-[150px]">Added By</th>
							<th className="pb-3 min-w-[150px]">Total Amount</th>
							<th className="pb-3 min-w-[110px]">Invoice Date</th>
							<th className="pb-3 min-w-[100px]">Status</th>
							<th className="pb-3 text-right w-16">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredInvoices.length > 0 ? (
							filteredInvoices.map((inv) => (
								<tr key={inv.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
									<td className="py-4 font-mono font-bold text-slate-800">{inv.code}</td>
									<td className="py-4 text-slate-600 font-medium">{inv.project}</td>
									<td className="py-4">
										<p className="font-extrabold text-blue-600 hover:underline cursor-pointer">{inv.clientName}</p>
										<p className="text-[10px] text-slate-450 mt-0.5">{inv.clientName.toLowerCase().replace(/[^a-z0-9]/g, "") + "@nets.com"}</p>
									</td>
									<td className="py-4 text-slate-600">{inv.addedBy}</td>
									<td className="py-4">
										<div className="flex flex-col gap-0.5">
											<p className="text-slate-900 font-extrabold">{formatNaira(inv.total)}</p>
											<p className="text-[10px] text-emerald-600">Paid: {formatNaira(inv.paid)}</p>
											<p className="text-[10px] text-red-500">Unpaid: {formatNaira(inv.unpaid)}</p>
										</div>
									</td>
									<td className="py-4 text-slate-550">{inv.invoiceDate}</td>
									<td className="py-4">
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full uppercase">
											<span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
											{inv.status}
										</span>
									</td>
									<td className="py-4 text-right">
										<div className="flex justify-end gap-1">
											<button 
												onClick={() => handleDeleteInvoice(inv.id)}
												className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
												title="Delete Invoice"
											>
												<IconTrash className="w-4 h-4" />
											</button>
											<button className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors border-none bg-transparent">
												<IconDotsVertical className="w-4.5 h-4.5" />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No invoices found matching query.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* HIGH-FIDELITY DOCUMENT CREATE INVOICE MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-2 md:p-6 overflow-y-auto animate-fadeIn">
					<div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200/80 flex flex-col my-auto max-h-[92vh] overflow-hidden animate-slideUp">
						
						{/* Top Modal Navigation Header */}
						<div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 text-slate-900 shrink-0 no-print print:hidden">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
									<IconFileText className="w-5 h-5" />
								</div>
								<div>
									<h3 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
										Create Official Invoice Document
										<span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">NETS Standard</span>
									</h3>
									<p className="text-[11px] text-slate-500 font-semibold">Tailored transport & haulage billing template</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={loadSampleTemplate}
									className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
								>
									Load Sample
								</button>
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-sm font-bold border border-slate-200"
								>
									<IconX className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Paper Invoice Sheet Area */}
						<div className="overflow-y-auto p-4 md:p-8 bg-white flex justify-center">
							<form 
								id="invoice-document-form" 
								onSubmit={handleAddInvoiceSubmit}
								className="w-full max-w-4xl bg-white font-sans text-slate-900 text-xs flex flex-col gap-6"
							>
								{/* INVOICE PAPER HEADER */}
								<div className="flex flex-col md:flex-row justify-between items-start pb-0 gap-4">
									<div className="flex flex-col">
										<div className="flex items-center gap-3">
											<img 
												src="/favicon.png" 
												alt="NEW ERA Logo" 
												className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" 
											/>
											<div>
												<h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
													NEW ERA
												</h1>
												<p className="text-[10px] font-extrabold tracking-widest text-slate-600 uppercase">
													TRANSPORT SERVICES
												</p>
											</div>
										</div>
									</div>

									<div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-0 border-red-500 pl-3 md:pl-0">
										<p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">SERVICES</p>
										<p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
											HAULAGE • INTRA CITY TRANSPORT • LEASING • FLEET MANAGEMENT
										</p>
									</div>
								</div>

								{/* METADATA TABLE - SLEEK & COMPACT PAPER LAYOUT */}
								<div className="w-full shrink-0 border-2 border-slate-900 rounded-sm -mt-4 bg-white block">
									<table className="w-full text-left border-collapse table-fixed">
										<tbody className="divide-y divide-slate-900 text-xs text-slate-900">
											
											{/* Row 1: INVOICE NUMBER | BANKERS */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 w-[20%] text-slate-900 align-middle">
													INVOICE NUMBER
												</td>
												<td className="p-0.5 border-r border-slate-900 w-[30%] bg-white align-middle">
													<input
														type="text"
														required
														value={invNumber}
														onChange={(e) => setInvNumber(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-mono font-bold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 w-[20%] text-slate-900 align-middle">
													BANKERS
												</td>
												<td className="p-0.5 w-[30%] bg-white align-middle">
													<select
														value={bankers.toUpperCase()}
														onChange={(e) => {
															const val = e.target.value;
															setBankers(val);
															const selected = bankAccountsList.find(b => b.bankName.toUpperCase() === val.toUpperCase());
															if (selected) {
																if (selected.accountName) setAccountName(selected.accountName);
																if (selected.accountNumber) setAccountNumber(selected.accountNumber);
															}
														}}
														className="w-full h-full px-1.5 py-0.5 font-bold text-xs text-slate-900 outline-none bg-white cursor-pointer uppercase"
													>
														{bankAccountsList.map((b, idx) => (
															<option key={`bank-${b.id}-${idx}`} value={b.bankName.toUpperCase()}>
																{b.bankName.toUpperCase()}
															</option>
														))}
														{!bankAccountsList.some(b => b.bankName.toUpperCase() === bankers.toUpperCase()) && bankers && (
															<option value={bankers.toUpperCase()}>{bankers.toUpperCase()}</option>
														)}
													</select>
												</td>
											</tr>

											{/* Row 2: INVOICE DATE | ACCOUNT NAME */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													INVOICE DATE
												</td>
												<td className="p-0.5 border-r border-slate-900 bg-white align-middle">
													<input
														type="date"
														required
														value={invDate}
														onChange={(e) => setInvDate(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-semibold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													ACCOUNT NAME
												</td>
												<td className="p-0.5 bg-white align-middle">
													<input
														type="text"
														value={accountName}
														onChange={(e) => setAccountName(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-semibold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
											</tr>

											{/* Row 3: COY REG NUMBER | ACCOUNT NUMBER */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													COY REG NUMBER
												</td>
												<td className="p-0.5 border-r border-slate-900 bg-white align-middle">
													<input
														type="text"
														value={coyRegNumber}
														onChange={(e) => setCoyRegNumber(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-semibold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													ACCOUNT NUMBER
												</td>
												<td className="p-0.5 bg-white align-middle">
													<input
														type="text"
														value={accountNumber}
														onChange={(e) => setAccountNumber(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-mono font-bold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
											</tr>

											{/* Row 4: PO NUMBER | TIN */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													PO NUMBER
												</td>
												<td className="p-0.5 border-r border-slate-900 bg-white align-middle">
													<input
														type="text"
														placeholder="PO Number"
														value={poNumber}
														onChange={(e) => setPoNumber(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-semibold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													TIN
												</td>
												<td className="p-0.5 bg-white align-middle">
													<input
														type="text"
														value={tinNumber}
														onChange={(e) => setTinNumber(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-mono font-semibold text-xs text-slate-900 outline-none bg-transparent"
													/>
												</td>
											</tr>

											{/* Row 5a: BILLED TO */}
											<tr className="border-b border-slate-900 h-8">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													BILLED TO
												</td>
												<td colSpan={3} className="p-0.5 bg-white align-middle">
													<div className="flex items-center gap-1.5 w-full h-full px-1">
														<select
															required
															value={billedToName}
															onChange={(e) => {
																const val = e.target.value;
																if (val === "__ADD_NEW__") {
																	setShowAddClientModal(true);
																} else {
																	setBilledToName(val);
																	const selected = clientList.find(c => c.name === val);
																	if (selected && selected.address) {
																		setBilledToAddress(selected.address);
																	}
																}
															}}
															className="w-full h-full font-black text-xs uppercase outline-none text-slate-900 bg-white cursor-pointer py-0.5"
														>
															{!billedToName && <option value="">Select Client from Database...</option>}
															{clientList.map((c, idx) => (
																<option key={`client-${c.id}-${idx}`} value={c.name}>
																	{c.name}
																</option>
															))}
															{!clientList.some(c => c.name === billedToName) && billedToName && (
																<option value={billedToName}>{billedToName}</option>
															)}
															<option value="__ADD_NEW__" className="font-bold text-red-600 bg-slate-100">
																+ Add New Client to Database...
															</option>
														</select>
														<button
															type="button"
															onClick={() => setShowAddClientModal(true)}
															className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-sm border-none flex items-center gap-1"
															title="Add a new client to the database on the fly"
														>
															+ New Client
														</button>
													</div>
												</td>
											</tr>

											{/* Row 5b: ADDRESS */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													ADDRESS
												</td>
												<td colSpan={3} className="p-0.5 bg-white align-middle">
													<input
														type="text"
														placeholder="Address (e.g. NO 2, ADENIYI JONES AVENUE, IKEJA LAGOS)"
														value={billedToAddress}
														onChange={(e) => setBilledToAddress(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-semibold text-xs uppercase outline-none text-slate-900 bg-transparent"
													/>
												</td>
											</tr>

											{/* Row 6: PURPOSE OF INVOICE */}
											<tr className="border-b border-slate-900 h-7">
												<td className="p-1 px-2 font-black uppercase text-[9px] bg-slate-100 border-r border-slate-900 text-slate-900 align-middle">
													PURPOSE OF INVOICE
												</td>
												<td colSpan={3} className="p-0.5 bg-white align-middle">
													<input
														type="text"
														required
														placeholder="e.g. JULY 2025 INVOICE"
														value={purposeOfInvoice}
														onChange={(e) => setPurposeOfInvoice(e.target.value)}
														className="w-full h-full px-1.5 py-0.5 font-bold text-xs uppercase outline-none text-slate-900 bg-transparent"
													/>
												</td>
											</tr>

										</tbody>
									</table>

									{/* SALES REP ID | SHIPPING METHOD | DUE DATE TABLE */}
									<table className="w-full text-left border-collapse border-t border-slate-900 table-fixed">
										<thead>
											<tr className="bg-slate-100 border-b border-slate-900 text-[9px] font-black text-slate-900 uppercase tracking-tight text-center h-6">
												<th className="p-1 border-r border-slate-900 w-1/3 text-slate-900 align-middle">SALES REP ID</th>
												<th className="p-1 border-r border-slate-900 w-1/3 text-slate-900 align-middle">SHIPPING METHOD</th>
												<th className="p-1 w-1/3 text-slate-900 align-middle">DUE DATE</th>
											</tr>
										</thead>
										<tbody className="text-xs text-slate-900 bg-white">
											<tr className="h-7">
												<td className="p-0.5 border-r border-slate-900 align-middle">
													<input
														type="text"
														placeholder="Sales Rep ID"
														value={salesRepId}
														onChange={(e) => setSalesRepId(e.target.value)}
														className="w-full h-full px-1 py-0.5 font-semibold text-center outline-none text-slate-900 bg-transparent"
													/>
												</td>
												<td className="p-0.5 border-r border-slate-900 align-middle">
													<input
														type="text"
														placeholder="e.g. Hand Delivery"
														value={shippingMethod}
														onChange={(e) => setShippingMethod(e.target.value)}
														className="w-full h-full px-1 py-0.5 font-semibold text-center outline-none text-slate-900 bg-transparent"
													/>
												</td>
												<td className="p-0.5 align-middle">
													<input
														type="date"
														value={dueDate}
														onChange={(e) => setDueDate(e.target.value)}
														className="w-full h-full px-1 py-0.5 font-semibold text-center outline-none text-slate-900 bg-transparent"
													/>
												</td>
											</tr>
										</tbody>
									</table>
								</div>

								{/* TRANSPORTATION LINE ITEMS TABLE */}
								<div className="flex flex-col gap-2">
									<div className="flex justify-between items-center flex-wrap gap-2">
										<h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Haulage & Delivery Line Items</h4>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={handleAddColumn}
												className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700 shadow-sm"
												title="Add custom column header to line items table"
											>
												<IconPlus className="w-3.5 h-3.5 text-sky-400" />
												Add Column Item
											</button>
											<button
												type="button"
												onClick={handleAddRow}
												className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
											>
												<IconPlus className="w-3.5 h-3.5" />
												Add Line Item
											</button>
										</div>
									</div>

									<div className="overflow-x-auto border border-slate-900 rounded-sm">
										<table className="w-full text-left border-collapse border border-slate-900">
											<thead>
												<tr className="bg-slate-100 border-b border-slate-900 text-[10px] font-black text-slate-900 uppercase tracking-tight text-center">
													<th className="p-2 border-r border-slate-900 w-12">S/No</th>
													<th className="p-2 border-r border-slate-900 min-w-[110px]">DATE</th>
													{coreColumns.truckNo.visible && (
														<th className="p-1 border-r border-slate-900 min-w-[120px] align-middle">
															<div className="flex items-center justify-between gap-1 w-full px-1">
																<input
																	type="text"
																	value={coreColumns.truckNo.title}
																	onChange={(e) => setCoreColumns(prev => ({
																		...prev,
																		truckNo: { ...prev.truckNo, title: e.target.value.toUpperCase() }
																	}))}
																	className="w-full text-center bg-transparent border-none font-black text-[10px] text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none py-0.5"
																/>
																<button
																	type="button"
																	onClick={() => setCoreColumns(prev => ({
																		...prev,
																		truckNo: { ...prev.truckNo, visible: false }
																	}))}
																	className="text-red-650 hover:text-red-800 font-bold text-xs cursor-pointer px-1 no-print border-none bg-transparent"
																	title="Remove Column"
																>
																	×
																</button>
															</div>
														</th>
													)}
													{coreColumns.location.visible && (
														<th className="p-1 border-r border-slate-900 min-w-[120px] align-middle">
															<div className="flex items-center justify-between gap-1 w-full px-1">
																<input
																	type="text"
																	value={coreColumns.location.title}
																	onChange={(e) => setCoreColumns(prev => ({
																		...prev,
																		location: { ...prev.location, title: e.target.value.toUpperCase() }
																	}))}
																	className="w-full text-center bg-transparent border-none font-black text-[10px] text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none py-0.5"
																/>
																<button
																	type="button"
																	onClick={() => setCoreColumns(prev => ({
																		...prev,
																		location: { ...prev.location, visible: false }
																	}))}
																	className="text-red-650 hover:text-red-800 font-bold text-xs cursor-pointer px-1 no-print border-none bg-transparent"
																	title="Remove Column"
																>
																	×
																</button>
															</div>
														</th>
													)}
													{coreColumns.trackingId.visible && (
														<th className="p-1 border-r border-slate-900 min-w-[110px] align-middle">
															<div className="flex items-center justify-between gap-1 w-full px-1">
																<input
																	type="text"
																	value={coreColumns.trackingId.title}
																	onChange={(e) => setCoreColumns(prev => ({
																		...prev,
																		trackingId: { ...prev.trackingId, title: e.target.value.toUpperCase() }
																	}))}
																	className="w-full text-center bg-transparent border-none font-black text-[10px] text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none py-0.5"
																/>
																<button
																	type="button"
																	onClick={() => setCoreColumns(prev => ({
																		...prev,
																		trackingId: { ...prev.trackingId, visible: false }
																	}))}
																	className="text-red-650 hover:text-red-800 font-bold text-xs cursor-pointer px-1 no-print border-none bg-transparent"
																	title="Remove Column"
																>
																	×
																</button>
															</div>
														</th>
													)}
													{customColumns.map(col => (
														<th key={col.id} className="p-2 border-r border-slate-900 min-w-[120px]">
															<div className="flex items-center justify-between gap-1">
																<span>{col.title}</span>
																<button
																	type="button"
																	onClick={() => setCustomColumns(prev => prev.filter(c => c.id !== col.id))}
																	className="text-red-650 hover:text-red-800 font-black text-xs cursor-pointer px-1"
																	title="Remove Column"
																>
																	×
																</button>
															</div>
														</th>
													))}
													{coreColumns.tonnage.visible && (
														<th className="p-1 border-r border-slate-900 min-w-[100px] align-middle">
															<div className="flex items-center justify-between gap-1 w-full px-1">
																<input
																	type="text"
																	value={coreColumns.tonnage.title}
																	onChange={(e) => setCoreColumns(prev => ({
																		...prev,
																		tonnage: { ...prev.tonnage, title: e.target.value.toUpperCase() }
																	}))}
																	className="w-full text-center bg-transparent border-none font-black text-[10px] text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none py-0.5"
																/>
																<button
																	type="button"
																	onClick={() => setCoreColumns(prev => ({
																		...prev,
																		tonnage: { ...prev.tonnage, visible: false }
																	}))}
																	className="text-red-650 hover:text-red-800 font-bold text-xs cursor-pointer px-1 no-print border-none bg-transparent"
																	title="Remove Column"
																>
																	×
																</button>
															</div>
														</th>
													)}
													<th className="p-2 border-r border-slate-900 min-w-[130px]">AMOUNT (₦)</th>
													<th className="p-1 w-8"></th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-900 text-xs">
												{lineItems.map((item, idx) => (
													<tr key={item.id} className="hover:bg-amber-50/30">
														<td className="p-2 text-center font-bold border-r border-slate-900 bg-slate-50">{idx + 1}</td>
														<td className="p-1 border-r border-slate-900">
															<input
																type="date"
																value={item.date}
																onChange={(e) => handleItemChange(item.id, "date", e.target.value)}
																className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-medium focus:bg-white outline-none"
															/>
														</td>
														{coreColumns.truckNo.visible && (
															<td className="p-1 border-r border-slate-900">
																<input
																	type="text"
																	placeholder={`e.g. ${coreColumns.truckNo.title.toLowerCase()}`}
																	value={item.truckNo}
																	onChange={(e) => handleItemChange(item.id, "truckNo", e.target.value)}
																	className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-bold uppercase focus:bg-white outline-none text-slate-900"
																/>
															</td>
														)}
														{coreColumns.location.visible && (
															<td className="p-1 border-r border-slate-900">
																<input
																	type="text"
																	placeholder={`e.g. ${coreColumns.location.title.toLowerCase()}`}
																	value={item.location}
																	onChange={(e) => handleItemChange(item.id, "location", e.target.value)}
																	className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-semibold uppercase focus:bg-white outline-none text-slate-900"
																/>
															</td>
														)}
														{coreColumns.trackingId.visible && (
															<td className="p-1 border-r border-slate-900">
																<input
																	type="text"
																	placeholder={`e.g. ${coreColumns.trackingId.title.toLowerCase()}`}
																	value={item.trackingId}
																	onChange={(e) => handleItemChange(item.id, "trackingId", e.target.value)}
																	className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-mono font-medium text-center focus:bg-white outline-none text-slate-900"
																/>
															</td>
														)}
														{customColumns.map(col => (
															<td key={col.id} className="p-1 border-r border-slate-900">
																<input
																	type="text"
																	placeholder={col.title}
																	value={item.customValues?.[col.id] || ""}
																	onChange={(e) => {
																		const val = e.target.value;
																		setLineItems(prev => prev.map(row => row.id === item.id ? {
																			...row,
																			customValues: { ...(row.customValues || {}), [col.id]: val }
																		} : row));
																	}}
																	className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-medium focus:bg-white outline-none uppercase text-slate-900"
																/>
															</td>
														))}
														{coreColumns.tonnage.visible && (
															<td className="p-1 border-r border-slate-900">
																<input
																	type="text"
																	placeholder="0.00"
																	value={formatNumberWithCommas(item.tonnage)}
																	onChange={(e) => handleItemChange(item.id, "tonnage", e.target.value)}
																	className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-mono font-semibold text-right focus:bg-white outline-none text-slate-900"
																/>
															</td>
														)}
														<td className="p-1 border-r border-slate-900">
															<input
																type="text"
																placeholder="0.00"
																value={formatNumberWithCommas(item.amount)}
																onChange={(e) => handleItemChange(item.id, "amount", e.target.value)}
																className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-800 rounded font-mono font-bold text-right focus:bg-white outline-none text-slate-900"
															/>
														</td>
														<td className="p-1 text-center">
															{lineItems.length > 1 && (
																<button
																	type="button"
																	onClick={() => handleRemoveRow(item.id)}
																	className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded border-none bg-transparent cursor-pointer"
																	title="Delete Row"
																>
																	<IconTrash className="w-3.5 h-3.5" />
																</button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								{/* SUMMARY & FINANCIAL BREAKDOWN BOX */}
								<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">

									{/* Right Column: Financial Calculations Grid (Matching Image Totals) */}
									<div className="md:col-span-6 md:col-start-7 border border-slate-900 rounded-sm overflow-hidden text-xs">
										<div className="flex justify-between items-center p-2.5 border-b border-slate-900 bg-slate-50">
											<span className="font-black uppercase text-slate-800 text-[10px]">LINE ITEMS TOTAL</span>
											<span className="font-mono font-bold text-slate-900 text-xs">{formatNaira(subtotal)}</span>
										</div>

										{/* EXPENSES (DERIVED: Subtotal minus Charge) */}
										<div className="flex justify-between items-center p-2.5 border-b border-slate-900 bg-slate-50">
											<span className="font-black uppercase text-slate-800 text-[10px]">EXPENSES</span>
											<span className="font-mono font-bold text-slate-900 text-xs">{formatNaira(numExpenses)}</span>
										</div>

										{/* CHARGE (EDITABLE FIELD) */}
										<div className="flex justify-between items-center p-2 border-b border-slate-900 bg-white">
											<span className="font-extrabold uppercase text-slate-700 text-[10px]">CHARGE</span>
											<div className="flex items-center gap-1">
												<span className="text-slate-400 font-mono text-[11px]">₦</span>
												<input
													type="text"
													placeholder="0.00"
													value={formatNumberWithCommas(chargeInput)}
													onChange={(e) => setChargeInput(e.target.value)}
													className="w-36 px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-right text-xs focus:bg-amber-50/50 outline-none text-slate-900"
												/>
											</div>
										</div>

										<div className="flex justify-between items-center p-2 border-b border-slate-900 bg-white">
											<div className="flex items-center gap-2">
												<span className="font-extrabold uppercase text-slate-700 text-[10px]">VAT (%)</span>
												<input
													type="number"
													step="0.1"
													value={vatPercent}
													onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
													className="w-14 px-1 py-0.5 border border-slate-300 rounded font-mono font-semibold text-center text-xs focus:bg-amber-50/50 outline-none"
												/>
											</div>
											<span className="font-mono font-semibold text-slate-800">{formatNaira(vatAmount)}</span>
										</div>

										<div className="flex justify-between items-center p-3 bg-slate-900 text-white">
											<span className="font-black uppercase tracking-wider text-xs">GRAND TOTAL</span>
											<span className="font-mono font-black text-sm text-emerald-400">{formatNaira(grandTotal)}</span>
										</div>
									</div>

									{/* Left Column: Notes & Amount in Words */}
									<div className="md:col-span-6 md:col-start-7 flex flex-col gap-3">
										<div className="border border-slate-900 rounded-sm p-3 bg-amber-50/40">
											<span className="text-[10px] font-black uppercase text-slate-800 block mb-1">AMOUNT IN WORDS</span>
											<p className="text-xs font-bold italic text-slate-900 leading-snug">
												{amountInWords}
											</p>
										</div>

										<div className="text-[10px] text-slate-500 leading-normal italic">
											* All transport services subject to standard New Era Transport terms.
										</div>
									</div>
								</div>

								{/* SIGNATURE / AUTHORIZATION FOOTER */}
								<div className="grid grid-cols-2 gap-8 pt-10 mt-6 border-t-2 border-slate-900 pb-4">
									<div className="flex flex-col items-center gap-2 text-center">
										<div className="w-56 h-14 border-b-2 border-dashed border-slate-900 flex items-end justify-center pb-1">
											<span className="font-serif italic text-slate-400 text-sm">Operation Coordination</span>
										</div>
										<input
											type="text"
											value={opCoordination}
											onChange={(e) => setOpCoordination(e.target.value)}
											className="text-center font-black text-xs text-slate-900 uppercase border-b border-transparent focus:border-slate-400 outline-none bg-transparent"
										/>
									</div>

									<div className="flex flex-col items-center gap-2 text-center">
										<div className="w-56 h-14 border-b-2 border-dashed border-slate-900 flex items-end justify-center pb-1">
											<span className="font-serif italic text-slate-400 text-sm">Head of Finance</span>
										</div>
										<input
											type="text"
											value={headOfFinance}
											onChange={(e) => setHeadOfFinance(e.target.value)}
											className="text-center font-black text-xs text-slate-900 uppercase border-b border-transparent focus:border-slate-400 outline-none bg-transparent"
										/>
									</div>
								</div>

								{/* PAPER FOOTER STAMP */}
								<div className="pt-4 text-center border-t border-slate-200">
									<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
										NEW ERA TRANSPORT SERVICES • OFFICIAL INVOICE DOCUMENT
									</p>
								</div>

							</form>
						</div>

						{/* Modal Bottom Actions Bar */}
						<div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-white shrink-0 no-print">
							<div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
								<span>Grand Total:</span>
								<span className="text-slate-900 font-black text-sm">{formatNaira(grandTotal)}</span>
							</div>

							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => window.print()}
									className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<IconPrinter className="w-4 h-4" />
									Print Preview
								</button>
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									form="invoice-document-form"
									className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border-none"
								>
									<IconCheck className="w-4 h-4" />
									Generate & Save Invoice
								</button>
							</div>
						</div>

					</div>
				</div>
			)}

			{/* ADD NEW CLIENT ON THE FLY MODAL */}
			{showAddClientModal && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
					<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
						<div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
							<div className="flex items-center gap-2.5">
								<div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
									<IconUserPlus className="w-5 h-5" />
								</div>
								<div>
									<h3 className="font-black text-white text-sm uppercase tracking-wider">Add New Client to Database</h3>
									<p className="text-[11px] text-slate-400 font-medium">Create client profile on the fly</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowAddClientModal(false)}
								className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer border-none"
							>
								<IconX className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleCreateClientOnTheFly} className="p-6 flex flex-col gap-4">
							<div>
								<label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
									Client / Company Name *
								</label>
								<input
									type="text"
									required
									placeholder="e.g. DANGOTE CEMENT PLC"
									value={newClientName}
									onChange={(e) => setNewClientName(e.target.value)}
									className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-black uppercase text-slate-900 focus:border-slate-800 outline-none"
								/>
							</div>

							<div>
								<label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
									Address (Optional)
								</label>
								<input
									type="text"
									placeholder="e.g. NO 1, ALIKO DANGOTE WAY, IKEJA, LAGOS"
									value={newClientAddress}
									onChange={(e) => setNewClientAddress(e.target.value)}
									className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold uppercase text-slate-900 focus:border-slate-800 outline-none"
								/>
							</div>

							<div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
								<button
									type="button"
									onClick={() => setShowAddClientModal(false)}
									className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSavingClient}
									className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer border-none flex items-center gap-1.5"
								>
									{isSavingClient ? "Saving..." : "Save & Select Client"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

		</div>
	);
}

