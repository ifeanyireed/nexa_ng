"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, DollarSign, User, ArrowLeft, Play, CheckCircle, Phone } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const mockJob = {
    id: 'JOB-123',
    service: 'Emergency AC Repair',
    customer: 'Bob Williams',
    location: '123 Main St, Lekki, Lagos',
    time: 'ASAP',
    status: 'assigned',
    amount: 35000,
    customerPhone: '+234 803 123 4567',
    notes: 'The AC unit is making a loud rattling noise and not cooling.'
};


export default function JobDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [job, setJob] = useState<any>(mockJob);
    
    // In a real app, you'd fetch job details
    // useEffect(() => {
    //     api.get(`/tech/jobs/${id}`).then(res => setJob(res.data));
    // }, [id]);

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-3xl mx-auto">
                    <Link href="/tech/dashboard" className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2 mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                
                    <NexaCard className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-nexa-brand">{job.id}</p>
                                <h1 className="text-3xl font-extrabold text-display mt-1">{job.service}</h1>
                            </div>
                            <p className="text-2xl font-bold">₦{job.amount.toLocaleString()}</p>
                        </div>
                        
                        <div className="my-8 border-t border-nexa-border" />

                        <div className="space-y-6">
                            <InfoRow icon={<User/>} label="Customer" value={job.customer} />
                            <InfoRow icon={<MapPin/>} label="Location" value={job.location} />
                            <InfoRow icon={<Clock/>} label="Scheduled Time" value={job.time} />
                            <InfoRow icon={<Phone/>} label="Customer Contact" value={job.customerPhone} isPhone />
                            
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-nexa-text-faint mb-2">Job Notes</h3>
                                <p className="text-sm p-4 bg-nexa-bg-base rounded-lg">{job.notes}</p>
                            </div>
                        </div>

                        <div className="my-8 border-t border-nexa-border" />

                        <div className="flex flex-col sm:flex-row gap-4">
                            <NexaButton size="lg" className="w-full" leftIcon={<Play/>}>Start Job</NexaButton>
                            <NexaButton size="lg" variant="success" className="w-full" leftIcon={<CheckCircle/>}>Mark as Complete</NexaButton>
                        </div>
                    </NexaCard>
                </div>
            </main>
        </>
    );
}


const InfoRow = ({ icon, label, value, isPhone = false }: { icon: React.ReactNode, label: string, value: string, isPhone?: boolean }) => (
    <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-nexa-text-faint mb-2 flex items-center gap-2">
            {icon} {label}
        </h3>
        {isPhone ? (
            <a href={`tel:${value}`} className="text-lg font-bold text-nexa-brand hover:underline">{value}</a>
        ) : (
            <p className="text-lg font-bold">{value}</p>
        )}
    </div>
)
