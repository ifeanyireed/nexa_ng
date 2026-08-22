"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, ChevronRight, Briefcase, Bell } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import Link from 'next/link';
import { useAuth } from '@/components/nexa/AuthContext';

const currentJob = {
    id: 'JOB-123',
    service: 'Emergency AC Repair',
    customer: 'Bob Williams',
    location: '123 Main St, Lekki, Lagos',
    time: 'ASAP'
};

const upcomingJobs = [
    { id: 'JOB-124', service: 'Generator Maintenance', customer: 'Diana Miller', time: '2:00 PM' },
    { id: 'JOB-125', service: 'Plumbing Inspection', customer: 'Frank Green', time: '4:00 PM' },
];

export default function TechDashboardPage() {
    const { user } = useAuth();

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-display">Technician Dashboard</h1>
                        <p className="text-nexa-text-secondary text-sm mt-1">Welcome back, {user?.name?.split(" ")[0] || "John"}. Here's what's happening today.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main column */}
                        <div className="lg:col-span-2 space-y-8">
                            <CurrentJobCard />
                            <UpcomingJobsCard />
                        </div>

                        {/* Right sidebar */}
                        <div className="space-y-8">
                            <EarningsCard />
                            <QuickLinksCard />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

const CurrentJobCard = () => (
    <NexaCard className="p-8 bg-nexa-brand/5 border-nexa-brand/10">
        <h2 className="text-lg font-bold mb-4 text-nexa-brand flex items-center gap-2">
            <Briefcase/> Current Job
        </h2>
        <div className="space-y-4">
             <div>
                <p className="text-2xl font-bold">{currentJob.service}</p>
                <p className="text-sm text-nexa-text-secondary">For {currentJob.customer}</p>
            </div>
            <div className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {currentJob.location}
            </div>
             <div className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> {currentJob.time}
            </div>
            <div className="flex gap-4 pt-4">
                <NexaButton>Navigate</NexaButton>
                <NexaButton variant="outline">View Details</NexaButton>
            </div>
        </div>
    </NexaCard>
);

const UpcomingJobsCard = () => (
    <NexaCard className="p-8">
        <h2 className="text-lg font-bold mb-4">Upcoming Jobs</h2>
        <div className="space-y-4">
            {upcomingJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-nexa-bg-base rounded-lg">
                    <div>
                        <p className="font-bold">{job.service}</p>
                        <p className="text-sm text-nexa-text-secondary">{job.customer}</p>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-sm">{job.time}</p>
                         <Link href={`/tech/jobs/${job.id}`} className="text-xs text-nexa-brand font-bold hover:underline">View</Link>
                    </div>
                </div>
            ))}
        </div>
    </NexaCard>
);

const EarningsCard = () => (
    <NexaCard className="p-6 text-center">
        <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-nexa-text-secondary">Today's Earnings</p>
        <p className="text-4xl font-extrabold my-2">₦35,000</p>
        <Link href="/tech/earnings" className="text-xs text-nexa-brand font-bold hover:underline">View Earnings Report</Link>
    </NexaCard>
);

const QuickLinksCard = () => {
    const links = [
        { href: '/tech/jobs', name: 'My Jobs' },
        { href: '/dashboard/availability', name: 'My Availability' },
        { href: '/dashboard/messages', name: 'Messages' },
        { href: '/support', name: 'Support' },
    ];
    return (
        <NexaCard className="p-6">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
                {links.map(link => (
                    <Link href={link.href} key={link.href} className="flex items-center justify-between p-3 bg-nexa-bg-base rounded-lg hover:bg-nexa-bg-surface">
                        <span className="font-bold text-sm">{link.name}</span>
                        <ChevronRight className="w-4 h-4 text-nexa-text-faint" />
                    </Link>
                ))}
            </div>
        </NexaCard>
    )
};
