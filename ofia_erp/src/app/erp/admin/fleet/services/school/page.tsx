import React from 'react';
import { School, Users, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SchoolServicePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Transport</h1>
          <p className="text-gray-500">Manage school routes, student manifests, and parent profiles.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + Add School
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* School Profiles List */}
        <div className="md:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Partner Schools</h2>
          </div>
          <div className="divide-y">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Greenwood International</p>
                  <p className="text-sm text-gray-500">Lekki Phase 1 • 145 Students Enrolled</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:underline">Manage Routes</button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">St. Saviour's School</p>
                  <p className="text-sm text-gray-500">Ikoyi • 80 Students Enrolled</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:underline">Manage Routes</button>
            </div>
          </div>
        </div>

        {/* Alerts & Missing */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2 mb-3">Today's Missed Pickups</h2>
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">David Ojo (Greenwood)</p>
                <p className="text-xs mt-1">Parent marked absent via portal at 07:15 AM. Driver notified.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2 mb-3">Guardian Approvals</h2>
            <div className="flex items-start gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg text-sm">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Aisha Bello (St. Saviour's)</p>
                <p className="text-xs mt-1">New authorized pickup person added by parent. Needs ID verification.</p>
                <button className="mt-2 text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">Review ID</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
