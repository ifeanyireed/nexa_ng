"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Save } from 'lucide-react';

import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { cn } from '@/lib/utils';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00 AM`); // 8 AM to 7 PM

const initialAvailability = {
    Sunday: [],
    Monday: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    Tuesday: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    Wednesday: ['9:00 AM', '10:00 AM', '11:00 AM'],
    Thursday: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    Friday: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM'],
    Saturday: [],
};

export default function AvailabilityPage() {
    const [availability, setAvailability] = useState(initialAvailability);

    const toggleTimeSlot = (day: string, time: string) => {
        setAvailability(prev => {
            const daySlots = prev[day as keyof typeof prev] as string[];
            if (daySlots.includes(time)) {
                return { ...prev, [day]: daySlots.filter(t => t !== time) };
            } else {
                return { ...prev, [day]: [...daySlots, time] };
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-display">Availability</h1>
                    <p className="text-nexa-text-secondary text-sm mt-1">Set your working hours for customer bookings.</p>
                </div>
                <NexaButton 
                    leftIcon={<Save className="w-5 h-5" />} 
                    className="px-8 shadow-xl shadow-nexa-brand/20"
                >
                    Save Changes
                </NexaButton>
            </div>

            <NexaCard className="p-8">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-nexa-border w-24">
                                    <Clock className="w-5 h-5 mx-auto text-nexa-text-faint" />
                                </th>
                                {days.map(day => (
                                    <th key={day} className="p-2 border-b border-nexa-border text-sm font-bold text-nexa-text-secondary">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map(time => (
                                <tr key={time}>
                                    <td className="p-2 border-b border-nexa-border text-xs font-bold text-nexa-text-faint text-center">{time}</td>
                                    {days.map(day => (
                                        <td key={day} className="p-1 border-b border-nexa-border text-center">
                                            <motion.button
                                                onClick={() => toggleTimeSlot(day, time)}
                                                className={cn(
                                                    "w-full h-8 rounded-lg transition-colors",
                                                    availability[day as keyof typeof availability].includes(time) ? 'bg-nexa-brand/20' : 'bg-nexa-bg-surface hover:bg-nexa-bg-base'
                                                )}
                                                whileTap={{ scale: 0.9 }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NexaCard>
        </div>
    );
}
