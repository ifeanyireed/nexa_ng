"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, DollarSign, Package, Calendar, Filter } from 'lucide-react';

import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import { cn } from '@/lib/utils';

const mockDeals = [
    { id: 1, name: 'Alice Johnson', service: 'Deep Cleaning', date: '2026-06-15', amount: 25000, status: 'upcoming' },
    { id: 2, name: 'Charlie Brown', service: 'Plumbing Inspection', date: '2026-06-13', amount: 10000, status: 'completed' },
    { id: 3, name: 'Frank Green', service: 'Kitchen Remodel', date: '2026-06-10', amount: 550000, status: 'completed' },
    { id: 4, name: 'Grace Hall', service: 'Emergency Locksmith', date: '2026-06-12', amount: 20000, status: 'in-progress' },
    { id: 5, name: 'Ivy King', service: 'Full House Repainting', date: '2026-06-18', amount: 150000, status: 'upcoming' },
];

const statusColors: { [key: string]: string } = {
    upcoming: 'bg-cyan-500/10 text-cyan-500',
    'in-progress': 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-green-500/10 text-green-500',
    cancelled: 'bg-red-500/10 text-red-500',
};

export default function DealsPage() {
    const [deals, setDeals] = useState(mockDeals);
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredDeals = deals.filter(deal => activeFilter === 'all' || deal.status === activeFilter);

    const filters = ['all', 'upcoming', 'in-progress', 'completed', 'cancelled'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-display">Deal Pipeline</h1>
                <p className="text-nexa-text-secondary text-sm mt-1">Track the status of your ongoing and completed jobs.</p>
            </div>

            <NexaCard className="p-0">
                <div className="p-6 flex items-center justify-between border-b border-nexa-border">
                    <div className="flex items-center gap-2">
                        {filters.map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors",
                                    activeFilter === filter ? 'bg-nexa-brand text-white' : 'hover:bg-nexa-bg-surface'
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <NexaButton variant='outline' leftIcon={<Filter/>}>Filter Deals</NexaButton>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-nexa-border">
                            <tr>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Customer</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Service</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Amount</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Date</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Status</th>
                                <th className="text-right font-bold uppercase text-nexa-text-faint p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeals.map(deal => (
                                <tr key={deal.id} className="border-b border-nexa-border hover:bg-nexa-bg-surface/50">
                                    <td className="p-4 font-bold">{deal.name}</td>
                                    <td className="p-4 text-nexa-text-secondary">{deal.service}</td>
                                    <td className="p-4 font-bold">₦{deal.amount.toLocaleString()}</td>
                                    <td className="p-4 text-nexa-text-secondary">{deal.date}</td>
                                    <td className="p-4">
                                        <NexaBadge className={cn("capitalize", statusColors[deal.status])}>
                                            {deal.status.replace('-', ' ')}
                                        </NexaBadge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <NexaButton size="sm" variant='outline' leftIcon={<Eye/>}>View Details</NexaButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NexaCard>
        </div>
    );
}
