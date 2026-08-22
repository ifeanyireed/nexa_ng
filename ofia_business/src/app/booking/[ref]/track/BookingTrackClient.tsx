"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, MapPin, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { NexaNavbar, NexaBottomBar } from '@/components/nexa/NexaNav';
import { NexaCard } from '@/components/nexa/NexaCard';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// Mock data, will be replaced by API call
const mockStatus = [
    { name: 'Booking Placed', date: 'Jun 12, 2026, 10:00 AM', completed: true },
    { name: 'Technician Assigned', date: 'Jun 12, 2026, 10:05 AM', completed: true },
    { name: 'Technician En Route', date: null, completed: false },
    { name: 'Work In Progress', date: null, completed: false },
    { name: 'Work Completed', date: null, completed: false },
    { name: 'Payment Processed', date: null, completed: false },
];


export default function BookingTrackClient({ refId }: { refId: string }) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            if (!refId) return;
            try {
                const response = await api.get(`/bookings/${refId}`);
                setBooking(response);
            } catch (err) {
                setError('Failed to fetch booking details.');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [refId]);

    const statusTimeline = booking?.status_history || mockStatus;

    return (
        <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
            <NexaNavbar />
            <div className="container mx-auto px-4 pt-32">
                <Link href="/dashboard/bookings" className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2 mb-8">
                  <ArrowLeft className="w-4 h-4" /> Back to Bookings
                </Link>
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Status Timeline */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-display mb-2">Track Booking</h1>
                        <p className="text-lg text-nexa-text-secondary font-mono mb-8">#{refId}</p>
                        
                        <div className="space-y-8">
                            {statusTimeline.map((status: any, index: number) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", status.completed ? "bg-nexa-brand text-white" : "bg-nexa-bg-surface text-nexa-text-faint")}>
                                            {status.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                                        </div>
                                        {index < statusTimeline.length - 1 && (
                                            <div className={cn("w-0.5 flex-1", status.completed ? "bg-nexa-brand" : "bg-nexa-border")}></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className={cn("font-bold", status.completed ? "text-nexa-text-primary" : "text-nexa-text-faint")}>{status.name}</p>
                                        {status.date && <p className="text-xs text-nexa-text-secondary">{status.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Booking Details */}
                    <div className="w-full lg:w-[400px]">
                        <NexaCard variant="glass" className="p-8 sticky top-32 border-none shadow-2xl bg-nexa-bg-surface/80 backdrop-blur-2xl">
                            <h3 className="text-xl font-extrabold mb-8 pb-4 border-b border-nexa-border">Booking Summary</h3>
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : booking && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-nexa-text-secondary">Service</span>
                                        <span className="text-sm font-bold">{booking.serviceName || booking.service_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-nexa-text-secondary">Status</span>
                                        <span className="text-sm font-bold capitalize">{booking.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-nexa-text-secondary">Scheduled For</span>
                                        <span className="text-sm font-bold">{new Date(booking.scheduledAt || booking.scheduled_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-extrabold pt-2">
                                        <span>Total</span>
                                        <span className="text-nexa-brand">₦{booking.amount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-nexa-border">
                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18}/> Service Provider</h4>
                                {(() => {
                                    const pro = booking?.proProfile || booking?.pro_profile;
                                    const proUser = pro?.user;
                                    if (!pro) {
                                        return <p className="text-sm text-nexa-text-secondary">Waiting for assignment...</p>;
                                    }
                                    const initials = proUser?.name?.[0] || pro.businessName?.[0] || "P";
                                    const specialty = pro.specialties?.split(",")?.[0] || pro.niche || "Professional";
                                    return (
                                         <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-nexa-brand/10 flex items-center justify-center text-lg font-bold text-nexa-brand">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-bold">{proUser?.name || pro.businessName || "Nexa Pro"}</p>
                                                <p className="text-xs text-nexa-brand font-bold uppercase tracking-wider">{specialty}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </NexaCard>
                    </div>
                </div>
            </div>
            <NexaBottomBar />
        </main>
    );
}
