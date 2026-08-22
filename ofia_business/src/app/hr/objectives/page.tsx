"use client";

import React, { useState, useEffect } from "react";
import { useERPStore, Objective, DEPARTMENTS } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";

export default function ObjectiveManagement() {
  const { objectives, updateObjectives } = useERPStore();
  const [text, setText] = useState("");
  const [weight, setWeight] = useState(15);
  const [objType, setObjType] = useState<"objective" | "competency">("objective");
  const [expectedLevel, setExpectedLevel] = useState<number>(3);
  const [category, setCategory] = useState<string>("Behavioural");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [filterDept, setFilterDept] = useState<string>("All");
  const [depts, setDepts] = useState<string[]>([...DEPARTMENTS]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptText, setNewDeptText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [editObjText, setEditObjText] = useState("");
  const [editObjWeight, setEditObjWeight] = useState(15);
  const [editObjDesc, setEditObjDesc] = useState("");
  const [editObjDepts, setEditObjDepts] = useState<string[]>([]);
  const [editObjCategory, setEditObjCategory] = useState<string>("Behavioural");
  const [editObjExpectedLevel, setEditObjExpectedLevel] = useState<number>(3);

  // Automatically enforce 100% aggregation per department
  useEffect(() => {
    if (filterDept !== "All" && objectives.length > 0) {
      const deptObjs = objectives.filter(o => 
        o.type === "competency" || 
        (o.departments && o.departments.includes(filterDept))
      );
      if (deptObjs.length > 0) {
        const currentSum = deptObjs.reduce((sum, o) => sum + o.weight, 0);
        if (currentSum !== 100 && currentSum > 0) {
          let newSum = 0;
          const updatedObjs = objectives.map(o => {
            const isPart = o.type === "competency" || (o.departments && o.departments.includes(filterDept));
            if (isPart) {
              const newWeight = Math.round((o.weight / currentSum) * 100);
              newSum += newWeight;
              return { ...o, weight: newWeight };
            }
            return o;
          });

          if (newSum !== 100) {
            const diff = 100 - newSum;
            const targetIdx = updatedObjs.findIndex(o => 
              o.type === "competency" || 
              (o.departments && o.departments.includes(filterDept))
            );
            if (targetIdx !== -1) {
              updatedObjs[targetIdx] = {
                ...updatedObjs[targetIdx],
                weight: updatedObjs[targetIdx].weight + diff
              };
            }
          }

          updateObjectives(updatedObjs);
        }
      }
    }
  }, [filterDept, objectives, updateObjectives]);

  const handleSaveDept = () => {
    const trimmed = newDeptText.trim();
    if (!trimmed) return;
    if (depts.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      alert("This department already exists!");
      return;
    }
    const updated = [...depts, trimmed];
    setDepts(updated);
    setIsAddingDept(false);
    setNewDeptText("");
  };

  const handleToggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const getCategoryBadgeStyle = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "behavioural":
        return "bg-indigo-50 border-indigo-100 text-indigo-705";
      case "leadership":
        return "bg-purple-50 border-purple-100 text-purple-705";
      case "technical":
        return "bg-cyan-50 border-cyan-100 text-cyan-705";
      case "culture":
        return "bg-pink-50 border-pink-100 text-pink-705";
      case "role specific":
        return "bg-amber-50 border-amber-100 text-amber-705";
      case "self-development":
        return "bg-teal-50 border-teal-100 text-teal-705";
      default:
        return "bg-slate-50 border-slate-100 text-slate-700";
    }
  };
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !weight) {
      alert("Please provide objective details.");
      return;
    }

    if (objType === "objective" && selectedDepts.length === 0) {
      alert("Please select at least one department for the work-related objective.");
      return;
    }

    const texts = text.split(",").map(t => t.trim()).filter(t => t.length > 0);
    if (texts.length === 0) {
      alert("Please provide objective details.");
      return;
    }

    const newObjs: Objective[] = texts.map((t, idx) => ({
      id: `OBJ${objectives.length + idx + 1}`,
      text: t,
      weight,
      type: objType,
      expectedLevel: objType === "competency" ? expectedLevel : undefined,
      category: objType === "competency" ? category : undefined,
      departments: objType === "objective" ? selectedDepts : undefined,
      description: descriptionText.trim() 
        ? descriptionText.split("\n").map(line => line.trim()).filter(line => line.length > 0) 
        : undefined,
    }));

    const updated = [...objectives, ...newObjs];
    updateObjectives(updated);
    setText("");
    setWeight(15);
    setSelectedDepts([]);
    setDescriptionText("");
    alert(texts.length > 1 ? `${texts.length} objectives added successfully!` : "Objective added successfully!");
  };

  const handleDelete = (id: string) => {
    const updated = objectives.filter(o => o.id !== id);
    updateObjectives(updated);
  };

  const openEditModal = (o: Objective) => {
    setEditingObjective(o);
    setEditObjText(o.text);
    setEditObjWeight(o.weight);
    setEditObjDesc(o.description ? o.description.join("\n") : "");
    setEditObjDepts(o.departments || []);
    setEditObjCategory(o.category || "Behavioural");
    setEditObjExpectedLevel(o.expectedLevel || 3);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjective) return;
    if (!editObjText.trim()) {
      alert("Please provide objective details.");
      return;
    }
    
    const isWorkObj = editingObjective.type === "objective";
    if (isWorkObj && editObjDepts.length === 0) {
      alert("Please select at least one department for the work-related objective.");
      return;
    }

    const updated = objectives.map(o => {
      if (o.id === editingObjective.id) {
        return {
          ...o,
          text: editObjText.trim(),
          weight: editObjWeight,
          description: editObjDesc.trim()
            ? editObjDesc.split("\n").map(line => line.trim()).filter(line => line.length > 0)
            : undefined,
          departments: isWorkObj ? editObjDepts : undefined,
          category: !isWorkObj ? editObjCategory : undefined,
          expectedLevel: !isWorkObj ? editObjExpectedLevel : undefined,
        };
      }
      return o;
    });

    updateObjectives(updated);
    setEditingObjective(null);
    alert("Objective updated successfully!");
  };

  const workObjectives = objectives.filter(
    (o) => (o.type === "objective" || !o.type) && (filterDept === "All" || o.departments?.includes(filterDept))
  );

  const totalPages = Math.ceil(workObjectives.length / itemsPerPage);

  // Reset pagination to page 1 when filterDept changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDept]);

  // Adjust page number if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkObjectives = workObjectives.slice(startIndex, startIndex + itemsPerPage);

  const totalWeight = filterDept === "All"
    ? 100
    : objectives.reduce((sum, o) => {
        if (o.type === "competency") {
          return sum + o.weight;
        }
        if (o.departments?.includes(filterDept)) {
          return sum + o.weight;
        }
        return sum;
      }, 0);

  return (
    <ERPLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Objective Management</h2>
          <p className="text-xs text-slate-450 font-semibold mt-1">Configure KPI parameters and department objectives weights</p>
        </div>

        {/* Audit weight warning indicator */}
        <div className="p-4 rounded-2xl border flex justify-between items-center text-xs font-bold bg-emerald-50 border-emerald-100 text-emerald-800">
          <div>
            <span>Active Objectives Weight Assessment:</span>
            <span className="font-medium block mt-0.5">
              {totalWeight > 0 
                ? "Aggregation of 100% per department in objective weight is automatically balanced and enforced."
                : "No objectives configured for this department."}
            </span>
          </div>
          <span className="text-sm font-black bg-white px-3 py-1 rounded-xl shadow-sm">{totalWeight}%</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Objectives List (7cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Work-Related Objectives Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-855 text-sm">1. Work-Related Objectives</h3>
                  <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                    Weight: {workObjectives.reduce((sum, o) => sum + o.weight, 0)}%
                  </span>
                </div>
                
                {/* Department filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dept Filter:</span>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="pl-2 pr-8 py-1 border border-gray-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Departments</option>
                    {depts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {workObjectives.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic text-center py-4">No work objectives configured for this department.</p>
                ) : (
                  paginatedWorkObjectives.map((o) => (
                    <div key={o.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-slate-700 text-xs">{o.text}</p>
                        {o.description && o.description.length > 0 && (
                          <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-450 text-[10px] font-semibold">
                            {o.description.map((line, lIdx) => (
                              <li key={lIdx}>{line}</li>
                            ))}
                          </ul>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-blue-700 uppercase">Weight: {o.weight}%</span>
                          {o.departments && o.departments.map(d => (
                            <span key={d} className="bg-white text-slate-500 border border-gray-150 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(o)}
                          className="text-blue-600 hover:text-blue-750 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id)}
                          className="text-red-500 hover:text-red-750 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
                  <p className="text-[11px] text-slate-450 font-bold">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, workObjectives.length)} of {workObjectives.length} objectives
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      if (!shouldShow) {
                        if (page === 2 || page === totalPages - 1) {
                          return <span key={`dots-${page}`} className="text-[10px] text-slate-400 font-bold px-1">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-gray-50 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Core Competency Ratings Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="font-bold text-slate-855 text-sm">2. Core Competency Ratings</h3>
              </div>
              <div className="space-y-3">
                {objectives.filter(o => o.type === "competency").length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic text-center py-4">No core competencies configured.</p>
                ) : (
                  objectives.filter(o => o.type === "competency").map((o) => (
                    <div key={o.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-slate-700 text-xs">{o.text}</p>
                        {o.description && o.description.length > 0 && (
                          <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-450 text-[10px] font-semibold">
                            {o.description.map((line, lIdx) => (
                              <li key={lIdx}>{line}</li>
                            ))}
                          </ul>
                        )}
                        <div className="flex gap-3 mt-1 items-center">
                          <span className="text-[9px] font-bold text-slate-450 uppercase">Expected Level: {o.expectedLevel || 3} / 5</span>
                          {o.category && (
                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase ${getCategoryBadgeStyle(o.category)}`}>
                              {o.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(o)}
                          className="text-blue-600 hover:text-blue-750 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id)}
                          className="text-red-500 hover:text-red-750 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Add Objective (5cols) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/40 lg:col-span-5">
            <h3 className="font-bold text-slate-855 text-sm pb-2 border-b border-gray-100 mb-4">Add Core Objective</h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Objective Title (Comma-separated to bulk add)</label>
                <textarea
                  placeholder="e.g. Technical Excellence, Project Delivery..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">List-based Description (One item per line)</label>
                <textarea
                  placeholder="e.g.&#10;Complete all assigned tasks&#10;Maintain 98% accuracy"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Objective Type</label>
                <select
                  value={objType}
                  onChange={(e) => setObjType(e.target.value as "objective" | "competency")}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold"
                >
                  <option value="objective">Work-Related Objective</option>
                  <option value="competency">Core Competency Rating</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Weight Percentage (%)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              {objType === "objective" && (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1.5 tracking-wider">Target Departments</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {depts.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleDept(d)}
                        className={`px-3 py-1.5 rounded-lg border text-left text-[10px] font-bold transition-all ${
                          selectedDepts.includes(d)
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}

                    {/* Inline new department adder with plus icon */}
                    {isAddingDept ? (
                      <div className="flex gap-1 items-center border border-blue-200 rounded-lg p-1 bg-blue-50/20 col-span-2 shadow-sm">
                        <input
                          type="text"
                          placeholder="New Dept Name..."
                          value={newDeptText}
                          onChange={(e) => setNewDeptText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveDept();
                            }
                          }}
                          className="px-2 py-1 text-[10px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleSaveDept}
                          className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsAddingDept(false); setNewDeptText(""); }}
                          className="bg-gray-200 text-slate-600 rounded p-1 hover:bg-gray-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingDept(true)}
                        className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-left text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:border-gray-400 transition-all flex items-center justify-center gap-1.5 bg-gray-50/40 hover:bg-gray-50"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Dept
                      </button>
                    )}
                  </div>
                </div>
              )}

              {objType === "competency" && (
                <>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Competency Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold"
                    >
                      <option value="Behavioural">Behavioural</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Technical">Technical</option>
                      <option value="Culture">Culture</option>
                      <option value="Role Specific">Role Specific</option>
                      <option value="Self-Development">Self-Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Expected Competency Rating (1-5)</label>
                    <select
                      value={expectedLevel}
                      onChange={(e) => setExpectedLevel(Number(e.target.value))}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>Level {lvl}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
              >
                Add Objective
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      {editingObjective && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setEditingObjective(null)}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-655 rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div>
              <h3 className="font-bold text-slate-855 text-sm">
                {editingObjective.type === "objective" ? "Edit Work-Related Objective" : "Edit Core Competency Rating"}
              </h3>
              <p className="text-[10px] text-slate-455 font-semibold mt-0.5">Modify properties of the active evaluation parameter.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Objective Title</label>
                <textarea
                  required
                  value={editObjText}
                  onChange={(e) => setEditObjText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">List-based Description (One item per line)</label>
                <textarea
                  placeholder="e.g.&#10;Complete all assigned tasks"
                  value={editObjDesc}
                  onChange={(e) => setEditObjDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Weight Percentage (%)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={editObjWeight}
                  onChange={(e) => setEditObjWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>

              {editingObjective.type === "objective" ? (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Target Departments</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-40 overflow-y-auto p-1 border border-gray-100 rounded-xl">
                    {depts.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (editObjDepts.includes(d)) {
                            setEditObjDepts(editObjDepts.filter(dept => dept !== d));
                          } else {
                            setEditObjDepts([...editObjDepts, d]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-left text-[9.5px] font-bold transition-all cursor-pointer ${
                          editObjDepts.includes(d)
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Competency Category</label>
                    <select
                      value={editObjCategory}
                      onChange={(e) => setEditObjCategory(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold"
                    >
                      <option value="Behavioural">Behavioural</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Technical">Technical</option>
                      <option value="Culture">Culture</option>
                      <option value="Role Specific">Role Specific</option>
                      <option value="Self-Development">Self-Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase mb-1.5 tracking-wider">Expected Competency Rating (1-5)</label>
                    <select
                      value={editObjExpectedLevel}
                      onChange={(e) => setEditObjExpectedLevel(Number(e.target.value))}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>Level {lvl}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingObjective(null)}
                  className="px-4 py-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ERPLayout>
  );
}
