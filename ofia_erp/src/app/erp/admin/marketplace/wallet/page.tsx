"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  ShieldCheck,
  History,
  TrendingUp,
  AlertCircle,
  Building,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";

interface WalletData {
  availableBalance: number;
  escrowBalance: number;
  totalWithdrawn: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface WalletTx {
  id: string;
  type: string;
  amount: number;
  reference: string;
  description: string;
  channel?: string;
  isEscrow?: boolean;
  status: string;
  createdAt: string;
}

const NIGERIAN_BANKS = [
  "Access Bank",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Fidelity Bank",
  "Stanbic IBTC",
  "Kuda Microfinance Bank",
  "Moniepoint MFB",
  "OPay",
  "Sterling Bank",
  "Wema Bank",
];

export default function MerchantWalletPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantSlug = activeTenant?.slug || "neweratransports";

  const [wallet, setWallet] = useState<WalletData>({
    availableBalance: 0,
    escrowBalance: 0,
    totalWithdrawn: 0,
    currency: "NGN",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Withdrawal Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("Guaranty Trust Bank (GTBank)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      setRefreshing(true);
      const res = await fetch(`/api/erp/wallet?tenant=${encodeURIComponent(tenantSlug)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
        setPayouts(data.payouts || []);
        if (data.wallet.bankName) setSelectedBank(data.wallet.bankName);
        if (data.wallet.accountNumber) setAccountNumber(data.wallet.accountNumber);
        if (data.wallet.accountName) setAccountName(data.wallet.accountName);
      }
    } catch (err) {
      console.warn("Wallet fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(withdrawAmount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid positive withdrawal amount.");
      return;
    }

    if (numAmount > wallet.availableBalance) {
      setErrorMessage(
        `Insufficient available balance. You have ₦${wallet.availableBalance.toLocaleString()} available. (Escrow funds cannot be withdrawn until delivery).`
      );
      return;
    }

    if (!accountNumber || accountNumber.length < 10) {
      setErrorMessage("Please enter a valid 10-digit NUBAN account number.");
      return;
    }

    if (!accountName.trim()) {
      setErrorMessage("Account holder name is required.");
      return;
    }

    setIsSubmittingPayout(true);

    try {
      const res = await fetch("/api/erp/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          amount: numAmount,
          bankName: selectedBank,
          accountNumber,
          accountName,
        }),
      });

      const data = await res.json().catch(() => null);

      if (data && data.success) {
        showToast(data.message || `Payout of ₦${numAmount.toLocaleString()} submitted successfully!`);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
        // Re-fetch live balance
        fetchWallet();
      } else {
        setErrorMessage(data?.error || "Withdrawal failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process payout.");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2.5 shadow-2xl animate-fade-in backdrop-blur-md border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)]">Merchant Earnings & Payout Wallet</h1>
            <NexaBadge variant="brand" size="sm" className="rounded-full font-mono text-[10px]">
              DEDICATED LEDGER
            </NexaBadge>
          </div>
          <p className="text-xs text-[var(--nexa-text-secondary)] mt-1">
            Real-time balance settlement for {activeTenant?.name || tenantSlug} across storefront purchases, POS counter sales, and service bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin text-blue-600")} />}
            onClick={fetchWallet}
            disabled={refreshing}
            className="rounded-full"
          >
            {refreshing ? "Syncing..." : "Sync Ledger"}
          </NexaButton>

          <NexaButton
            size="md"
            variant="primary"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
            onClick={() => setIsWithdrawOpen(true)}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-sm"
          >
            Withdraw Funds
          </NexaButton>
        </div>
      </header>

      {/* SETTLEMENT & ESCROW ARCHITECTURE CALLOUT */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/20 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-[var(--nexa-text-primary)] block">
              Automated 98.5% Split & Opt-In Escrow Architecture
            </span>
            <p className="text-[11px] text-[var(--nexa-text-secondary)] mt-0.5 leading-relaxed">
              Standard payments clear immediately into your <strong>Available Balance</strong> with zero delay, ready for anytime withdrawal. Orders where the buyer requested Escrow remain in <strong>Held in Escrow</strong> until delivery confirmation.
            </p>
          </div>
        </div>

        <NexaBadge variant="green" size="md" className="shrink-0 self-start md:self-center font-bold">
          Anytime Bank Withdrawals
        </NexaBadge>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: AVAILABLE BALANCE */}
        <NexaCard variant="glass" className="p-6 rounded-3xl bg-gradient-to-br from-[#1A56DB] to-[#1E429F] text-white relative overflow-hidden shadow-xl border-none">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Wallet className="w-28 h-28" />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-white/80 font-bold uppercase tracking-wider text-[11px]">Available For Withdrawal</p>
              <h2 className="text-4xl font-black mt-1">₦{wallet.availableBalance.toLocaleString()}</h2>
            </div>
            <p className="text-xs text-white/70">
              100% cleared funds. Request instant payout anytime to your configured bank account.
            </p>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-[#1A56DB] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw to Bank
            </button>
          </div>
        </NexaCard>

        {/* CARD 2: ESCROW HELD */}
        <NexaCard variant="glass" className="p-6 rounded-3xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[var(--nexa-text-muted)] font-bold uppercase tracking-wider text-[11px]">Held in Escrow Vault</p>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-amber-600 dark:text-amber-400">₦{wallet.escrowBalance.toLocaleString()}</h2>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Customer buyer protection funds.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
            Automatically unlocks and moves to Available Balance once the order or service is marked <strong>Delivered / Completed</strong>.
          </div>
        </NexaCard>

        {/* CARD 3: TOTAL DISBURSED */}
        <NexaCard variant="glass" className="p-6 rounded-3xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[var(--nexa-text-muted)] font-bold uppercase tracking-wider text-[11px]">Total Payouts Withdrawn</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">₦{wallet.totalWithdrawn.toLocaleString()}</h2>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Lifetime total earnings paid out to your bank.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Bank-grade verified settlement history.</span>
          </div>
        </NexaCard>
      </div>

      {/* 2 COLUMN SECTION: RECENT TRANSACTIONS & PAYOUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: RECENT TRANSACTIONS (8 COLS) */}
        <NexaCard variant="glass" padding="none" className="lg:col-span-8 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-[var(--nexa-border)] flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <History className="w-4 h-4 text-[#1A56DB]" />
                Settlement & Ledger Transactions
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                Audit trail of instant sales, escrow holds, escrow releases, and bank withdrawals
              </p>
            </div>
            <NexaBadge variant="neutral" size="sm" className="rounded-full font-mono text-[10px]">
              {transactions.length} Records
            </NexaBadge>
          </div>

          <div className="divide-y divide-[var(--nexa-border)] max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)]">
                No transactions recorded yet. Completed orders and service bookings will automatically generate ledger entries.
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[var(--nexa-bg-base)]/40 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                        tx.type === "SALE_CREDIT"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : tx.type === "ESCROW_RELEASE"
                          ? "bg-blue-500/10 text-blue-600"
                          : tx.type === "ESCROW_HOLD"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-purple-500/10 text-purple-600"
                      )}
                    >
                      {tx.type === "WITHDRAWAL" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)]">
                          {tx.type === "SALE_CREDIT"
                            ? "Instant Sale Settlement (98.5% Split)"
                            : tx.type === "ESCROW_RELEASE"
                            ? "Escrow Payout Released"
                            : tx.type === "ESCROW_HOLD"
                            ? "Escrow Held in Vault"
                            : "Bank Transfer Payout"}
                        </span>
                        <NexaBadge
                          variant={tx.type === "WITHDRAWAL" ? "purple" : tx.type === "ESCROW_HOLD" ? "amber" : "green"}
                          size="sm"
                          className="rounded-full text-[9px] font-mono uppercase"
                        >
                          {tx.status}
                        </NexaBadge>
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5 line-clamp-1">
                        {tx.description}
                      </p>
                      <div className="text-[10px] text-[var(--nexa-text-faint)] font-mono mt-0.5">
                        Ref: {tx.reference} • {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm",
                        tx.type === "WITHDRAWAL" ? "text-purple-600 dark:text-purple-400" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {tx.type === "WITHDRAWAL" ? "-" : "+"}₦{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                      {tx.channel || "COMMERCE"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </NexaCard>

        {/* RIGHT: BANK ACCOUNT & WITHDRAWAL HISTORY (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <NexaCard variant="glass" className="p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                Settlement Bank Account
              </h3>
              <NexaBadge variant="green" size="sm" className="rounded-full text-[9px]">
                Verified
              </NexaBadge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--nexa-text-secondary)]">
                <span>Bank:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{wallet.bankName || "GTBank"}</span>
              </div>
              <div className="flex justify-between text-[var(--nexa-text-secondary)]">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-[var(--nexa-text-primary)]">{wallet.accountNumber || "0149204812"}</span>
              </div>
              <div className="flex justify-between text-[var(--nexa-text-secondary)]">
                <span>Account Name:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{wallet.accountName || activeTenant?.name || "New Era Transports Ltd"}</span>
              </div>
            </div>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Request Withdrawal
            </button>
          </NexaCard>

          <NexaCard variant="glass" className="p-6 rounded-3xl space-y-3">
            <h4 className="font-extrabold text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Recent Payout Requests
            </h4>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {payouts.length === 0 ? (
                <p className="text-[11px] text-[var(--nexa-text-muted)]">No withdrawal requests processed yet.</p>
              ) : (
                payouts.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-emerald-600">₦{p.amount.toLocaleString()}</span>
                      <NexaBadge variant="green" size="sm" className="rounded-full text-[9px]">
                        {p.status}
                      </NexaBadge>
                    </div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)] flex justify-between">
                      <span>{p.bankName}</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </NexaCard>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
                <div>
                  <h3 className="font-extrabold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    Withdraw Available Funds
                  </h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">
                    Available: <strong className="text-emerald-600">₦{wallet.availableBalance.toLocaleString()}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsWithdrawOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-[var(--nexa-text-primary)]">Withdrawal Amount (₦)</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(wallet.availableBalance))}
                      className="text-[#1A56DB] font-bold text-[10px] hover:underline cursor-pointer"
                    >
                      Withdraw Max (₦{wallet.availableBalance.toLocaleString()})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1000"
                    max={wallet.availableBalance}
                    placeholder="e.g. 50000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Destination Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] cursor-pointer"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">NUBAN Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Exact name on bank account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[var(--nexa-border)]">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-[var(--nexa-border)] text-xs font-bold hover:bg-[var(--nexa-bg-base)] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingPayout || wallet.availableBalance <= 0}
                    className="px-6 py-2.5 rounded-full bg-[#1A56DB] hover:bg-blue-600 disabled:bg-slate-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingPayout ? "Processing Payout..." : "Confirm & Send Funds"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
