import React from 'react';

export default function StaffCommutePage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Staff Commute Management</h1>
          <p className="text-gray-500">Manage employee transport subscriptions and assigned routes.</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
          + Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Employee</th>
              <th className="p-4 font-semibold text-gray-600">Department</th>
              <th className="p-4 font-semibold text-gray-600">Assigned Route</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">
                <p className="font-bold">Ifeanyi Ibeh</p>
                <p className="text-sm text-gray-500">ifeanyi@techcorp.com</p>
              </td>
              <td className="p-4">Engineering</td>
              <td className="p-4">Mainland Hub &rarr; Island Office</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span></td>
              <td className="p-4">
                <button className="text-blue-600 text-sm font-medium">Edit</button>
              </td>
            </tr>
            <tr>
              <td className="p-4">
                <p className="font-bold">Jane Doe</p>
                <p className="text-sm text-gray-500">jane@techcorp.com</p>
              </td>
              <td className="p-4">Marketing</td>
              <td className="p-4">Ikeja City &rarr; Island Office</td>
              <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Suspended</span></td>
              <td className="p-4">
                <button className="text-blue-600 text-sm font-medium">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
