"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Paperclip, Smile, MoreHorizontal, User } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/nexa/AuthContext';
import { api, getAuthToken } from '@/lib/api';

interface Conversation {
  other_user_id: string;
  other_name: string;
  last_message: string;
  time: string;
  unread: number;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const selectedConvoRef = useRef<Conversation | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Keep the selected conversation Ref up to date for WebSocket callback
    useEffect(() => {
        selectedConvoRef.current = selectedConvo;
    }, [selectedConvo]);

    // Load conversations
    const loadConversations = async (silent = false) => {
        try {
            if (!silent) setLoadingConvos(true);
            const data = await api.get("/chat/conversations");
            setConversations(data || []);
            
            // Auto-select first conversation if none selected
            if (!selectedConvo && data && data.length > 0) {
                setSelectedConvo(data[0]);
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            if (!silent) setLoadingConvos(false);
        }
    };

    // Load messages for selected conversation
    const loadMessages = async (convoId: string, silent = false) => {
        try {
            if (!silent) setLoadingMessages(true);
            const data = await api.get(`/chat/messages/${convoId}`);
            setMessages(data || []);
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    // Initialize conversations and WebSocket connection on mount
    useEffect(() => {
        loadConversations();

        const token = getAuthToken();
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api";
        const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://") + `/ws?token=${token}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected successfully");
        };

        ws.onmessage = (event) => {
            try {
                const newMsg: Message = JSON.parse(event.data);
                const currentConvo = selectedConvoRef.current;
                
                // Append message to active chat if sender matches the currently selected conversation
                if (currentConvo && (newMsg.senderId === currentConvo.other_user_id || newMsg.receiverId === currentConvo.other_user_id)) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
                
                // Silently reload conversations list to update previews and unread badges
                loadConversations(true);
            } catch (err) {
                console.error("Failed to parse incoming WebSocket message", err);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            ws.close();
        };
    }, []);

    // Load messages whenever selected conversation changes
    useEffect(() => {
        if (selectedConvo) {
            loadMessages(selectedConvo.other_user_id);
        }
    }, [selectedConvo]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !selectedConvo) return;

        const textToSend = inputText;
        setInputText("");

        try {
            const newMsg = await api.post("/chat/messages", {
                receiver_id: selectedConvo.other_user_id,
                text: textToSend
            });
            
            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            loadConversations(true);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const filteredConvos = conversations.filter(c => 
        c.other_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Sidebar with conversations */}
            <NexaCard className="w-96 p-0 flex flex-col border-nexa-border">
                <div className="p-6 border-b border-nexa-border">
                    <h1 className="text-2xl font-extrabold text-display">Messages</h1>
                    <div className="relative mt-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nexa-text-faint" />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none text-sm text-nexa-text-primary" 
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingConvos ? (
                        <div className="p-8 text-center text-sm text-nexa-text-faint">Loading conversations...</div>
                    ) : filteredConvos.length > 0 ? (
                        filteredConvos.map(convo => (
                            <button 
                                key={convo.other_user_id} 
                                onClick={() => setSelectedConvo(convo)}
                                className={cn(
                                    "w-full text-left flex items-center gap-4 p-4 border-b border-nexa-border transition-colors",
                                    selectedConvo?.other_user_id === convo.other_user_id ? 'bg-nexa-brand/5' : 'hover:bg-nexa-bg-surface'
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                    {convo.other_name.slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold truncate text-sm text-nexa-text-primary">{convo.other_name}</h3>
                                        <span className="text-[10px] text-nexa-text-faint shrink-0 ml-2">
                                            {new Date(convo.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-nexa-text-secondary truncate pr-2">{convo.last_message}</p>
                                        {convo.unread > 0 && (
                                            <div className="w-5 h-5 bg-nexa-brand text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shrink-0">
                                                {convo.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-sm text-nexa-text-faint">No conversations found</div>
                    )}
                </div>
            </NexaCard>

            {/* Main chat window */}
            <div className="flex-1 flex flex-col h-full">
                {selectedConvo ? (
                    <>
                        <NexaCard className="p-4 flex items-center justify-between border-b border-nexa-border">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center font-bold text-sm uppercase">
                                    {selectedConvo.other_name.slice(0, 2)}
                                </div>
                                <div>
                                    <h2 className="font-bold text-base leading-tight text-nexa-text-primary">{selectedConvo.other_name}</h2>
                                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{selectedConvo.role}</span>
                                </div>
                            </div>
                            <MoreHorizontal className="w-6 h-6 text-nexa-text-faint cursor-pointer" />
                        </NexaCard>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-nexa-bg-base/30 rounded-2xl my-4">
                            {loadingMessages ? (
                                <div className="text-center text-sm text-nexa-text-faint py-4">Loading messages...</div>
                            ) : messages.length > 0 ? (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} className={cn("flex items-end gap-2", isMe ? 'justify-end' : '')}>
                                            <div className={cn(
                                                "max-w-md p-3.5 px-4 rounded-2xl text-sm leading-normal shadow-sm",
                                                isMe 
                                                  ? 'bg-nexa-brand text-white rounded-br-none' 
                                                  : 'bg-nexa-bg-surface text-nexa-text-primary rounded-bl-none border border-nexa-border'
                                            )}>
                                                <p>{msg.text}</p>
                                                <span className={cn(
                                                    "text-[8px] block text-right mt-1.5 font-medium",
                                                    isMe ? 'text-white/70' : 'text-nexa-text-faint'
                                                )}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-sm text-nexa-text-faint py-8">Send a message to start the conversation!</div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="mt-auto">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    className="w-full h-14 pl-6 pr-28 bg-nexa-bg-surface border border-nexa-border rounded-2xl focus:outline-none text-sm text-nexa-text-primary" 
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                   <button type="button" className="p-2 text-nexa-text-faint hover:text-nexa-brand"><Smile className="w-5 h-5" /></button>
                                   <button type="button" className="p-2 text-nexa-text-faint hover:text-nexa-brand"><Paperclip className="w-5 h-5" /></button>
                                   <button type="submit" className="p-2.5 bg-nexa-brand text-white rounded-xl hover:opacity-90 transition-opacity"><Send className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-nexa-text-faint max-w-sm">
                            <div className="w-16 h-16 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto mb-4 border border-nexa-border">
                                <User className="w-8 h-8 text-nexa-text-faint" />
                            </div>
                            <h3 className="font-bold text-lg text-nexa-text-primary mb-1">Your Inbox</h3>
                            <p className="text-sm">Select a conversation from the list to start messaging or view customer inquiries.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
