import React from 'react';
import { Calendar, Car, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function RentalServicePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bus Rental Service</h1>
          <p className="text-gray-500">Manage private hires, corporate rentals, and pricing configurations.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + New Rental Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Bookings Today</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">14</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Buses</h3>
            <Car className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Est. Revenue</h3>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">₦850k</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Pending Rental Requests</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Customer</th>
                <th className="p-4 font-semibold text-gray-600">Details</th>
                <th className="p-4 font-semibold text-gray-600">Dates</th>
                <th className="p-4 font-semibold text-gray-600">Est. Quote</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4"><p className="font-medium">Chevron Corp</p><p className="text-xs text-gray-500">Corporate</p></td>
                <td className="p-4"><p>30-Seater Coaster</p><p className="text-xs text-gray-500">Lagos to Ibadan</p></td>
                <td className="p-4"><p>Oct 12 - Oct 14</p><p className="text-xs text-gray-500">3 Days</p></td>
                <td className="p-4 font-medium">₦450,000</td>
                <td className="p-4 flex gap-2">
                  <button className="text-green-600 hover:text-green-800"><CheckCircle className="w-5 h-5" /></button>
                  <button className="text-red-600 hover:text-red-800"><XCircle className="w-5 h-5" /></button>
                </td>
              </tr>
              <tr>
                <td className="p-4"><p className="font-medium">Chinedu Eze</p><p className="text-xs text-gray-500">Individual</p></td>
                <td className="p-4"><p>14-Seater Hiace</p><p className="text-xs text-gray-500">Intra-city (Lagos)</p></td>
                <td className="p-4"><p>Oct 15</p><p className="text-xs text-gray-500">1 Day</p></td>
                <td className="p-4 font-medium">₦80,000</td>
                <td className="p-4 flex gap-2">
                  <button className="text-green-600 hover:text-green-800"><CheckCircle className="w-5 h-5" /></button>
                  <button className="text-red-600 hover:text-red-800"><XCircle className="w-5 h-5" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-3">Pricing Configuration</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Base Day Rate (Coaster)</span>
              <span className="font-semibold">₦120,000/day</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Base Day Rate (Hiace)</span>
              <span className="font-semibold">₦60,000/day</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Driver Allowance</span>
              <span className="font-semibold">₦15,000/day</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Out of State Fuel Surcharge</span>
              <span className="font-semibold">+30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Standard Markup</span>
              <span className="font-semibold">20%</span>
            </div>
            <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200">
              Edit Pricing Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
