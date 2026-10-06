import React from 'react';

export default function GlobalVehiclesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Global Vehicle Approvals</h1>
          <p className="text-gray-500">Review and approve vehicles submitted by corporate partners and individuals.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Vehicle</th>
              <th className="p-4 font-semibold text-gray-600">Owner/Tenant</th>
              <th className="p-4 font-semibold text-gray-600">Documents</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">
                <p className="font-bold">Toyota Coaster (2018)</p>
                <p className="text-sm text-gray-500">AAA-17JL • 28 Seats</p>
              </td>
              <td className="p-4">TechCorp Ltd.</td>
              <td className="p-4">
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  ✓ Insurance <br/>✓ License
                </span>
              </td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Approved</span></td>
              <td className="p-4">
                <button className="text-gray-500 hover:text-gray-900 text-sm font-medium">Revoke</button>
              </td>
            </tr>
            <tr>
              <td className="p-4">
                <p className="font-bold">Jet Mover (2023)</p>
                <p className="text-sm text-gray-500">KJA-992XY • 14 Seats</p>
              </td>
              <td className="p-4">Independent (Ifeanyi)</td>
              <td className="p-4">
                <span className="text-orange-600 text-sm font-medium flex items-center gap-1">
                  ⚠ Pending Insurance
                </span>
              </td>
              <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Pending Review</span></td>
              <td className="p-4 flex gap-2">
                <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-100">Review</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
