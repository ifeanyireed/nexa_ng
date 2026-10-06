import React from 'react';

export default function GlobalRoutesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Global Routes & Pricing</h1>
          <p className="text-gray-500">Manage all platform routes, bus stops, and dynamic surge pricing.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + Create Route
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Route Code</th>
              <th className="p-4 font-semibold text-gray-600">Origin &rarr; Destination</th>
              <th className="p-4 font-semibold text-gray-600">Stops</th>
              <th className="p-4 font-semibold text-gray-600">Base Price</th>
              <th className="p-4 font-semibold text-gray-600">Surge Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-bold text-blue-600">CMS401</td>
              <td className="p-4">Ademola Adetokunbo &rarr; CMS</td>
              <td className="p-4">8 Stops</td>
              <td className="p-4">₦1,200</td>
              <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Normal</span></td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-blue-600">SGT4</td>
              <td className="p-4">Sangotedo &rarr; Eko Electricity</td>
              <td className="p-4">29 Stops</td>
              <td className="p-4">₦3,010</td>
              <td className="p-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">1.5x Surge</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
