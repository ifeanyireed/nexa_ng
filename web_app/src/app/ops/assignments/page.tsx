"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, UserCheck, Search, MapPin } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { NexaBadge } from '@/components/nexa/NexaBadge';

const unassignedJobs = [
    { id: 'JOB-126', service: 'Install New Water Heater', area: 'Ikoyi', priority: 'high' },
    { id: 'JOB-127', service: 'Fix Leaky Faucet', area: 'Victoria Island', priority: 'medium' },
    { id: 'JOB-128', service: 'Paint Living Room', area: 'Yaba', priority: 'low' },
];

const availableTechnicians = [
    { id: 'TECH-001', name: 'John Philip', specialty: 'Plumber', location: 'Lekki', availability: 'full-day' },
    { id: 'TECH-002', name: 'Sarah Connor', specialty: 'Electrician', location: 'Ikoyi', availability: 'morning' },
    { id: 'TECH-003', name: 'Mike Tyson', specialty: 'Painter', location: 'Surulere', availability: 'afternoon' },
];

export default function OpsAssignmentsPage() {
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [selectedTech, setSelectedTech] = useState<any>(null);

    const handleAssign = () => {
        if (selectedJob && selectedTech) {
            alert(`Assigned ${selectedJob.service} to ${selectedTech.name}`);
            // Here you would call an API to make the assignment
            setSelectedJob(null);
            setSelectedTech(null);
        }
    };

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-display">Job Assignments</h1>
                        <p className="text-nexa-text-secondary text-sm mt-1">Assign incoming jobs to available technicians.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <Column 
                            title="Unassigned Jobs" 
                            icon={<Briefcase/>} 
                            items={unassignedJobs} 
                            selectedItem={selectedJob}
                            onSelectItem={setSelectedJob}
                            renderItem={(job: any) => (
                                <>
                                    <div>
                                        <p className="font-bold">{job.service}</p>
                                        <div className="flex items-center gap-2 text-xs text-nexa-text-secondary">
                                            <MapPin size={12}/> {job.area}
                                        </div>
                                    </div>
                                    <NexaBadge className={
                                        job.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                        job.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-gray-500/10 text-gray-500'
                                    }>{job.priority}</NexaBadge>
                                </>
                            )}
                        />
                        <Column 
                            title="Available Technicians" 
                            icon={<UserCheck/>} 
                            items={availableTechnicians} 
                            selectedItem={selectedTech}
                            onSelectItem={setSelectedTech}
                            renderItem={(tech: any) => (
                                <>
                                    <div>
                                        <p className="font-bold">{tech.name}</p>
                                        <p className="text-xs text-nexa-text-secondary">{tech.specialty}</p>
                                    </div>
                                     <NexaBadge className="capitalize bg-green-500/10 text-green-500">{tech.availability}</NexaBadge>
                                </>
                            )}
                        />
                    </div>
                    
                    <NexaCard className="p-6 mt-8">
                        <div className="flex justify-between items-center">
                            <div className="text-sm">
                                <p><span className="font-bold">Job:</span> {selectedJob?.service || 'None'}</p>
                                <p><span className="font-bold">Tech:</span> {selectedTech?.name || 'None'}</p>
                            </div>
                            <NexaButton onClick={handleAssign} disabled={!selectedJob || !selectedTech}>
                                Confirm Assignment
                            </NexaButton>
                        </div>
                    </NexaCard>
                </div>
            </main>
        </>
    );
}

const Column = ({ title, icon, items, selectedItem, onSelectItem, renderItem }: any) => {
    return (
        <NexaCard className="p-0">
            <div className="p-6 border-b border-nexa-border flex items-center gap-3">
                {icon}
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {items.map((item: any) => (
                    <button 
                        key={item.id} 
                        onClick={() => onSelectItem(item)}
                        className={`w-full p-4 rounded-lg text-left flex justify-between items-center transition-colors ${selectedItem?.id === item.id ? 'bg-nexa-brand/20' : 'bg-nexa-bg-base hover:bg-nexa-bg-surface'}`}
                    >
                        {renderItem(item)}
                    </button>
                ))}
            </div>
        </NexaCard>
    );
};
