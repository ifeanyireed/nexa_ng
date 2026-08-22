"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Briefcase, MapPin, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { NexaBadge } from '@/components/nexa/NexaBadge';
import Link from 'next/link';

const mockJob = {
    id: 'JOB-126',
    service: 'Install New Water Heater',
    customer: 'Grace Hall',
    location: '456 Oak Ave, Ikoyi, Lagos',
    scheduledTime: '2026-06-15, 10:00 AM',
    amount: 75000,
    status: 'assigned',
    assignedTech: {
        id: 'TECH-001',
        name: 'John Philip',
        specialty: 'Plumber',
    },
    history: [
        { status: 'Created', date: '2026-06-14, 2:00 PM' },
        { status: 'Assigned', date: '2026-06-14, 2:05 PM', notes: 'Assigned to John Philip' },
    ]
};

export default function OpsJobDetailsClient({ id }: { id: string }) {
    const [job, setJob] = useState(mockJob);

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-4xl mx-auto">
                    <Link href="/ops/assignments" className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2 mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Assignments
                    </Link>

                    <NexaCard className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm font-bold text-nexa-brand">{job.id}</p>
                                <h1 className="text-3xl font-extrabold text-display mt-1">{job.service}</h1>
                            </div>
                            <NexaBadge className="capitalize bg-blue-500/10 text-blue-500">{job.status}</NexaBadge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoColumn data={job.customer} label="Customer" icon={<User/>}/>
                            <InfoColumn data={job.assignedTech.name} label="Assigned Tech" icon={<Briefcase/>}/>
                            <InfoColumn data={job.location} label="Location" icon={<MapPin/>}/>
                            <InfoColumn data={job.scheduledTime} label="Scheduled" icon={<Clock/>}/>
                            <InfoColumn data={`₦${job.amount.toLocaleString()}`} label="Job Value" icon={<DollarSign/>}/>
                        </div>

                         <div className="my-8 border-t border-nexa-border" />

                         <div>
                            <h3 className="text-lg font-bold mb-4">Job History</h3>
                            <div className="space-y-2">
                                {job.history.map((h, i) => (
                                    <p key={i} className="text-sm"><span className="font-bold">{h.date}:</span> {h.status} {h.notes && `(${h.notes})`}</p>
                                ))}
                            </div>
                         </div>

                        <div className="my-8 border-t border-nexa-border" />

                        <div className="flex flex-col sm:flex-row gap-4">
                            <NexaButton variant="secondary" leftIcon={<Edit/>}>Re-assign Job</NexaButton>
                            <NexaButton variant="outline" leftIcon={<DollarSign/>}>Issue Refund</NexaButton>
                            <NexaButton variant="danger" leftIcon={<Trash2/>}>Cancel Job</NexaButton>
                        </div>
                    </NexaCard>
                </div>
            </main>
        </>
    );
}

const InfoColumn = ({ icon, label, data }: { icon: React.ReactNode, label: string, data: string }) => (
    <div className="p-4 bg-nexa-bg-base rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-nexa-text-faint mb-1">
             {icon} {label}
        </div>
        <p className="font-bold">{data}</p>
    </div>
)
