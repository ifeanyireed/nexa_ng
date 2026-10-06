import React from 'react';

export default function CorporateVehiclesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Corporate Vehicles</h1>
          <p className="text-gray-500">Track and manage your registered vehicles and their ROI.</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
          + Register Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6 flex items-start gap-4">
          <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">🚌</div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">Toyota Coaster (2018)</h2>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
            </div>
            <p className="text-gray-500 text-sm">Plate: AAA-17JL • 28 Seats</p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">Assigned Driver: Mr Ajit</span>
              <span className="font-bold text-green-600">Monthly ROI: ₦450k</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 flex items-start gap-4">
          <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">🚐</div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">Toyota Hiace</h2>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Maintenance</span>
            </div>
            <p className="text-gray-500 text-sm">Plate: GGE-990KL • 14 Seats</p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">Assigned Driver: Unassigned</span>
              <span className="font-bold text-gray-400">Monthly ROI: ₦120k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
