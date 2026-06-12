"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, User, Settings, Bell, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/components/nexa/AuthContext';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaNavbar } from '@/components/nexa/NexaNav';

export default function AccountPage() {
    const { user, logout } = useAuth();

    const accountLinks = [
        { href: '/dashboard/profile', title: 'Edit Profile', subtitle: 'Update your public and business information', icon: <User /> },
        { href: '/dashboard/settings', title: 'Account Settings', subtitle: 'Manage password, notifications, and privacy', icon: <Settings /> },
        { href: '/dashboard/wallet', title: 'Wallet & Payouts', subtitle: 'View your balance and transaction history', icon: <Shield /> },
        { href: '/support', title: 'Help & Support', subtitle: 'Get help or contact our support team', icon: <Bell /> },
    ];

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-24 h-24 rounded-full bg-nexa-brand/10 flex items-center justify-center">
                            <img 
                                src={user?.pro_profile?.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                                alt={user?.name} 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-display">{user?.name}</h1>
                            <p className="text-nexa-text-secondary">{user?.email}</p>
                        </div>
                    </div>
                    
                    <NexaCard className="p-2">
                        <div className="divide-y divide-nexa-border">
                            {accountLinks.map(link => (
                                <Link href={link.href} key={link.href}>
                                    <div className="flex items-center gap-4 p-6 hover:bg-nexa-bg-surface transition-colors rounded-lg">
                                        <div className="w-10 h-10 bg-nexa-bg-base text-nexa-brand rounded-lg flex items-center justify-center">
                                            {link.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">{link.title}</h3>
                                            <p className="text-sm text-nexa-text-secondary">{link.subtitle}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-nexa-text-faint" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </NexaCard>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={logout}
                            className="font-bold text-red-500 hover:underline flex items-center gap-2 mx-auto"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
