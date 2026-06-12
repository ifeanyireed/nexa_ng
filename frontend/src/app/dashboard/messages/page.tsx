"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Paperclip, Smile, MoreHorizontal } from 'lucide-react';

import { NexaCard } from '@/components/nexa/NexaCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/nexa/AuthContext';

const mockConversations = [
    { id: 1, name: 'John Doe', lastMessage: 'See you then!', time: '10:42 AM', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Nexa Support', lastMessage: 'Your ticket has been updated.', time: '9:01 AM', unread: 0, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Nexa' },
    { id: 3, name: 'Jane Smith', lastMessage: 'Thanks for the help!', time: 'Yesterday', unread: 0, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 4, name: 'Handyman Pro', lastMessage: 'I am on my way.', time: 'Yesterday', unread: 0, avatar: 'https://randomuser.me/api/portraits/men/56.jpg' },
];

const mockMessages = {
    1: [
        { from: 'other', text: 'Hey, I have a question about my booking.', time: '10:40 AM' },
        { from: 'me', text: 'Hi John, sure, what is it?', time: '10:41 AM' },
        { from: 'other', text: 'I need to reschedule for tomorrow at 2 PM.', time: '10:41 AM' },
        { from: 'me', text: 'No problem, I will update the booking. See you then!', time: '10:42 AM' },
    ],
    2: [
        { from: 'other', text: 'Your ticket #12345 has been updated.', time: '9:01 AM' },
    ]
};

export default function MessagesPage() {
    const { user } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Sidebar with conversations */}
            <NexaCard className="w-96 p-0 flex flex-col">
                <div className="p-6 border-b border-nexa-border">
                    <h1 className="text-2xl font-extrabold text-display">Messages</h1>
                    <div className="relative mt-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nexa-text-faint" />
                        <input type="text" placeholder="Search messages..." className="w-full h-12 pl-12 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockConversations.map(convo => (
                        <button 
                            key={convo.id} 
                            onClick={() => setSelectedConversation(convo)}
                            className={cn(
                                "w-full text-left flex items-center gap-4 p-4 border-b border-nexa-border transition-colors",
                                selectedConversation.id === convo.id ? 'bg-nexa-brand/5' : 'hover:bg-nexa-bg-surface'
                            )}
                        >
                            <img src={convo.avatar} alt={convo.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold">{convo.name}</h3>
                                    <p className="text-xs text-nexa-text-faint">{convo.time}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-sm text-nexa-text-secondary truncate">{convo.lastMessage}</p>
                                    {convo.unread > 0 && <div className="w-5 h-5 bg-nexa-brand text-white text-xs font-bold rounded-full flex items-center justify-center">{convo.unread}</div>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </NexaCard>

            {/* Main chat window */}
            <div className="flex-1 flex flex-col">
                <NexaCard className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full object-cover" />
                        <h2 className="font-bold text-lg">{selectedConversation.name}</h2>
                    </div>
                    <MoreHorizontal className="w-6 h-6 text-nexa-text-faint" />
                </NexaCard>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {(mockMessages[selectedConversation.id as keyof typeof mockMessages] || []).map((msg, i) => (
                        <div key={i} className={cn("flex items-end gap-3", msg.from === 'me' ? 'justify-end' : '')}>
                            {msg.from !== 'me' && <img src={selectedConversation.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />}
                            <div className={cn(
                                "max-w-md p-4 rounded-3xl",
                                msg.from === 'me' ? 'bg-nexa-brand text-white rounded-br-lg' : 'bg-nexa-bg-surface rounded-bl-lg'
                            )}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {msg.from === 'me' && <img src={user?.pro_profile?.logo_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Me'} alt="" className="w-8 h-8 rounded-full object-cover" />}
                        </div>
                    ))}
                </div>

                <NexaCard className="p-4 mt-auto">
                    <div className="relative">
                        <input type="text" placeholder="Type a message..." className="w-full h-14 pl-6 pr-28 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                           <button className="p-2 text-nexa-text-faint hover:text-nexa-brand"><Smile/></button>
                           <button className="p-2 text-nexa-text-faint hover:text-nexa-brand"><Paperclip/></button>
                           <button className="p-2.5 bg-nexa-brand text-white rounded-lg hover:opacity-90"><Send/></button>
                        </div>
                    </div>
                </NexaCard>
            </div>
        </div>
    );
}
