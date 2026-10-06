import React from 'react';
import { Map, Users, Clock, Settings, Search } from 'lucide-react';

export default function ShuttleServicePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shuttle Service</h1>
          <p className="text-gray-500">Manage daily commuter routes, schedules, and passenger manifests.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Configure Seats
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            + Add Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Schedules & Routes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Today's Active Schedules</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Search route..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Route</th>
                  <th className="p-4 font-semibold text-gray-600">Time</th>
                  <th className="p-4 font-semibold text-gray-600">Vehicle & Driver</th>
                  <th className="p-4 font-semibold text-gray-600">Bookings</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-blue-50 cursor-pointer">
                  <td className="p-4 font-medium text-blue-600">RTE-01: VI &rarr; Lekki</td>
                  <td className="p-4"><p className="font-medium">08:00 AM</p><p className="text-xs text-gray-500">Arrives 09:15 AM</p></td>
                  <td className="p-4"><p>KJA-992 (Coaster)</p><p className="text-xs text-gray-500">John Doe</p></td>
                  <td className="p-4 font-medium">24 / 28</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Boarding</span></td>
                </tr>
                <tr className="cursor-pointer hover:bg-gray-50">
                  <td className="p-4 font-medium">RTE-02: Yaba &rarr; VI</td>
                  <td className="p-4"><p className="font-medium">09:30 AM</p><p className="text-xs text-gray-500">Arrives 10:45 AM</p></td>
                  <td className="p-4"><p>EPE-441 (Hiace)</p><p className="text-xs text-gray-500">Mike Smith</p></td>
                  <td className="p-4 font-medium">12 / 14</td>
                  <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">Scheduled</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col - Seat Map & Manifest */}
        <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col h-[600px]">
          <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Passenger Manifest (RTE-01)</h2>
          
          {/* Seat Map Visualizer */}
          <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center mb-4 flex-none">
             <div className="w-full max-w-[120px] bg-white border-2 border-gray-300 p-2 rounded-t-3xl rounded-b-lg shadow-inner">
               <div className="flex justify-between mb-4 px-2">
                 <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center text-[10px] bg-gray-200">D</div>
                 <div className="w-6 h-6"></div> {/* Door */}
               </div>
               
               {/* Mock Seats */}
               {[1, 2, 3, 4, 5].map((row) => (
                 <div key={row} className="flex justify-between mb-2">
                   <div className="flex gap-1">
                     <div className="w-6 h-6 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"></div>
                     <div className="w-6 h-6 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"></div>
                   </div>
                   <div className="w-6 h-6 bg-gray-300 rounded text-white text-[10px] flex items-center justify-center border border-gray-400 border-dashed"></div>
                 </div>
               ))}
               <div className="flex justify-between">
                   <div className="w-6 h-6 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center"></div>
                   <div className="w-6 h-6 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center"></div>
                   <div className="w-6 h-6 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center"></div>
               </div>
             </div>
             <p className="text-xs text-gray-500 mt-3 text-center">Click a blue seat to view passenger</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Passenger: Seat 3A</h3>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-gray-900">Sarah Jenkins</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 rounded-full font-medium">Boarded</span>
              </div>
              <p className="text-xs text-gray-600">Booking Ref: #BK-8932</p>
              <p className="text-xs text-gray-600">Pickup: Ademola Adetokunbo St</p>
              <p className="text-xs text-gray-600">Drop-off: CMS Bus Stop</p>
              <button className="mt-3 text-xs text-blue-700 font-medium hover:underline">View Full Booking</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
