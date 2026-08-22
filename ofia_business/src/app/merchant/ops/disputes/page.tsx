"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Eye, Check, X } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import { cn } from '@/lib/utils';

const mockDisputes = [
    { id: 'DIS-001', jobId: 'JOB-120', customer: 'Eve Adams', technician: 'John Philip', reason: 'Service not as described', status: 'open' },
    { id: 'DIS-002', jobId: 'JOB-118', customer: 'Frank Green', technician: 'Sarah Connor', reason: 'Technician was late', status: 'resolved' },
    { id: 'DIS-003', jobId: 'JOB-115', customer: 'Grace Hall', technician: 'Mike Tyson', reason: 'Damage to property', status: 'open' },
    { id: 'DIS-004', jobId: 'JOB-112', customer: 'Heidi King', technician: 'James Bond', reason: 'Incomplete work', status: 'resolved' },
];

const statusColors: { [key: string]: string } = {
    open: 'bg-red-500/10 text-red-500',
    resolved: 'bg-green-500/10 text-green-500',
    'under-review': 'bg-yellow-500/10 text-yellow-500',
};

export default function OpsDisputesPage() {
    const [disputes, setDisputes] = useState(mockDisputes);

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-display">Dispute Resolution</h1>
                        <p className="text-nexa-text-secondary text-sm mt-1">Manage and resolve customer and technician disputes.</p>
                    </div>

                     <NexaCard className="p-0">
                         <div className="p-6 flex items-center justify-between border-b border-nexa-border">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nexa-text-faint" />
                                <input type="text" placeholder="Search disputes..." className="w-full h-12 pl-12 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none" />
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-nexa-border">
                                    <tr>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Dispute ID</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Job ID</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Parties Involved</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Reason</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Status</th>
                                        <th className="text-right font-bold uppercase text-nexa-text-faint p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disputes.map(dispute => (
                                        <tr key={dispute.id} className="border-b border-nexa-border hover:bg-nexa-bg-surface/50">
                                            <td className="p-4 font-mono text-nexa-brand">{dispute.id}</td>
                                            <td className="p-4 font-mono">{dispute.jobId}</td>
                                            <td className="p-4">
                                                <p className="font-bold">{dispute.customer}</p>
                                                <p className="text-xs text-nexa-text-secondary">vs. {dispute.technician}</p>
                                            </td>
                                            <td className="p-4 text-nexa-text-secondary">{dispute.reason}</td>
                                            <td className="p-4">
                                                <NexaBadge className={cn("capitalize", statusColors[dispute.status])}>
                                                    {dispute.status}
                                                </NexaBadge>
                                            </td>
                                            <td className="p-4 text-right">
                                                {dispute.status === 'open' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <NexaButton size="sm" variant="outline" leftIcon={<Eye/>}>Details</NexaButton>
                                                        <NexaButton size="sm" variant="success" leftIcon={<Check/>}>Resolve</NexaButton>
                                                    </div>
                                                )}
                                                {dispute.status === 'resolved' && (
                                                    <NexaButton size="sm" variant="secondary" leftIcon={<Eye/>}>View Log</NexaButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </NexaCard>
                </div>
            </main>
        </>
    );
}
