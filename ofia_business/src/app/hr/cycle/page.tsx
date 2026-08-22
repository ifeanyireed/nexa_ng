"use client";

import React, { useState } from "react";
import { useERPStore, ReviewCycle, DEPARTMENTS } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function ReviewCycleManagement() {
  const { cycles, addReviewCycle, updateCycles } = useERPStore();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [cycleStatus, setCycleStatus] = useState<"Draft" | "Active">("Draft");
  
  const depts = DEPARTMENTS;

  const handleSelectAll = () => {
    if (selectedDepts.length === depts.length) {
      setSelectedDepts([]);
    } else {
      setSelectedDepts([...depts]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || selectedDepts.length === 0) {
      alert("Please fill in all cycle details and select at least one department.");
      return;
    }

    const newCycle: ReviewCycle = {
      id: `CYC00${cycles.length + 1}`,
      name,
      startDate,
      endDate,
      status: cycleStatus,
      departments: selectedDepts,
    };

    addReviewCycle(newCycle);
    setName("");
    setStartDate("");
    setEndDate("");
    setSelectedDepts([]);
    setCycleStatus("Draft");
    alert("Review Cycle created successfully!");
  };

  const handleToggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleUpdateStatus = (cycleId: string, newStatus: "Draft" | "Active" | "Completed") => {
    const list = cycles.map(c => {
      if (c.id === cycleId) {
        return { ...c, status: newStatus };
      }
      // If we activate a cycle, deactivate others
      if (newStatus === "Active" && c.status === "Active") {
        return { ...c, status: "Completed" as const };
      }
      return c;
    });
    updateCycles(list);
  };

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header Title */}
        <div>
          <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Review Cycle Management</h2>
          <p className="text-xs text-slate-450 font-semibold mt-1">Configure performance timelines and objectives parameters</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active Cycles List (7cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-7 flex flex-col gap-4">
            <h3 className="font-bold text-slate-850 text-sm pb-2 border-b border-gray-100">Review Cycles</h3>
            
            <div className="space-y-4">
              {cycles.map((c) => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-3 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {c.id} • period: {c.startDate} to {c.endDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.status === "Active" ? (
                        <span className="bg-blue-50 text-blue-800 font-black px-2.5 py-0.5 rounded text-[10px] uppercase">Active</span>
                      ) : c.status === "Completed" ? (
                        <span className="bg-gray-150 text-gray-550 font-black px-2.5 py-0.5 rounded text-[10px] uppercase">Completed</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-750 font-black px-2.5 py-0.5 rounded text-[10px] uppercase">Draft</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {c.departments.map(d => (
                      <span key={d} className="bg-white border border-gray-200 text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center justify-end pt-2 border-t border-gray-150/50">
                    {c.status === "Draft" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "Active")}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-all"
                      >
                        Publish Cycle
                      </button>
                    )}
                    {c.status === "Active" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "Completed")}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-[10px] transition-all"
                      >
                        Complete Cycle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Cycle Form (5cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-5">
            <h3 className="font-bold text-slate-850 text-sm pb-2 border-b border-gray-100 mb-4">Create Review Cycle</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Cycle Name</label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Annual Performance Cycle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Target Departments</label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 uppercase cursor-pointer"
                  >
                    {selectedDepts.length === depts.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto p-2 border border-gray-150 rounded-xl">
                  {depts.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleToggleDept(d)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[9.5px] font-bold transition-all cursor-pointer ${
                        selectedDepts.includes(d)
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-gray-200 text-slate-550 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Initial Publish State</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={cycleStatus === "Draft"}
                      onChange={() => setCycleStatus("Draft")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Save as Draft
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={cycleStatus === "Active"}
                      onChange={() => setCycleStatus("Active")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Active (Publish)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
              >
                Create Cycle
              </button>
            </form>
          </div>

        </div>

      </div>
    </ERPLayout>
  );
}
