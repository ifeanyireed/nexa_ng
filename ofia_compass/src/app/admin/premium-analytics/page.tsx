"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaNavbar } from '@/components/nexa/NexaNav';

const revenueData = [
  { name: 'Jan', revenue: 400000 },
  { name: 'Feb', revenue: 300000 },
  { name: 'Mar', revenue: 500000 },
  { name: 'Apr', revenue: 450000 },
  { name: 'May', revenue: 600000 },
  { name: 'Jun', revenue: 550000 },
];

const userGrowthData = [
    { name: 'Jan', users: 1200 },
    { name: 'Feb', users: 1800 },
    { name: 'Mar', users: 2500 },
    { name: 'Apr', users: 3200 },
    { name: 'May', users: 4000 },
    { name: 'Jun', users: 5500 },
];

const categoryData = [
  { name: 'Home Services', value: 400 },
  { name: 'Auto Care', value: 300 },
  { name: 'Wellness', value: 300 },
  { name: 'Events', value: 200 },
];
const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminPremiumAnalyticsPage() {
    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-display">Premium Analytics</h1>
                        <p className="text-nexa-text-secondary text-sm mt-1">Platform-wide performance and growth metrics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard title="Total Revenue" value="₦12,250,000" icon={<DollarSign />} trend="+15.5%" />
                        <StatCard title="Active Users" value="5,879" icon={<Users />} trend="+5.2%" />
                        <StatCard title="Total Jobs" value="1,128" icon={<Briefcase />} trend="+18%" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <NexaCard className="lg:col-span-3 p-8">
                            <h3 className="text-lg font-bold mb-6">Platform Revenue (₦)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '10px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </NexaCard>
                         <NexaCard className="lg:col-span-2 p-8">
                            <h3 className="text-lg font-bold mb-6">Jobs by Category</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </NexaCard>
                    </div>
                </div>
            </main>
        </>
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
