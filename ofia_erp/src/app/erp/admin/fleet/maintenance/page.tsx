import React from 'react';
import { Wrench, Calendar, AlertTriangle, PenTool, ShieldAlert } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance & Compliance</h1>
          <p className="text-gray-500">Track vehicle health, schedule repairs, and monitor compliance expiry.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Log Maintenance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <PenTool className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-gray-500 mt-2">Vehicles currently in workshop</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Overdue Service</h3>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-xs text-gray-500 mt-2">Past mileage interval</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Compliance Alerts</h3>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold">1</p>
          <p className="text-xs text-gray-500 mt-2">Insurance/Papers expiring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Maintenance Schedule & Jobs */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Recent & Scheduled Maintenance</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Vehicle</th>
                <th className="p-4 font-semibold text-gray-600">Job Description</th>
                <th className="p-4 font-semibold text-gray-600">Cost</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4">
                  <p className="font-medium text-blue-600">KJA-992</p>
                  <p className="text-xs text-gray-500">Toyota Coaster</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">10,000km Routine Service</p>
                  <p className="text-xs text-gray-500">Oil change, filters, brakes</p>
                </td>
                <td className="p-4">₦45,000</td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">In Workshop</span></td>
              </tr>
              <tr>
                <td className="p-4">
                  <p className="font-medium text-blue-600">EPE-441</p>
                  <p className="text-xs text-gray-500">Toyota Hiace</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">A/C Compressor Replacement</p>
                  <p className="text-xs text-gray-500">Reported by driver</p>
                </td>
                <td className="p-4">₦120,000</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Scheduled (Tomorrow)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl border shadow-sm p-4 h-fit">
          <div className="border-b pb-3 mb-4">
            <h2 className="font-semibold text-gray-800">Compliance & Expiry Tracker</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm">Vehicle Insurance Expired</p>
                  <button className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200 font-medium">Update</button>
                </div>
                <p className="text-xs mt-1 font-medium">AAA-123 (Toyota Camry)</p>
                <p className="text-xs mt-1 opacity-90">Expired on Oct 04, 2026. Vehicle has been auto-flagged as unavailable for trips.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 text-orange-700 rounded-lg">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm">Road Worthiness Expiring</p>
                  <button className="text-xs bg-orange-100 px-2 py-1 rounded hover:bg-orange-200 font-medium">Update</button>
                </div>
                <p className="text-xs mt-1 font-medium">LSR-901 (Mercedes Sprinter)</p>
                <p className="text-xs mt-1 opacity-90">Expires in 14 days (Oct 20, 2026).</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
