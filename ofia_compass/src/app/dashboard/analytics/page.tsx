"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Eye, Briefcase, TrendingUp } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';

const earningsData = [
  { name: 'Jan', earnings: 4000 },
  { name: 'Feb', earnings: 3000 },
  { name: 'Mar', earnings: 5000 },
  { name: 'Apr', earnings: 4500 },
  { name: 'May', earnings: 6000 },
  { name: 'Jun', earnings: 5500 },
];

const leadsVsDealsData = [
  { name: 'Jan', leads: 40, deals: 24 },
  { name: 'Feb', leads: 30, deals: 13 },
  { name: 'Mar', leads: 50, deals: 40 },
  { name: 'Apr', leads: 45, deals: 35 },
  { name: 'May', leads: 60, deals: 48 },
  { name: 'Jun', leads: 55, deals: 45 },
];

const profileViewsData = [
    { name: 'Wk1', views: 120 },
    { name: 'Wk2', views: 200 },
    { name: 'Wk3', views: 150 },
    { name: 'Wk4', views: 300 },
];


export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-display">Analytics</h1>
                <p className="text-nexa-text-secondary text-sm mt-1">Track your business performance and growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Total Earnings" value="₦1,250,000" icon={<DollarSign />} trend="+12.5%" />
                <StatCard title="Profile Views" value="12,879" icon={<Eye />} trend="+8.2%" />
                <StatCard title="Completed Deals" value="128" icon={<Briefcase />} trend="+20%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NexaCard className="p-8">
                    <h3 className="text-lg font-bold mb-6">Monthly Earnings (₦)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={earningsData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '10px' }} />
                            <Area type="monotone" dataKey="earnings" stroke="#0ea5e9" fill="url(#colorEarnings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </NexaCard>
                <NexaCard className="p-8">
                    <h3 className="text-lg font-bold mb-6">Leads vs. Deals</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leadsVsDealsData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '10px' }}/>
                            <Legend />
                            <Bar dataKey="leads" fill="#f59e0b" />
                            <Bar dataKey="deals" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </NexaCard>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => {
    return (
        <NexaCard className="p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-nexa-text-secondary">{title}</h3>
                <div className="text-nexa-text-faint">{icon}</div>
            </div>
            <p className="text-3xl font-extrabold">{value}</p>
            <div className="flex items-center gap-1 text-sm text-green-500 mt-2">
                <TrendingUp size={16} />
                <span>{trend}</span>
            </div>
        </NexaCard>
    )
}
