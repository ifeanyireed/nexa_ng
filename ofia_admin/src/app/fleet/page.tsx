import React from 'react';
import { Building, Car, CreditCard, Activity, Users, AlertTriangle } from 'lucide-react';

export default function FleetSuperAdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Administration</h1>
        <p className="text-gray-500">Super Admin control layer for Transport Companies and ecosystem operations.</p>
      </div>
      
      {/* KPI Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Global Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white shadow-sm rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Active Companies</h3>
              <Building className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-green-600 mt-2">+3 pending onboarding</p>
          </div>
          <div className="p-6 bg-white shadow-sm rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Vehicles</h3>
              <Car className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">1,842</p>
            <p className="text-xs text-gray-500 mt-2">Across all tenants</p>
          </div>
          <div className="p-6 bg-white shadow-sm rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Platform Revenue</h3>
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">₦42.5M</p>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </div>
          <div className="p-6 bg-white shadow-sm rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Active Trips</h3>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">156</p>
            <p className="text-xs text-gray-500 mt-2">Live operations happening now</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tenant Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tenant Activity</h2>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="divide-y">
              {[
                { name: 'CityTransit Co.', status: 'Active', plan: 'Enterprise', vehicles: 450 },
                { name: 'MetroLines Ltd.', status: 'Onboarding', plan: 'Pro', vehicles: 120 },
                { name: 'CampusShuttle', status: 'Active', plan: 'Basic', vehicles: 15 },
              ].map((tenant, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.plan} Plan • {tenant.vehicles} Vehicles</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Alerts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">System Alerts</h2>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Payment Gateway Delay</p>
                <p className="text-xs mt-1 opacity-90">Paystack webhooks are delayed by 5 minutes. Monitoring situation.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 text-orange-700 rounded-lg">
              <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Tenant Plan Limit Approaching</p>
                <p className="text-xs mt-1 opacity-90">CityTransit Co. is at 98% of their driver allocation for the month.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
