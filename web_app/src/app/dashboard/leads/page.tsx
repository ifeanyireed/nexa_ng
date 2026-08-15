"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, Filter, ChevronDown } from 'lucide-react';

import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import { cn } from '@/lib/utils';

const mockLeads = [
    { id: 1, name: 'Alice Johnson', service: 'Deep Cleaning', date: '2026-06-15', budget: 25000, status: 'new' },
    { id: 2, name: 'Bob Williams', service: 'AC Repair', date: '2026-06-14', budget: 15000, status: 'contacted' },
    { id: 3, name: 'Charlie Brown', service: 'Plumbing Inspection', date: '2026-06-13', budget: 10000, status: 'won' },
    { id: 4, name: 'Diana Miller', service: 'Generator Maintenance', date: '2026-06-12', budget: 18000, status: 'lost' },
    { id: 5, name: 'Ethan Davis', service: 'Full House Repainting', date: '2026-06-11', budget: 150000, status: 'new' },
];

const statusColors: { [key: string]: string } = {
    new: 'bg-blue-500/10 text-blue-500',
    contacted: 'bg-yellow-500/10 text-yellow-500',
    won: 'bg-green-500/10 text-green-500',
    lost: 'bg-red-500/10 text-red-500',
};

export default function LeadsPage() {
    const [leads, setLeads] = useState(mockLeads);
    const [activeFilter, setActiveFilter] = useState('all');

    const handleStatusChange = (id: number, newStatus: 'won' | 'lost') => {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    }
    
    const filteredLeads = leads.filter(lead => activeFilter === 'all' || lead.status === activeFilter);

    const filters = ['all', 'new', 'contacted', 'won', 'lost'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-display">Lead Manager</h1>
                <p className="text-nexa-text-secondary text-sm mt-1">View and respond to new customer inquiries.</p>
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
                    <NexaButton variant='outline' leftIcon={<Filter/>}>Filter Leads</NexaButton>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-nexa-border">
                            <tr>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Customer</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Service</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Budget</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Date</th>
                                <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Status</th>
                                <th className="text-right font-bold uppercase text-nexa-text-faint p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="border-b border-nexa-border hover:bg-nexa-bg-surface/50">
                                    <td className="p-4 font-bold">{lead.name}</td>
                                    <td className="p-4 text-nexa-text-secondary">{lead.service}</td>
                                    <td className="p-4 font-bold">₦{lead.budget.toLocaleString()}</td>
                                    <td className="p-4 text-nexa-text-secondary">{lead.date}</td>
                                    <td className="p-4">
                                        <NexaBadge className={cn("capitalize", statusColors[lead.status])}>
                                            {lead.status}
                                        </NexaBadge>
                                    </td>
                                    <td className="p-4 text-right">
                                        {lead.status === 'new' && (
                                            <div className="flex gap-2 justify-end">
                                                <NexaButton size="sm" variant='success' onClick={() => handleStatusChange(lead.id, 'won')} leftIcon={<Check/>}>Accept</NexaButton>
                                                <NexaButton size="sm" variant='danger' onClick={() => handleStatusChange(lead.id, 'lost')} leftIcon={<X/>}>Decline</NexaButton>
                                            </div>
                                        )}
                                        {lead.status !== 'new' && (
                                            <NexaButton size="sm" variant='outline' leftIcon={<Eye/>}>View</NexaButton>
                                        )}
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
