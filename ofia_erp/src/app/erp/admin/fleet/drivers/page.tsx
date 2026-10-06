import React from 'react';
import { User, Star, Shield, Car, CheckCircle, Clock } from 'lucide-react';

export default function DriverManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-gray-500">Manage driver profiles, performance, and onboarding verifications.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + Add Driver
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Drivers</h3>
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">142</p>
          <p className="text-xs text-gray-500 mt-2">Currently online or on trip</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg. Rating</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">4.8</p>
          <p className="text-xs text-gray-500 mt-2">Based on 12k ratings</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-gray-500 mt-2">Documents awaiting approval</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Incidents (30d)</h3>
            <Car className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-gray-500 mt-2">Reported across all services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Driver List */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Active Drivers</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Search name or ID..." className="px-3 py-1.5 border rounded-lg text-sm w-48 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Driver</th>
                <th className="p-4 font-semibold text-gray-600">Performance</th>
                <th className="p-4 font-semibold text-gray-600">Current Assignment</th>
                <th className="p-4 font-semibold text-gray-600">License/Compliance</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Michael Okon</p>
                      <p className="text-xs text-gray-500">ID: DRV-8012</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" /> <span className="font-medium text-gray-900">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">452 Trips • 0 Incidents</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">On-Demand</p>
                  <p className="text-xs text-gray-500">Lexus ES350 (KJA-192)</p>
                </td>
                <td className="p-4">
                  <span className="text-green-600 flex items-center gap-1 text-xs font-medium"><CheckCircle className="w-3 h-3"/> Valid</span>
                </td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Online</span></td>
              </tr>
              <tr>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Samuel Peters</p>
                      <p className="text-xs text-gray-500">ID: DRV-7210</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" /> <span className="font-medium text-gray-900">4.5</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1,204 Trips • 2 Canceled</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">Shuttle (RTE-04)</p>
                  <p className="text-xs text-gray-500">Toyota Coaster (EPE-331)</p>
                </td>
                <td className="p-4">
                  <span className="text-orange-600 flex items-center gap-1 text-xs font-medium"><Clock className="w-3 h-3"/> Exp. in 12 days</span>
                </td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">On Trip</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Onboarding & Document Review */}
        <div className="bg-white rounded-xl border shadow-sm p-4 h-fit">
          <div className="border-b pb-3 mb-4">
            <h2 className="font-semibold text-gray-800">Pending Onboarding Review</h2>
            <p className="text-xs text-gray-500">Background and document verifications</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">Emeka Udo</p>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded font-medium">Action Needed</span>
              </div>
              <ul className="text-xs space-y-2 mt-3 mb-4">
                <li className="flex justify-between text-green-700"><span className="flex gap-1"><CheckCircle className="w-4 h-4"/> Identity</span> <span>Verified</span></li>
                <li className="flex justify-between text-green-700"><span className="flex gap-1"><CheckCircle className="w-4 h-4"/> Driver's License</span> <span>Verified</span></li>
                <li className="flex justify-between text-gray-500"><span className="flex gap-1"><Clock className="w-4 h-4"/> Background Check</span> <span>Pending API</span></li>
              </ul>
              <button className="w-full bg-white border shadow-sm py-1.5 rounded text-sm font-medium hover:bg-gray-50">Review Profile</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
