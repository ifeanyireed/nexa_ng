"use client";

import React, { createContext, useContext } from "react";
import { User } from "@/lib/erp-store";

export interface Expense {
	id: string;
	title: string;
	category: string;
	amount: number;
	status: string;
	requestedBy: string;
	approvedBy?: string;
	description?: string;
	createdAt: string;
}

export interface Invoice {
	id: string;
	invoiceNumber: string;
	customerName: string;
	customerEmail: string;
	amount: number;
	dueDate: string;
	status: string;
	description?: string;
	createdAt: string;
}

export interface Reconciliation {
	id: string;
	title: string;
	type: string;
	periodStart: string;
	periodEnd: string;
	expectedAmount: number;
	actualAmount: number;
	discrepancy: number;
	status: string;
	preparedBy: string;
	notes?: string;
	createdAt: string;
}

export interface Transaction {
	id: string;
	referenceId?: string;
	type: string; // "Credit" or "Debit"
	category: string;
	amount: number;
	date: string;
	description?: string;
	createdAt: string;
}

export interface Stats {
	totalRevenue: number;
	totalExpenses: number;
	pendingPayables: number;
	outstandingInvoice: number;
}

export interface COAAccount {
	code: string;
	name: string;
	type: string;
	debit: number;
	credit: number;
	status: string;
}

interface FinanceContextType {
	currentUser: User | null;
	stats: Stats;
	expenses: Expense[];
	invoices: Invoice[];
	reconciliations: Reconciliation[];
	transactions: Transaction[];
	loading: boolean;
	error: string | null;
	
	// COA state
	accountsList: any[];
	setAccountsList: React.Dispatch<React.SetStateAction<any[]>>;
	chartOfAccounts: COAAccount[];
	coaSearchQuery: string;
	setCoaSearchQuery: (q: string) => void;
	coaFilterType: string;
	setCoaFilterType: (t: string) => void;
	showAddAccountModal: boolean;
	setShowAddAccountModal: (show: boolean) => void;
	newAccount: any;
	setNewAccount: React.Dispatch<React.SetStateAction<any>>;

	// Ledger state
	ledgerSearchQuery: string;
	setLedgerSearchQuery: (q: string) => void;

	// Modal states
	showInvoiceModal: boolean;
	setShowInvoiceModal: (show: boolean) => void;
	showExpenseModal: boolean;
	setShowExpenseModal: (show: boolean) => void;
	showReconcileModal: boolean;
	setShowReconcileModal: (show: boolean) => void;

	// Form input states
	newInvoice: any;
	setNewInvoice: React.Dispatch<React.SetStateAction<any>>;
	newExpense: any;
	setNewExpense: React.Dispatch<React.SetStateAction<any>>;
	newReconcile: any;
	setNewReconcile: React.Dispatch<React.SetStateAction<any>>;

	// Action triggers
	fetchFinanceData: () => Promise<void>;
	handleCreateInvoice: (e: React.FormEvent) => Promise<void>;
	handleCreateExpense: (e: React.FormEvent) => Promise<void>;
	handleCreateReconciliation: (e: React.FormEvent) => Promise<void>;
	handleResolveReconciliation: (id: string) => Promise<void>;
	handleUpdateInvoiceStatus: (id: string, status: string) => Promise<void>;
	handleUpdateExpenseStatus: (id: string, status: string) => Promise<void>;
	formatNaira: (amount: number) => string;
	formatNairaShort: (amount: number) => string;
}

export const FinanceContext = createContext<FinanceContextType | null>(null);

export function useFinance() {
	const context = useContext(FinanceContext);
	if (!context) {
		throw new Error("useFinance must be used within a FinanceProvider");
	}
	return context;
}
