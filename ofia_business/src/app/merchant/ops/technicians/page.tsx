"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Filter, ChevronDown, Eye, Edit, Ban } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import { cn } from '@/lib/utils';

const mockTechnicians = [
    { id: 'TECH-001', name: 'John Philip', specialty: 'Plumber', location: 'Lekki', jobs: 12, rating: 4.8, status: 'active' },
    { id: 'TECH-002', name: 'Sarah Connor', specialty: 'Electrician', location: 'Ikoyi', jobs: 8, rating: 4.9, status: 'active' },
    { id: 'TECH-003', name: 'Mike Tyson', specialty: 'Painter', location: 'Surulere', jobs: 5, rating: 4.5, status: 'pending' },
    { id: 'TECH-004', name: 'James Bond', specialty: 'Security', location: 'Victoria Island', jobs: 25, rating: 5.0, status: 'active' },
    { id: 'TECH-005', name: 'Bruce Wayne', specialty: 'Gadgets', location: 'Ikoyi', jobs: 1, rating: 4.2, status: 'suspended' },
];

const statusColors: { [key: string]: string } = {
    active: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    suspended: 'bg-red-500/10 text-red-500',
};

export default function OpsTechniciansPage() {
    const [technicians, setTechnicians] = useState(mockTechnicians);
    
    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-display">Technician Management</h1>
                        <p className="text-nexa-text-secondary text-sm mt-1">View, manage, and onboard technicians.</p>
                    </div>

                    <NexaCard className="p-0">
                         <div className="p-6 flex items-center justify-between border-b border-nexa-border">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nexa-text-faint" />
                                <input type="text" placeholder="Search technicians..." className="w-full h-12 pl-12 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none" />
                            </div>
                            <NexaButton>Add New Technician</NexaButton>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-nexa-border">
                                    <tr>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Name</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Specialty</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Location</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Jobs</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Rating</th>
                                        <th className="text-left font-bold uppercase text-nexa-text-faint p-4">Status</th>
                                        <th className="text-right font-bold uppercase text-nexa-text-faint p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {technicians.map(tech => (
                                        <tr key={tech.id} className="border-b border-nexa-border hover:bg-nexa-bg-surface/50">
                                            <td className="p-4 font-bold">{tech.name}</td>
                                            <td className="p-4 text-nexa-text-secondary">{tech.specialty}</td>
                                            <td className="p-4 text-nexa-text-secondary">{tech.location}</td>
                                            <td className="p-4 font-bold">{tech.jobs}</td>
                                            <td className="p-4 font-bold text-yellow-500">{tech.rating.toFixed(1)}</td>
                                            <td className="p-4">
                                                <NexaBadge className={cn("capitalize", statusColors[tech.status])}>
                                                    {tech.status}
                                                </NexaBadge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <NexaButton size="sm" variant="outline" leftIcon={<Eye/>}/>
                                                    <NexaButton size="sm" variant="secondary" leftIcon={<Edit/>}/>
                                                    <NexaButton size="sm" variant="danger" leftIcon={<Ban/>}/>
                                                </div>
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
