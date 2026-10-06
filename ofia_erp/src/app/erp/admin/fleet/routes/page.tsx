import React from 'react';

export default function TenantRoutesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Routes & Schedules</h1>
          <p className="text-gray-500">Manage your shuttle and interstate routes, bus stops, and schedules.</p>
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
              <th className="p-4 font-semibold text-gray-600">Service Type</th>
              <th className="p-4 font-semibold text-gray-600">Base Price</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-bold text-blue-600">RTE-401</td>
              <td className="p-4">Ademola Adetokunbo &rarr; CMS</td>
              <td className="p-4">Shuttle</td>
              <td className="p-4">₦1,200</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">Active</span></td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-blue-600">RTE-402</td>
              <td className="p-4">Lekki Phase 1 &rarr; VI</td>
              <td className="p-4">Shuttle</td>
              <td className="p-4">₦1,500</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">Active</span></td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-blue-600">INT-105</td>
              <td className="p-4">Lagos &rarr; Abuja</td>
              <td className="p-4">Interstate</td>
              <td className="p-4">₦35,000</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
