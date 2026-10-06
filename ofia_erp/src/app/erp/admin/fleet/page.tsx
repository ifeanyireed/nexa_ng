import React from 'react';
import { 
  Car, 
  Banknote, 
  Activity, 
  MapPin, 
  AlertTriangle,
  Clock,
  ShieldAlert,
  Users
} from 'lucide-react';

export default function TenantFleetCommandCentre() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Fleet Command Centre</h1>
        <p className="text-gray-500">Your daily operations, revenue, and fleet status at a glance.</p>
      </div>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Revenue Today</h3>
            <Banknote className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">₦1,245,000</p>
          <p className="text-xs text-green-600 mt-2">+15% vs yesterday</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Trips</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-gray-500 mt-2">48 trips completed today</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Vehicles</h3>
            <Car className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">8 / 45</p>
          <p className="text-xs text-gray-500 mt-2">12 on trip, 5 in maintenance</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Drivers</h3>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">5 / 40</p>
          <p className="text-xs text-gray-500 mt-2">12 on trip, 2 on leave</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Fleet Status */}
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fleet Status</h2>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center relative">
                {/* Simplified placeholder for a donut chart */}
                <span className="text-xl font-bold">45</span>
                <span className="absolute bottom-6 text-xs text-gray-500">Total</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Active (On Trip)</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Available (Parked)</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Maintenance</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Unavailable</span>
                  <span className="font-semibold">20</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Attention Required */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attention Required</h2>
          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Document Expiring</p>
                <p className="text-xs mt-1">Vehicle AAA-123 license expires in 2 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 text-orange-700 rounded-lg">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Overdue for Service</p>
                <p className="text-xs mt-1">Vehicle KJA-882 is 500km past maintenance schedule.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Trip Without Driver</p>
                <p className="text-xs mt-1">Shuttle route 4 (2:00 PM) has no assigned driver.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
