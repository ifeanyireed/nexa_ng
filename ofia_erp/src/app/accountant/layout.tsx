"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useERPStore, User } from "@/lib/erp-store";
import { motion } from "framer-motion";
import ERPLayout from "@/components/nets_erp/Layout";
import { FinanceContext, Stats, Expense, Invoice, Reconciliation, Transaction } from "./FinanceContext";

const FINANCE_API_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { users } = useERPStore();
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	// Microservice state
	const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalExpenses: 0, pendingPayables: 0, outstandingInvoice: 0 });
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Form Modals states
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [showExpenseModal, setShowExpenseModal] = useState(false);
	const [showReconcileModal, setShowReconcileModal] = useState(false);

	// New records states
	const [newInvoice, setNewInvoice] = useState({
		customerName: "",
		customerEmail: "",
		amount: "",
		dueDate: "",
		description: ""
	});

	const [newExpense, setNewExpense] = useState({
		title: "",
		category: "Fleet Operations",
		amount: "",
		description: ""
	});

	const [newReconcile, setNewReconcile] = useState({
		title: "",
		type: "Shuttle",
		periodStart: "",
		periodEnd: "",
		expectedAmount: "",
		actualAmount: "",
		notes: ""
	});

	// Chart of Accounts (COA) state
	const [accountsList, setAccountsList] = useState([
		{ code: "1000", name: "Cash and Bank", type: "Assets", isDebit: true, baseVal: 12000000 },
		{ code: "1001", name: "GTB Operating Account", type: "Assets", isDebit: true, baseVal: 3850000 },
		{ code: "1100", name: "Accounts Receivable", type: "Assets", isDebit: true, useOutstandingInvoice: true },
		{ code: "1300", name: "Fixed Assets (Fleet Vehicles)", type: "Assets", isDebit: true, baseVal: 45000000 },
		{ code: "1390", name: "Accumulated Depreciation", type: "Assets", isDebit: false, baseVal: 15000000 },
		{ code: "2000", name: "Accounts Payable", type: "Liabilities", isDebit: false, usePendingPayables: true },
		{ code: "2100", name: "Tax Payable", type: "Liabilities", isDebit: false, baseVal: 3.75 },
		{ code: "3000", name: "Owner Equity", type: "Equity", isDebit: false, useEquity: true },
		{ code: "10010", name: "REVENUE - IHS OUTSOURCED DRIVERS", type: "Income", isDebit: false, revenueRatio: 0.4 },
		{ code: "10020", name: "REVENUE - IHS STAFF BUS", type: "Income", isDebit: false, revenueRatio: 0.3 },
		{ code: "10130", name: "REVENUE - SHUTTLE CONTRACTS", type: "Income", isDebit: false, revenueRatio: 0.3 },
		{ code: "20010", name: "HIACE/STAFF BUS REPAIR & MAINTENANCE", type: "Expenses", isDebit: true, expenseRatio: 0.5 },
		{ code: "20020", name: "FLEET REPAIR AND MAINTENANCE - IHS", type: "Expenses", isDebit: true, expenseRatio: 0.3 },
		{ code: "30060", name: "SALARY AND WAGES", type: "Expenses", isDebit: true, expenseRatio: 0.2 }
	]);
	const [coaSearchQuery, setCoaSearchQuery] = useState("");
	const [coaFilterType, setCoaFilterType] = useState("All");
	const [showAddAccountModal, setShowAddAccountModal] = useState(false);
	const [newAccount, setNewAccount] = useState({
		code: "",
		name: "",
		type: "Assets",
		isDebit: "true",
		baseVal: ""
	});

	const [ledgerSearchQuery, setLedgerSearchQuery] = useState("");

	// Fetch all data from the finance microservice
	const fetchFinanceData = async () => {
		setLoading(true);
		try {
			// Fetch Stats
			const statsRes = await fetch(`${FINANCE_API_URL}/stats`).catch(() => null);
			const statsData = statsRes && statsRes.ok ? await statsRes.json() : { totalRevenue: 1500000, totalExpenses: 760000, pendingPayables: 310000, outstandingInvoice: 4250000 };
			setStats(statsData);

			// Fetch Expenses
			const expRes = await fetch(`${FINANCE_API_URL}/expenses`).catch(() => null);
			const expData = expRes && expRes.ok ? await expRes.json() : [];
			setExpenses(expData);

			// Fetch Invoices
			const invRes = await fetch(`${FINANCE_API_URL}/invoices`).catch(() => null);
			const invData = invRes && invRes.ok ? await invRes.json() : [];
			setInvoices(invData);

			// Fetch Reconciliations
			const recRes = await fetch(`${FINANCE_API_URL}/reconciliations`).catch(() => null);
			const recData = recRes && recRes.ok ? await recRes.json() : [];
			setReconciliations(recData);

			// Fetch Transactions
			const txRes = await fetch(`${FINANCE_API_URL}/transactions`).catch(() => null);
			const txData = txRes && txRes.ok ? await txRes.json() : [];
			setTransactions(txData);

			setError(null);
		} catch (err: any) {
			console.error("Error loading finance service details: ", err);
			setError("Unable to connect to the Finance microservice. Displaying cached local records.");
			loadLocalFallback();
		} finally {
			setLoading(false);
		}
	};

	const loadLocalFallback = () => {
		setStats({
			totalRevenue: 2420000,
			totalExpenses: 760000,
			pendingPayables: 310000,
			outstandingInvoice: 4250000
		});

		setExpenses([
			{ id: "exp-1", title: "Weekly Fuel Imprest - Lagos Fleet", category: "Fleet Operations", amount: 450000, status: "Approved", requestedBy: "Arotile Rotimi Seyi", createdAt: "2026-07-15T10:00:00Z" },
			{ id: "exp-2", title: "Office Internet Subscription", category: "Office Administration", amount: 75000, status: "Approved", requestedBy: "Emmanuel Victor Okon", createdAt: "2026-07-12T08:30:00Z" },
			{ id: "exp-3", title: "Bus Repair & Spare Parts (Bus 04)", category: "Fleet Operations", amount: 280000, status: "Pending", requestedBy: "Arotile Rotimi Seyi", createdAt: "2026-07-16T14:15:00Z" },
			{ id: "exp-4", title: "Weekly Petty Cash - Front Desk Support", category: "Petty Cash", amount: 30000, status: "Disbursed", requestedBy: "Victoria Aghogho Otojareri", createdAt: "2026-07-14T09:00:00Z" }
		]);

		setInvoices([
			{ id: "inv-1", invoiceNumber: "INV-2026-001", customerName: "Dangote Group Plc", customerEmail: "billing@dangote.com", amount: 1850000, dueDate: "2026-07-25", status: "Unpaid", createdAt: "2026-07-10T11:00:00Z" },
			{ id: "inv-2", invoiceNumber: "INV-2026-002", customerName: "Jumia Nigeria", customerEmail: "finance@jumia.com.ng", amount: 920000, dueDate: "2026-07-15", status: "Paid", createdAt: "2026-07-01T09:00:00Z" },
			{ id: "inv-3", invoiceNumber: "INV-2026-003", customerName: "Interswitch Group", customerEmail: "vendor-mgmt@interswitch.com", amount: 2400000, dueDate: "2026-08-05", status: "Unpaid", createdAt: "2026-07-12T15:30:00Z" },
			{ id: "inv-4", invoiceNumber: "INV-2026-004", customerName: "Andela Devs Ltd", customerEmail: "ops-payments@andela.com", amount: 680000, dueDate: "2026-07-01", status: "Overdue", createdAt: "2026-06-25T10:00:00Z" }
		]);

		setReconciliations([
			{ id: "rec-1", title: "Weekly Shuttle Services Reconciliation (W27)", type: "Shuttle", periodStart: "2026-07-01", periodEnd: "2026-07-07", expectedAmount: 1250000, actualAmount: 1250000, discrepancy: 0, status: "Resolved", preparedBy: "Victoria Aghogho Otojareri", createdAt: "2026-07-08T16:00:00Z" },
			{ id: "rec-2", title: "KHLC Training Bus Fuel & Operations", type: "KHLC", periodStart: "2026-07-01", periodEnd: "2026-07-07", expectedAmount: 320000, actualAmount: 315000, discrepancy: -5000, status: "Resolved", preparedBy: "Victoria Aghogho Otojareri", createdAt: "2026-07-08T16:30:00Z" },
			{ id: "rec-3", title: "Rental Bus Operations - Airport Runs", type: "Rental Bus", periodStart: "2026-07-08", periodEnd: "2026-07-14", expectedAmount: 850000, actualAmount: 800000, discrepancy: -50000, status: "Flagged", preparedBy: "Victoria Aghogho Otojareri", createdAt: "2026-07-15T12:00:00Z" }
		]);

		setTransactions([
			{ id: "txn-1", type: "Credit", category: "Revenue - Fleet Rental", amount: 920000, date: "2026-07-14", description: "Payment received from Jumia Nigeria for invoice INV-2026-002", createdAt: "2026-07-14T09:30:00Z" },
			{ id: "txn-2", type: "Debit", category: "Expense - Fleet Operations", amount: 450000, date: "2026-07-05", description: "Fuel Imprest disbursement for Lagos fleet operations", createdAt: "2026-07-05T11:00:00Z" },
			{ id: "txn-3", type: "Debit", category: "Expense - Petty Cash", amount: 30000, date: "2026-07-02", description: "Disbursement of weekly petty cash to admin desk", createdAt: "2026-07-02T10:00:00Z" },
			{ id: "txn-4", type: "Credit", category: "Revenue - Bus Ticket Sales", amount: 1500000, date: "2026-07-10", description: "Weekly cash and card ticket sales from terminals", createdAt: "2026-07-10T17:00:00Z" }
		]);
	};

	useEffect(() => {
		const stored = localStorage.getItem("erp_current_user");
		if (stored) {
			setCurrentUser(JSON.parse(stored));
		}
		fetchFinanceData();
	}, []);

	useEffect(() => {
		if (showInvoiceModal) {
			setShowInvoiceModal(false);
			router.push("/accountant/invoices?create=true");
		}
	}, [showInvoiceModal, router]);

	// Actions
	const handleCreateInvoice = async (e: React.FormEvent) => {
		e.preventDefault();
		const amountNum = parseFloat(newInvoice.amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		try {
			const res = await fetch(`${FINANCE_API_URL}/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					customerName: newInvoice.customerName,
					customerEmail: newInvoice.customerEmail,
					amount: amountNum,
					dueDate: newInvoice.dueDate,
					description: newInvoice.description || undefined
				})
			});
			if (res.ok) {
				setShowInvoiceModal(false);
				setNewInvoice({ customerName: "", customerEmail: "", amount: "", dueDate: "", description: "" });
				fetchFinanceData();
			} else {
				alert("Failed to submit invoice to microservice.");
			}
		} catch (err) {
			alert("Error connecting to server. Creating locally instead.");
			const mockInv: Invoice = {
				id: `inv-${Date.now()}`,
				invoiceNumber: `INV-2026-${Math.floor(Math.random() * 1000)}`,
				customerName: newInvoice.customerName,
				customerEmail: newInvoice.customerEmail,
				amount: amountNum,
				dueDate: newInvoice.dueDate,
				status: "Unpaid",
				description: newInvoice.description || undefined,
				createdAt: new Date().toISOString()
			};
			setInvoices(prev => [mockInv, ...prev]);
			setStats(prev => ({
				...prev,
				outstandingInvoice: prev.outstandingInvoice + amountNum
			}));
			setShowInvoiceModal(false);
			setNewInvoice({ customerName: "", customerEmail: "", amount: "", dueDate: "", description: "" });
		}
	};

	const handleCreateExpense = async (e: React.FormEvent) => {
		e.preventDefault();
		const amountNum = parseFloat(newExpense.amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			alert("Please enter a valid amount");
			return;
		}

		const requestedBy = currentUser?.name || "Victoria Aghogho Otojareri";

		try {
			const res = await fetch(`${FINANCE_API_URL}/expenses`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newExpense.title,
					category: newExpense.category,
					amount: amountNum,
					requestedBy: requestedBy,
					description: newExpense.description || undefined
				})
			});
			if (res.ok) {
				setShowExpenseModal(false);
				setNewExpense({ title: "", category: "Fleet Operations", amount: "", description: "" });
				fetchFinanceData();
			} else {
				alert("Failed to submit expense request.");
			}
		} catch (err) {
			alert("Error connecting to server. Submitting locally.");
			const mockExp: Expense = {
				id: `exp-${Date.now()}`,
				title: newExpense.title,
				category: newExpense.category,
				amount: amountNum,
				status: "Pending",
				requestedBy: requestedBy,
				createdAt: new Date().toISOString()
			};
			setExpenses(prev => [mockExp, ...prev]);
			setStats(prev => ({
				...prev,
				pendingPayables: prev.pendingPayables + amountNum
			}));
			setShowExpenseModal(false);
			setNewExpense({ title: "", category: "Fleet Operations", amount: "", description: "" });
		}
	};

	const handleCreateReconciliation = async (e: React.FormEvent) => {
		e.preventDefault();
		const expectedNum = parseFloat(newReconcile.expectedAmount);
		const actualNum = parseFloat(newReconcile.actualAmount);
		if (isNaN(expectedNum) || isNaN(actualNum)) {
			alert("Please enter valid amount values");
			return;
		}

		const discrepancy = actualNum - expectedNum;
		const preparedBy = currentUser?.name || "Victoria Aghogho Otojareri";

		try {
			const res = await fetch(`${FINANCE_API_URL}/reconciliations`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newReconcile.title,
					type: newReconcile.type,
					periodStart: newReconcile.periodStart,
					periodEnd: newReconcile.periodEnd,
					expectedAmount: expectedNum,
					actualAmount: actualNum,
					preparedBy: preparedBy,
					notes: newReconcile.notes || undefined
				})
			});
			if (res.ok) {
				setShowReconcileModal(false);
				setNewReconcile({ title: "", type: "Shuttle", periodStart: "", periodEnd: "", expectedAmount: "", actualAmount: "", notes: "" });
				fetchFinanceData();
			} else {
				alert("Failed to save reconciliation log.");
			}
		} catch (err) {
			alert("Error connecting to server. Saving locally.");
			const mockRec: Reconciliation = {
				id: `rec-${Date.now()}`,
				title: newReconcile.title,
				type: newReconcile.type,
				periodStart: newReconcile.periodStart,
				periodEnd: newReconcile.periodEnd,
				expectedAmount: expectedNum,
				actualAmount: actualNum,
				discrepancy: discrepancy,
				status: discrepancy === 0 ? "Resolved" : "Flagged",
				preparedBy: preparedBy,
				notes: newReconcile.notes || undefined,
				createdAt: new Date().toISOString()
			};
			setReconciliations(prev => [mockRec, ...prev]);
			setShowReconcileModal(false);
			setNewReconcile({ title: "", type: "Shuttle", periodStart: "", periodEnd: "", expectedAmount: "", actualAmount: "", notes: "" });
		}
	};

	const handleResolveReconciliation = async (id: string) => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/reconciliations?id=${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" }
			});
			if (res.ok) {
				fetchFinanceData();
			} else {
				alert("Failed to update status on server.");
			}
		} catch (err) {
			const rec = reconciliations.find(r => r.id === id);
			if (rec) {
				rec.status = "Resolved";
				setReconciliations([...reconciliations]);
			}
		}
	};

	const handleUpdateInvoiceStatus = async (id: string, status: string) => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/invoices`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status })
			});
			if (res.ok) {
				fetchFinanceData();
			} else {
				alert("Failed to update status.");
			}
		} catch (err) {
			const inv = invoices.find(i => i.id === id);
			if (!inv) return;
			const oldStatus = inv.status;
			inv.status = status;
			setInvoices([...invoices]);

			if (status === "Paid") {
				setStats(prev => ({
					...prev,
					outstandingInvoice: Math.max(0, prev.outstandingInvoice - inv.amount),
					totalRevenue: prev.totalRevenue + inv.amount
				}));
				const newTxn: Transaction = {
					id: `txn-${Date.now()}`,
					type: "Credit",
					category: "Revenue - Invoiced",
					amount: inv.amount,
					date: new Date().toISOString().split("T")[0],
					description: `Payment received for Invoice ${inv.invoiceNumber} (${inv.customerName})`,
					createdAt: new Date().toISOString()
				};
				setTransactions(prev => [newTxn, ...prev]);
			}
		}
	};

	const handleUpdateExpenseStatus = async (id: string, status: string) => {
		try {
			const res = await fetch(`${FINANCE_API_URL}/expenses`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status })
			});
			if (res.ok) {
				fetchFinanceData();
			} else {
				alert("Failed to update status.");
			}
		} catch (err) {
			const exp = expenses.find(e => e.id === id);
			if (!exp) return;
			exp.status = status;
			setExpenses([...expenses]);

			if (status === "Disbursed") {
				setStats(prev => ({
					...prev,
					pendingPayables: Math.max(0, prev.pendingPayables - exp.amount),
					totalExpenses: prev.totalExpenses + exp.amount
				}));
				const newTxn: Transaction = {
					id: `txn-${Date.now()}`,
					type: "Debit",
					category: `Expense - ${exp.category}`,
					amount: exp.amount,
					date: new Date().toISOString().split("T")[0],
					description: `Disbursement for Expense: ${exp.title} (Requested by ${exp.requestedBy})`,
					createdAt: new Date().toISOString()
				};
				setTransactions(prev => [newTxn, ...prev]);
			}
		}
	};

	// Format currency (Naira)
	const formatNaira = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 2
		}).format(amount);
	};

	const formatNairaShort = (val: number) => {
		const isNegative = val < 0;
		const absVal = Math.abs(val);
		let formatted = "";
		if (absVal >= 1000000) {
			formatted = `₦${(absVal / 1000000).toFixed(2)}M`;
		} else if (absVal >= 1000) {
			formatted = `₦${(absVal / 1000).toFixed(1)}k`;
		} else {
			formatted = `₦${absVal.toFixed(2)}`;
		}
		return isNegative ? `-${formatted}` : formatted;
	};

	const totalAssets = stats.totalRevenue - stats.totalExpenses + 12000000;
	const totalLiabilities = stats.pendingPayables + 50000;
	const equity = totalAssets - totalLiabilities;
	const netPosition = stats.totalRevenue - stats.totalExpenses;

	// Chart of accounts mock array based on the screenshot
	const chartOfAccounts = accountsList.map(a => {
		let val = 0;
		if (a.useOutstandingInvoice) {
			val = stats.outstandingInvoice;
		} else if (a.usePendingPayables) {
			val = stats.pendingPayables;
		} else if (a.useEquity) {
			val = equity;
		} else if (a.revenueRatio !== undefined) {
			val = stats.totalRevenue * a.revenueRatio;
		} else if (a.expenseRatio !== undefined) {
			val = stats.totalExpenses * a.expenseRatio;
		} else if (a.code === "1000") {
			val = totalAssets - 4000000;
		} else {
			val = a.baseVal || 0;
		}

		return {
			code: a.code,
			name: a.name,
			type: a.type,
			debit: a.isDebit ? val : 0,
			credit: !a.isDebit ? val : 0,
			status: "Active"
		};
	});

	const navTabs = [
		{ id: "overview", label: "Finance Hub", slug: "/accountant/overview" },
		{ id: "coa", label: "Chart of Accounts", slug: "/accountant/coa" },
		{ id: "ledger", label: "General Journal Ledger", slug: "/accountant/ledger" }
	];

	const getActiveTab = () => {
		if (pathname.includes("/coa")) return "coa";
		if (pathname.includes("/ledger")) return "ledger";
		return "overview";
	};

	const activeTab = getActiveTab();
	const isClientsPage = pathname.includes("/clients") || 
		pathname.includes("/vendors") || 
		pathname.includes("/bills") || 
		pathname.includes("/debit-notes") || 
		pathname.includes("/bank-accounts") || 
		pathname.includes("/banking") || 
		pathname.includes("/products") || 
		pathname.includes("/product-stock") ||
		pathname.includes("/proposals") ||
		pathname.includes("/retainers") ||
		pathname.includes("/estimates") ||
		pathname.includes("/invoices") ||
		pathname.includes("/payments") ||
		pathname.includes("/credit-notes") ||
		pathname.includes("/journal-entries") ||
		pathname.includes("/recurring-journals") ||
		pathname.includes("/reconcile") ||
		pathname.includes("/budget-planner") ||
		pathname.includes("/period-close") ||
		pathname.includes("/audit-trail") ||
		pathname.includes("/finance-reports") ||
		pathname.includes("/ledger-summary") ||
		pathname.includes("/trial-balance") ||
		pathname.includes("/financial-position") ||
		pathname.includes("/aged-receivables") ||
		pathname.includes("/aged-payables") ||
		pathname.includes("/payment-processing") ||
		pathname.includes("/expenses") ||
		pathname.includes("/payment-payroll") ||
		pathname.includes("/payroll-payment-processing") ||
		pathname.includes("/statutory-remittances") ||
		pathname.includes("/employee-salaries") ||
		pathname.includes("/email-notification-recipients");

	const getHeaderContent = () => {
		switch (activeTab) {
			case "coa":
				return {
					title: "Chart of Accounts (COA)",
					desc: "Organize and manage your general ledger accounts, codes, classifications, and balance sides."
				};
			case "ledger":
				return {
					title: "General Journal Ledger",
					desc: "Review chronological double-entry journal transactions, debit/credit details, and ledger logs."
				};
			case "overview":
			default:
				return {
					title: "Finance Hub Overview",
					desc: "Manage corporate accounts, invoice approvals, cashbook reconciliations, and imprest distributions."
				};
		}
	};

	const headerContent = getHeaderContent();

	return (
		<FinanceContext.Provider
			value={{
				currentUser,
				stats,
				expenses,
				invoices,
				reconciliations,
				transactions,
				loading,
				error,
				accountsList,
				setAccountsList,
				chartOfAccounts,
				coaSearchQuery,
				setCoaSearchQuery,
				coaFilterType,
				setCoaFilterType,
				showAddAccountModal,
				setShowAddAccountModal,
				newAccount,
				setNewAccount,
				ledgerSearchQuery,
				setLedgerSearchQuery,
				showInvoiceModal,
				setShowInvoiceModal,
				showExpenseModal,
				setShowExpenseModal,
				showReconcileModal,
				setShowReconcileModal,
				newInvoice,
				setNewInvoice,
				newExpense,
				setNewExpense,
				newReconcile,
				setNewReconcile,
				fetchFinanceData,
				handleCreateInvoice,
				handleCreateExpense,
				handleCreateReconciliation,
				handleResolveReconciliation,
				handleUpdateInvoiceStatus,
				handleUpdateExpenseStatus,
				formatNaira,
				formatNairaShort
			}}
		>
			<ERPLayout>
				{isClientsPage ? (
					loading ? (
						<div className="py-20 flex justify-center items-center">
							<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
						</div>
					) : (
						children
					)
				) : (
					<div className="flex flex-col gap-6">
						
						{/* Top Command Banner - Title & Subtitle block */}
						<div>
							<h2 className="text-[20px] font-black text-slate-800 tracking-tight">{headerContent.title}</h2>
							<p className="text-xs text-slate-455 font-semibold mt-1">
								{headerContent.desc}
							</p>

							{/* Action Buttons Row */}
							<div className="flex items-center gap-2 flex-wrap mt-3">
								<button
									onClick={() => router.push("/accountant/invoices?create=true")}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer border-none"
								>
									Create Invoice
								</button>
								<button
									onClick={() => setShowExpenseModal(true)}
									className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
								>
									Request Imprest
								</button>
								<button
									onClick={() => setShowReconcileModal(true)}
									className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
								>
									New Reconciliation
								</button>
							</div>
						</div>

						{/* Nav Tabs */}
						<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
							{navTabs.map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => router.push(tab.slug)}
										className={`relative px-5 py-3 font-extrabold text-xs whitespace-nowrap transition-all cursor-pointer ${
											isActive
												? "text-blue-600 font-bold"
												: "text-slate-400 hover:text-slate-700"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeAccountantSubmenuUnderline"
												className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10"
												transition={{ type: "spring", stiffness: 380, damping: 30 }}
											/>
										)}
										{tab.label}
									</button>
								);
							})}
						</div>

						{loading ? (
							<div className="py-20 flex justify-center items-center">
								<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
							</div>
						) : (
							<div className="flex flex-col gap-6">
								{children}
							</div>
						)}

					</div>
				)}

				{/* MODAL 5: ADD ACCOUNT FORM */}
				{showAddAccountModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
						<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
							{/* Header */}
							<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
								<div>
									<h3 className="font-extrabold text-slate-800 text-sm">Add New Ledger Account</h3>
									<p className="text-[10px] text-slate-450 mt-0.5 font-semibold">Integrate a new code into the Chart of Accounts</p>
								</div>
								<button
									onClick={() => setShowAddAccountModal(false)}
									className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold border-none bg-transparent"
								>
									✕
								</button>
							</div>

							{/* Form Body */}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									if (!newAccount.code || !newAccount.name) {
										alert("Please fill in Code and Name fields.");
										return;
									}
									const baseNum = parseFloat(newAccount.baseVal) || 0;
									setAccountsList(prev => [
										...prev,
										{
											code: newAccount.code,
											name: newAccount.name,
											type: newAccount.type,
											isDebit: newAccount.isDebit === "true",
											baseVal: baseNum
										}
									]);
									setShowAddAccountModal(false);
									setNewAccount({ code: "", name: "", type: "Assets", isDebit: "true", baseVal: "" });
								}}
								className="p-6 flex flex-col gap-4 text-left"
							>
								{/* Account Code */}
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Account Code</label>
									<input
										type="text"
										placeholder="e.g. 1005"
										required
										value={newAccount.code}
										onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>

								{/* Account Name */}
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-455 uppercase">Account Name</label>
									<input
										type="text"
										placeholder="e.g. Apex Bank Account"
										required
										value={newAccount.name}
										onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>

								{/* Account Type */}
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Account Type</label>
									<select
										value={newAccount.type}
										onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="Assets">Assets</option>
										<option value="Liabilities">Liabilities</option>
										<option value="Equity">Equity</option>
										<option value="Income">Income (Revenue)</option>
										<option value="Expenses">Expenses</option>
									</select>
								</div>

								{/* Balance Type (Debit / Credit) */}
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Normal Balance side</label>
									<select
										value={newAccount.isDebit}
										onChange={(e) => setNewAccount(prev => ({ ...prev, isDebit: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									>
										<option value="true">Debit Side (Asset / Expense)</option>
										<option value="false">Credit Side (Liability / Equity / Revenue)</option>
									</select>
								</div>

								{/* Base Balance */}
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Initial Balance (NGN)</label>
									<input
										type="number"
										step="0.01"
										placeholder="e.g. 500000"
										value={newAccount.baseVal}
										onChange={(e) => setNewAccount(prev => ({ ...prev, baseVal: e.target.value }))}
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>

								{/* Actions */}
								<div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-gray-100">
									<button
										type="button"
										onClick={() => setShowAddAccountModal(false)}
										className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-blue-500/10 border-none"
									>
										Register Account
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* MODAL 1: CREATE INVOICE REDIRECT HANDLER */}
				{showInvoiceModal && (
					<React.Fragment>
						{/* Redirecting to document invoice modal on invoices page */}
					</React.Fragment>
				)}

				{/* MODAL 2: REQUEST IMPREST */}
				{showExpenseModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
						<div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 max-w-md w-full flex flex-col gap-4">
							<div className="flex justify-between items-center pb-2 border-b border-gray-100">
								<h3 className="font-black text-slate-800 text-md">Request Imprest / Expense</h3>
								<button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700 font-extrabold text-sm border-none bg-transparent">✕</button>
							</div>
							<form onSubmit={handleCreateExpense} className="flex flex-col gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Imprest Title</label>
									<input
										type="text"
										required
										value={newExpense.title}
										onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
										placeholder="e.g. Fuel purchase for staff bus hiace"
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-450 uppercase">Category</label>
										<select
											value={newExpense.category}
											onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										>
											<option value="Fleet Operations">Fleet Operations</option>
											<option value="Office Administration">Office Administration</option>
											<option value="Petty Cash">Petty Cash</option>
											<option value="Travel & Logistics">Travel & Logistics</option>
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-450 uppercase">Amount (NGN)</label>
										<input
											type="number"
											required
											min="1"
											step="0.01"
											value={newExpense.amount}
											onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
											placeholder="15000"
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Expense Description</label>
									<textarea
										rows={3}
										value={newExpense.description}
										onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
										placeholder="Spare parts replacement for Hiace Staff Bus"
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold resize-none"
									/>
								</div>
								<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
									<button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 border border-gray-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 bg-white">Cancel</button>
									<button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer">Submit Request</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* MODAL 3: LOG BANK RECONCILIATION */}
				{showReconcileModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
						<div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 max-w-md w-full flex flex-col gap-4">
							<div className="flex justify-between items-center pb-2 border-b border-gray-100">
								<h3 className="font-black text-slate-800 text-md">New Reconciliation Log</h3>
								<button onClick={() => setShowReconcileModal(false)} className="text-slate-400 hover:text-slate-700 font-extrabold text-sm border-none bg-transparent">✕</button>
							</div>
							<form onSubmit={handleCreateReconciliation} className="flex flex-col gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Reconciliation Title</label>
									<input
										type="text"
										required
										value={newReconcile.title}
										onChange={(e) => setNewReconcile({ ...newReconcile, title: e.target.value })}
										placeholder="e.g. W28 GTBank Cashbook Match"
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-450 uppercase">Reconcile Type</label>
										<select
											value={newReconcile.type}
											onChange={(e) => setNewReconcile({ ...newReconcile, type: e.target.value })}
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										>
											<option value="Shuttle">Shuttle Services</option>
											<option value="KHLC">KHLC Operations</option>
											<option value="Rental Bus">Rental Bus</option>
											<option value="General Ops">General Operations</option>
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-455 uppercase">Expected Amount (NGN)</label>
										<input
											type="number"
											required
											value={newReconcile.expectedAmount}
											onChange={(e) => setNewReconcile({ ...newReconcile, expectedAmount: e.target.value })}
											placeholder="expected from cashbook"
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-450 uppercase">Actual Bank Amount (NGN)</label>
										<input
											type="number"
											required
											value={newReconcile.actualAmount}
											onChange={(e) => setNewReconcile({ ...newReconcile, actualAmount: e.target.value })}
											placeholder="actual from statement"
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-455 uppercase">Period Start</label>
										<input
											type="date"
											required
											value={newReconcile.periodStart}
											onChange={(e) => setNewReconcile({ ...newReconcile, periodStart: e.target.value })}
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="flex flex-col gap-1">
										<label className="text-[10px] font-bold text-slate-455 uppercase">Period End</label>
										<input
											type="date"
											required
											value={newReconcile.periodEnd}
											onChange={(e) => setNewReconcile({ ...newReconcile, periodEnd: e.target.value })}
											className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[10px] font-bold text-slate-450 uppercase">Notes</label>
									<textarea
										rows={2}
										value={newReconcile.notes}
										onChange={(e) => setNewReconcile({ ...newReconcile, notes: e.target.value })}
										placeholder="Add reconciliation comments"
										className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold resize-none"
									/>
								</div>
								<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
									<button type="button" onClick={() => setShowReconcileModal(false)} className="px-4 py-2 border border-gray-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 bg-white">Cancel</button>
									<button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer">Save Log</button>
								</div>
							</form>
						</div>
					</div>
				)}

			</ERPLayout>
		</FinanceContext.Provider>
	);
}
