import React from 'react';
import { Map, Zap, Settings, TrendingUp } from 'lucide-react';

export default function OnDemandServicePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">On-Demand Services</h1>
          <p className="text-gray-500">Configure ride-hailing service zones, base fares, and dynamic pricing rules.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + Create Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Service Zones Configuration */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Map className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Operating Zones & Base Fares</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Zone Name</th>
                <th className="p-4 font-semibold text-gray-600">Operating Hours</th>
                <th className="p-4 font-semibold text-gray-600">Base Fare</th>
                <th className="p-4 font-semibold text-gray-600">Per KM</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium">Lagos Island / VI</td>
                <td className="p-4">24/7</td>
                <td className="p-4">₦1,500</td>
                <td className="p-4">₦200</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Active</span></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Mainland Central</td>
                <td className="p-4">05:00 - 23:00</td>
                <td className="p-4">₦1,000</td>
                <td className="p-4">₦150</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Peak Pricing Rules */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-2 border-b pb-3 mb-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-gray-800">Surge & Peak Pricing</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <p className="font-semibold text-sm">Morning Rush Hour</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 07:00 - 09:30 AM</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">1.5x</p>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <p className="font-semibold text-sm">Rain / Bad Weather</p>
                  <p className="text-xs text-gray-500">Manual Trigger Required</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">2.0x</p>
                  <button className="mt-1 text-xs bg-white border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-100">Activate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
