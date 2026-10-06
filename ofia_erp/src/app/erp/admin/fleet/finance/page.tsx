import React from 'react';
import { Calculator, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinancePricingPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance & Pricing Simulator</h1>
          <p className="text-gray-500">Analyze profitability, simulate trip margins, and manage fleet finances.</p>
        </div>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Gross Revenue (MTD)</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">₦12.4M</p>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 8% vs last month</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Operating Costs</h3>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold">₦4.1M</p>
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 12% vs last month</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Net Margin</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">67%</p>
          <p className="text-xs text-gray-500 mt-2">Healthy</p>
        </div>
        <div className="p-5 bg-white shadow-sm rounded-xl border">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Driver Payouts (Pending)</h3>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">₦845k</p>
          <button className="text-xs text-blue-600 font-medium hover:underline mt-2">Process Payouts</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pricing Simulator */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trip Profitability Simulator</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Calculate expected profit and margin for hypothetical trips.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Distance (KM)</label>
                <input type="number" defaultValue={150} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (Days)</label>
                <input type="number" defaultValue={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Cost (Est)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">₦</span>
                  <input type="number" defaultValue={25000} className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Driver Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">₦</span>
                  <input type="number" defaultValue={30000} className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tolls & Other Costs</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">₦</span>
                  <input type="number" defaultValue={5000} className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Markup (%)</label>
                <input type="number" defaultValue={30} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center">
              <p className="text-sm text-gray-600 font-medium mb-1">Suggested Customer Price</p>
              <p className="text-3xl font-bold text-blue-700">₦78,000</p>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-gray-500">Total Cost: <strong className="text-gray-800">₦60,000</strong></span>
                <span className="text-green-600">Expected Profit: <strong>₦18,000</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Health & Profitability */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-4 mb-4">Fleet Profitability Intelligence</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center justify-between bg-green-50">
              <div>
                <p className="font-bold text-gray-900">KJA-992 (Coaster)</p>
                <p className="text-xs text-gray-600 mt-1">Generated ₦1.2M • Maintenance: ₦45k</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-bold uppercase tracking-wider">Excellent</span>
                <p className="text-sm font-bold text-green-700 mt-1">96% ROI</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">EPE-441 (Hiace)</p>
                <p className="text-xs text-gray-600 mt-1">Generated ₦850k • Maintenance: ₦120k</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">Healthy</span>
                <p className="text-sm font-bold text-blue-700 mt-1">85% ROI</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between bg-red-50 border-red-100">
              <div>
                <p className="font-bold text-gray-900">AAA-123 (Camry)</p>
                <p className="text-xs text-gray-600 mt-1">Generated ₦200k • Maintenance: ₦250k</p>
                <p className="text-xs text-red-600 font-medium mt-1">Destroying margin due to excessive repairs.</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-bold uppercase tracking-wider">Replace</span>
                <p className="text-sm font-bold text-red-700 mt-1">-25% ROI</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
