import React from 'react';
import { 
  Map as MapIcon, 
  List, 
  Car, 
  User, 
  AlertCircle, 
  Clock, 
  Filter,
  PhoneCall,
  Navigation
} from 'lucide-react';

export default function OpsCommandCentre() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-none p-6 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Operations Command Centre</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time dispatch, tracking, and incident management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter by Service
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white shadow-sm rounded-lg text-sm font-medium hover:bg-blue-700">
            <AlertCircle className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Incoming & Live Requests */}
        <div className="w-80 flex-none border-r bg-gray-50 overflow-y-auto">
          <div className="p-4 border-b bg-white sticky top-0">
            <h2 className="font-semibold text-gray-800">Dispatch Queue</h2>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">On-Demand (5)</span>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Shuttle (2)</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-3 rounded-lg border shadow-sm hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Unassigned</span>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <h3 className="font-medium text-sm">Ride Request • VIP</h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="truncate">12 Ademola Adetokunbo St</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span className="truncate">Murtala Muhammed Airport</span>
                  </div>
                </div>
                <button className="w-full mt-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100">
                  Assign Driver
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Live Map Area */}
        <div className="flex-1 bg-gray-200 relative flex items-center justify-center">
          {/* Map placeholder */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          
          <div className="z-10 flex flex-col items-center text-gray-500">
            <MapIcon className="w-16 h-16 mb-4 text-gray-400" />
            <p className="font-medium">Live Map Engine Integration Required</p>
            <p className="text-sm mt-1">Displays vehicles, drivers, active trips, and service zones.</p>
          </div>

          {/* Map Controls (Floating) */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow border p-1 space-y-1">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Vehicles"><Car className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Drivers"><User className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Zones"><Navigation className="w-5 h-5" /></button>
          </div>

          {/* Mock Vehicle Popover on Map */}
          <div className="absolute bottom-1/3 left-1/3 bg-white rounded-lg shadow-lg border p-4 w-64">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900">AAA-123-XY</p>
                <p className="text-xs text-blue-600 font-medium">Shuttle • Route 4</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500 mt-1"></span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex justify-between"><span>Driver:</span> <span className="font-medium">John Doe</span></p>
              <p className="flex justify-between"><span>Speed:</span> <span>45 km/h</span></p>
              <p className="flex justify-between"><span>Pax:</span> <span>12/28</span></p>
              <p className="flex justify-between"><span>ETA Next:</span> <span>4 mins</span></p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">
                <PhoneCall className="w-3 h-3" /> Contact
              </button>
              <button className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">
                Details
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Timeline & Operations */}
        <div className="w-96 flex-none border-l bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Today's Timeline</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
              <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 border-2 border-white"></div>
              <p className="text-xs text-gray-500 mb-1">10:45 AM • Shuttle Route 4</p>
              <p className="text-sm font-medium">Trip Completed Successfully</p>
              <p className="text-xs text-gray-600 mt-1">Driver: John Doe • 24 Passengers</p>
            </div>
            <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 border-2 border-white"></div>
              <p className="text-xs text-gray-500 mb-1">10:30 AM • On-Demand VIP</p>
              <p className="text-sm font-medium">Driver Arrived at Pickup</p>
              <p className="text-xs text-gray-600 mt-1">Driver: Mike Smith • Vehicle: KJA-992</p>
            </div>
            <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
              <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-1 border-2 border-white animate-pulse"></div>
              <p className="text-xs text-red-500 font-medium mb-1">10:15 AM • Alert</p>
              <p className="text-sm font-medium text-red-700">Vehicle Breakdown Reported</p>
              <p className="text-xs text-gray-600 mt-1">Route 2 • Vehicle EPE-441 is stranded. Replacement requested.</p>
              <button className="mt-2 text-xs text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700">Handle Incident</button>
            </div>
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1 border-2 border-white"></div>
              <p className="text-xs text-gray-500 mb-1">09:00 AM • System</p>
              <p className="text-sm font-medium">Morning Shift Started</p>
              <p className="text-xs text-gray-600 mt-1">42 drivers clocked in.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
