"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import Link from 'next/link';

const summaryData = {
    today: 35000,
    thisWeek: 175000,
    thisMonth: 680000,
    balance: 250000,
};

const transactions = [
    { id: 1, type: 'payout', date: '2026-06-12', amount: -150000, status: 'Completed' },
    { id: 2, type: 'job', date: '2026-06-12', amount: 35000, description: 'Emergency AC Repair (JOB-123)' },
    { id: 3, type: 'job', date: '2026-06-11', amount: 20000, description: 'Generator Maintenance (JOB-121)' },
    { id: 4, type: 'job', date: '2026-06-10', amount: 50000, description: 'Full House Rewiring (JOB-119)' },
    { id: 5, type: 'payout', date: '2026-06-05', amount: -200000, status: 'Completed' },
];


export default function TechEarningsPage() {
    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-4xl mx-auto">
                    <Link href="/tech/dashboard" className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2 mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-display">Earnings</h1>
                            <p className="text-nexa-text-secondary text-sm mt-1">Track your payments and earnings.</p>
                        </div>
                        <NexaButton leftIcon={<DollarSign/>}>Request Payout</NexaButton>
                    </div>

                    <NexaCard className="p-8 mb-8">
                        <p className="text-sm font-bold uppercase tracking-widest text-nexa-text-faint">Available Balance</p>
                        <p className="text-5xl font-extrabold text-green-500 mt-2">₦{summaryData.balance.toLocaleString()}</p>
                    </NexaCard>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <Stat title="Today's Earnings" value={summaryData.today} />
                        <Stat title="This Week" value={summaryData.thisWeek} />
                        <Stat title="This Month" value={summaryData.thisMonth} />
                    </div>

                    <NexaCard className="p-0">
                         <h2 className="text-lg font-bold p-6">Transaction History</h2>
                         <div className="divide-y divide-nexa-border">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'payout' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {tx.type === 'payout' ? <ArrowUp/> : <ArrowDown/>}
                                        </div>
                                        <div>
                                            <p className="font-bold capitalize">{tx.type === 'payout' ? 'Payout' : tx.description}</p>
                                            <p className="text-xs text-nexa-text-secondary">{tx.date}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${tx.type === 'payout' ? 'text-red-500' : 'text-green-500'}`}>
                                        {tx.type === 'payout' ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                         </div>
                    </NexaCard>
                </div>
            </main>
        </>
    );
}

const Stat = ({ title, value }: { title: string, value: number }) => (
    <NexaCard variant="glass" className="p-6">
        <p className="text-sm font-bold text-nexa-text-secondary">{title}</p>
        <p className="text-3xl font-bold mt-1">₦{value.toLocaleString()}</p>
    </NexaCard>
);
