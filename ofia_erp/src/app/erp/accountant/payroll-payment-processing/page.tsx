"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
	IconWallet,
	IconLock,
	IconRefresh,
	IconPlus,
	IconDeviceLaptop,
	IconLockOpen
} from "@tabler/icons-react";

const PAYMENTS_TABS = [
	{ id: "payment-processing", label: "Payment Processing", slug: "/accountant/payment-processing" },
	{ id: "expenses", label: "Expenses", slug: "/accountant/expenses" },
	{ id: "payroll", label: "Payroll", slug: "/accountant/payment-payroll" },
	{ id: "payroll-processing", label: "Payroll Payment Processing", slug: "/accountant/payroll-payment-processing" },
	{ id: "statutory-remittances", label: "Statutory Remittances", slug: "/accountant/statutory-remittances" },
	{ id: "employee-salaries", label: "Employee Salaries", slug: "/accountant/employee-salaries" },
	{ id: "email-recipients", label: "Email Notification Recipients", slug: "/accountant/email-notification-recipients" }
];

export default function PayrollPaymentProcessingPage() {
	const router = useRouter();

	const [walletActivated, setWalletActivated] = useState(false);
	const [walletBalance, setWalletBalance] = useState(0);
	const [queueAmount, setQueueAmount] = useState(0);

	const [authType, setAuthType] = useState("PIN");
	const [authValue, setAuthValue] = useState("");

	const [sourceBank, setSourceBank] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [recordExpense, setRecordExpense] = useState("Yes, create salary expense");
	const [expenseCategory, setExpenseCategory] = useState("");
	const [expenseTitle, setExpenseTitle] = useState("Salary payout for July 2026");

	const handleActivateWallet = () => {
		setWalletActivated(true);
		setWalletBalance(12500000.00); // seed balance on connection
		alert("Company payout wallet connected successfully!");
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
			
			{/* Top Header Block */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex justify-between items-center">
				<div className="text-left">
					<h2 className="text-[20px] font-black text-slate-800 tracking-tight">Payroll Payment Processing</h2>
					<p className="text-xs text-slate-455 font-semibold mt-1.5 max-w-3xl leading-relaxed">
						Workflow: HR locks final payslips in Payroll, sends selected payslips here, Finance/CFO approves the payout batch, then selected employees are released to GAP Finance processing.
						This page only handles payslips deliberately sent for payment. You can process some approved employees today and leave the rest for later.
					</p>
				</div>
				<button
					onClick={() => alert("Connecting to GAP Finance system...")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 self-start mt-1"
				>
					<IconDeviceLaptop className="w-4 h-4 text-slate-400" />
					GAP Finance
				</button>
			</div>

			{/* Sub-menu Tabs */}
			<div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/40">
				<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1">
					{PAYMENTS_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => router.push(tab.slug)}
							className={`px-5 py-3 font-extrabold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
								tab.id === "payroll-processing"
									? "border-red-500 text-red-500 font-bold"
									: "border-transparent text-slate-400 hover:text-slate-700"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Cards Row */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
				
				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-2">
					<h4 className="text-[11px] font-black text-slate-800 uppercase">Wallet readiness</h4>
					<p className="text-[10px] text-slate-455 font-semibold leading-relaxed">
						Activate or connect a company wallet before payroll can be sent for payout.
					</p>
					{!walletActivated ? (
						<button
							onClick={handleActivateWallet}
							className="mt-auto py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm active:scale-95 border-none outline-none cursor-pointer w-full"
						>
							Activate Wallet
						</button>
					) : (
						<span className="mt-auto text-emerald-600 font-bold text-xs flex items-center gap-1">
							✓ Wallet Connected
						</span>
					)}
				</div>

				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<h4 className="text-[11px] font-black text-slate-805 uppercase">Available balance</h4>
					<p className="text-[10px] text-slate-400 font-semibold">Current wallet balance</p>
					<p className="text-xl font-black text-slate-850 mt-auto pt-4">{formatNaira(walletBalance)}</p>
				</div>

				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<h4 className="text-[11px] font-black text-slate-805 uppercase">Payment queue</h4>
					<p className="text-[10px] text-slate-400 font-semibold">0 employee payouts awaiting completion</p>
					<p className="text-xl font-black text-slate-850 mt-auto pt-4">{formatNaira(queueAmount)}</p>
				</div>

				<div className="bg-white rounded-3xl p-5 border border-gray-100/40 shadow-sm flex flex-col gap-1">
					<h4 className="text-[11px] font-black text-slate-805 uppercase">Funding position</h4>
					<p className="text-[10px] text-emerald-600 font-extrabold">Wallet can cover the current queue.</p>
					<p className="text-xl font-black text-slate-850 mt-auto pt-4">{formatNaira(0.00)}</p>
				</div>

			</div>

			{/* How items get here block */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 text-left flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h4 className="font-extrabold text-slate-800 text-sm">How items get here</h4>
					<p className="text-xs text-slate-455 font-semibold mt-1">
						Go to Payroll, select payslips with <strong className="text-slate-800">Locked</strong> status, then use <strong className="text-slate-800">Send Selected To Payment Processing</strong>. Generated or review payslips stay in Payroll and cannot be paid from this queue.
					</p>
				</div>
				<button
					onClick={() => router.push("/accountant/payment-payroll")}
					className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-all self-start sm:self-center shrink-0"
				>
					Open Payroll
				</button>
			</div>

			{/* Accounting mapping block */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 text-left flex flex-col gap-4">
				<div className="flex justify-between items-center border-b border-gray-50 pb-3 flex-wrap gap-2">
					<div>
						<h4 className="font-extrabold text-slate-800 text-sm">Accounting mapping</h4>
						<p className="text-[10px] text-slate-455 font-semibold mt-0.5">
							Treat the connected wallet as an ERP bank account. Finance must choose the source account before payout so bank balances, expenses, and ledger postings stay aligned.
						</p>
					</div>
					<button
						onClick={() => router.push("/accountant/bank-accounts")}
						className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-[11px] cursor-pointer transition-all"
					>
						Manage Bank Accounts
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Money Source / Wallet Bank</label>
						<select
							value={sourceBank}
							onChange={(e) => setSourceBank(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
						>
							<option value="">-- Select source bank account --</option>
							<option value="Providus">1030 - Providus Bank</option>
							<option value="Globus">1050 - Globus Bank</option>
						</select>
						<span className="text-[9px] text-slate-400 font-semibold">This is the ERP bank/ledger account representing the wallet balance.</span>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Salary Payment Method</label>
						<select
							value={paymentMethod}
							onChange={(e) => setPaymentMethod(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
						>
							<option value="">-- Optional --</option>
							<option value="Bank Transfer">Bank Transfer</option>
							<option value="Wallet Payout">Wallet Payout</option>
						</select>
						<span className="text-[9px] text-slate-400 font-semibold">Stored on paid payslips for payroll audit history.</span>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Record Payout As Expense</label>
						<select
							value={recordExpense}
							onChange={(e) => setRecordExpense(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
						>
							<option value="Yes, create salary expense">Yes, create salary expense</option>
							<option value="No, post direct transaction">No, post direct transaction</option>
						</select>
						<span className="text-[9px] text-slate-400 font-semibold">If yes, successful payouts create approved expenses from the source bank.</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Expense Category</label>
						<select
							value={expenseCategory}
							onChange={(e) => setExpenseCategory(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
						>
							<option value="">-- Select category --</option>
							<option value="Wages & Salaries">Wages & Salaries</option>
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Expense Title</label>
						<input
							type="text"
							value={expenseTitle}
							onChange={(e) => setExpenseTitle(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
						/>
					</div>
				</div>
			</div>

			{/* Final wallet authentication block */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 text-left flex flex-col gap-4">
				<div>
					<h4 className="font-extrabold text-slate-800 text-sm">Final wallet authentication</h4>
					<p className="text-[10px] text-slate-455 font-semibold mt-0.5">
						Enter the wallet authorisation required by the provider before processing selected employees. This value is only sent to the provider and is not stored.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Auth Type</label>
						<select
							value={authType}
							onChange={(e) => setAuthType(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
						>
							<option value="PIN">PIN</option>
							<option value="Password">Password</option>
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-bold text-slate-455 uppercase">Auth Value</label>
						<input
							type="password"
							placeholder="Enter wallet PIN or password"
							value={authValue}
							onChange={(e) => setAuthValue(e.target.value)}
							className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-850"
						/>
					</div>
				</div>
			</div>

			{/* Payout batches block */}
			<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 text-left flex flex-col gap-4">
				<h4 className="font-extrabold text-slate-805 text-sm">Payout batches</h4>
				
				<div className="overflow-x-auto min-h-20 mt-1">
					<table className="w-full text-left border-collapse select-none">
						<thead>
							<tr className="border-b border-gray-100 text-slate-455 text-[11px] font-bold uppercase tracking-wider">
								<th className="pb-3 min-w-[120px]">Batch</th>
								<th className="pb-3 min-w-[120px]">Period</th>
								<th className="pb-3 min-w-[140px]">Employees</th>
								<th className="pb-3 min-w-[140px]">Amount</th>
								<th className="pb-3 min-w-[120px]">Status</th>
								<th className="pb-3 min-w-[150px]">Approval</th>
								<th className="pb-3 text-right w-24">Action</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-bold italic">
									No payslips have been sent to payment processing yet.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

		</div>
	);
}
