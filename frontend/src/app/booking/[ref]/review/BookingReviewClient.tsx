"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

import { NexaNavbar, NexaBottomBar } from '@/components/nexa/NexaNav';
import { NexaCard } from '@/components/nexa/NexaCard';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaTextarea } from '@/components/nexa/NexaTextarea';

export default function BookingReviewClient({ refId }: { refId: string }) {
    const router = useRouter();
    
    const [booking, setBooking] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            if (!refId) return;
            try {
                const response = await api.get(`/bookings/${refId}`);
                setBooking(response.data);
            } catch (err) {
                setError('Failed to fetch booking details.');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [refId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/bookings/${refId}/review`, {
                rating,
                comment,
            });
            // Redirect to a thank you page or the booking page
            router.push(`/dashboard/bookings?review_success=true`);
        } catch (err) {
            setError('Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
            <NexaNavbar />
            <div className="container mx-auto px-4 pt-32">
                 <Link href={`/booking/${refId}/track`} className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2 mb-8">
                  <ArrowLeft className="w-4 h-4" /> Back to Booking
                </Link>
                <NexaCard variant='glass' className='max-w-2xl mx-auto p-8'>
                    <h1 className="text-3xl font-extrabold text-display mb-2 text-center">Leave a Review</h1>
                    <p className="text-nexa-text-secondary text-center mb-8">
                        How was your experience with the service?
                    </p>

                    {loading ? (
                        <p>Loading booking details...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : booking && (
                         <div className="mb-8 p-4 rounded-xl bg-nexa-bg-base flex items-center gap-4">
                            <img src={booking.technician?.profile_picture_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Nexa'} className="w-16 h-16 rounded-lg object-cover" />
                            <div>
                                <p className="font-bold">{booking.service_name}</p>
                                <p className="text-sm text-nexa-text-secondary">Provided by {booking.technician?.name || 'Nexa Pro'}</p>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className='text-center'>
                            <p className="text-lg font-bold mb-4">Your Rating</p>
                            <div className="flex justify-center items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Star
                                            className={cn(
                                                'w-10 h-10 transition-colors',
                                                rating >= star ? 'text-yellow-400' : 'text-nexa-border'
                                            )}
                                            fill={rating >= star ? 'currentColor' : 'none'}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div>
                             <NexaTextarea 
                                label="Your Comment"
                                placeholder="Tell us more about your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                             />
                        </div>

                        <NexaButton
                            type="submit"
                            size="lg"
                            className="w-full"
                            isLoading={submitting}
                            rightIcon={<Send/>}
                        >
                            Submit Review
                        </NexaButton>
                    </form>

                </NexaCard>
            </div>
            <NexaBottomBar />
        </main>
    );
}
