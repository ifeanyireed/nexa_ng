"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Trash2, Save } from 'lucide-react';

import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaInput } from '@/components/nexa/NexaInput';
import { NexaButton } from '@/components/nexa/NexaButton';
import { useAuth } from '@/components/nexa/AuthContext';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ text: "Settings saved!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        setIsSaving(false);
    };

    const sections = [
        { 
            id: 'account', 
            title: 'Account Information', 
            icon: <User className="w-5 h-5 text-nexa-brand" />,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NexaInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
                    <NexaInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
            )
        },
        { 
            id: 'password', 
            title: 'Change Password', 
            icon: <Lock className="w-5 h-5 text-nexa-brand" />,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <NexaInput label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} />
                    <NexaInput label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} />
                    <NexaInput label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
                </div>
            )
        },
        { 
            id: 'notifications', 
            title: 'Notifications', 
            icon: <Bell className="w-5 h-5 text-nexa-brand" />,
            content: (
                <div className="space-y-4">
                    <NotificationToggle label="Email Notifications" description="Receive updates and newsletters via email." />
                    <NotificationToggle label="Push Notifications" description="Get real-time alerts on your devices." defaultChecked />
                    <NotificationToggle label="SMS Notifications" description="Get critical alerts via text message." />
                </div>
            )
        },
        { 
            id: 'delete', 
            title: 'Delete Account', 
            icon: <Trash2 className="w-5 h-5 text-red-500" />,
            content: (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <p className="text-sm text-red-500/80 mb-4">
                        Permanently delete your account and all associated data. This action is irreversible.
                    </p>
                    <NexaButton variant="danger" size="sm">Request Account Deletion</NexaButton>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-display">Settings</h1>
                    <p className="text-nexa-text-secondary text-sm mt-1">Manage your account preferences and settings.</p>
                </div>
                <div className="flex items-center gap-4">
                    {message.text && (
                        <span className={cn("text-xs font-bold", message.type === "success" ? "text-emerald-500" : "text-red-500")}>
                            {message.text}
                        </span>
                    )}
                    <NexaButton 
                        leftIcon={<Save className="w-5 h-5" />} 
                        className="px-8 shadow-xl shadow-nexa-brand/20"
                        onClick={handleSave}
                        isLoading={isSaving}
                        >
                        Save All Changes
                    </NexaButton>
                </div>
            </div>

            <div className="space-y-12">
                {sections.map(section => (
                    <NexaCard key={section.id} className="p-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                            {section.icon}
                            {section.title}
                        </h3>
                        {section.content}
                    </NexaCard>
                ))}
            </div>
        </div>
    );
}

const NotificationToggle = ({ label, description, defaultChecked = false }: { label: string, description: string, defaultChecked?: boolean }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-nexa-bg-base rounded-2xl border border-nexa-border">
            <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-nexa-text-secondary">{description}</p>
            </div>
            <div className={cn("w-12 h-6 rounded-full relative p-1 cursor-pointer", defaultChecked ? "bg-nexa-brand" : "bg-nexa-bg-surface")}>
                <motion.div 
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    style={{ x: defaultChecked ? '100%' : '0%' }}
                />
            </div>
        </div>
    )
}
