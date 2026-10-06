import React from 'react';
import { MapPin, Users, Ticket, QrCode } from 'lucide-react';

export default function InterstateServicePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interstate Travel</h1>
          <p className="text-gray-500">Manage city-to-city routes, terminals, and boarding operations.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
            Manage Terminals
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            + Schedule Departure
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Departures Today</h3>
            <Ticket className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Passengers</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">342</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Active Terminals & Boarding Status</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Terminal</th>
              <th className="p-4 font-semibold text-gray-600">Destination</th>
              <th className="p-4 font-semibold text-gray-600">Time</th>
              <th className="p-4 font-semibold text-gray-600">Capacity</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4"><p className="font-medium">Jibowu Terminal, Lagos</p></td>
              <td className="p-4"><p className="font-medium">Utako, Abuja</p><p className="text-xs text-gray-500">Night Bus</p></td>
              <td className="p-4">19:00 PM</td>
              <td className="p-4">42/50 Booked</td>
              <td className="p-4"><button className="text-blue-600 font-medium flex items-center gap-1 hover:underline"><QrCode className="w-4 h-4"/> View Manifest</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
