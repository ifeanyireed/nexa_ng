"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  FolderTree,
  Layers,
  Plus,
  Users,
  DollarSign,
  X,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface DepartmentItem {
  code: string;
  name: string;
  head: string;
  headCount: number;
  budget: string;
  costCenter: string;
}

const INITIAL_DEPTS: DepartmentItem[] = [
  { code: "DEPT-FIN", name: "Finance & Accounts", head: "Oluwatobiloba Olateju", headCount: 8, budget: "₦42,000,000", costCenter: "CC-101" },
  { code: "DEPT-FLT", name: "Fleet Operations & Maintenance", head: "Babajide Sanwo", headCount: 28, budget: "₦95,000,000", costCenter: "CC-201" },
  { code: "DEPT-IT", name: "Systems & IT / ERP", head: "Adeyemi Phillips", headCount: 6, budget: "₦28,000,000", costCenter: "CC-301" },
  { code: "DEPT-HR", name: "Human Resources & Talent", head: "Goldy Okeke", headCount: 5, budget: "₦18,500,000", costCenter: "CC-401" },
  { code: "DEPT-MKT", name: "Commercial & Growth", head: "Chioma Okonkwo", headCount: 12, budget: "₦35,000,000", costCenter: "CC-501" },
  { code: "DEPT-EXE", name: "Executive Directorate", head: "Dr. Babatunde Jinadu (MD)", headCount: 4, budget: "₦50,000,000", costCenter: "CC-001" },
];

export default function ERPDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>(INITIAL_DEPTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newHead, setNewHead] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newCostCenter, setNewCostCenter] = useState("");

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    const newDept: DepartmentItem = {
      code: newCode.toUpperCase(),
      name: newName,
      head: newHead || "Pending Appointment",
      headCount: 1,
      budget: newBudget ? `₦${newBudget}` : "₦10,000,000",
      costCenter: newCostCenter || `CC-${departments.length + 100}`,
    };

    setDepartments([...departments, newDept]);
    setIsAddModalOpen(false);
    setNewCode("");
    setNewName("");
    setNewHead("");
    setNewBudget("");
    setNewCostCenter("");
  };

  return (
    <ErpAdminShell
      title="Departmental Hierarchy & Cost Centers"
      subtitle="Define organizational divisions, leadership reporting lines, and budgetary cost centers."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#1A56DB] text-white"
        >
          Add Department
        </NexaButton>
      }
    >
      <div className="space-y-4 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <NexaCard key={d.code} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)] shadow-xs rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#1A56DB]">{d.code}</span>
                <NexaBadge variant="brand">{d.costCenter}</NexaBadge>
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{d.name}</h3>
              <div className="space-y-1.5 text-xs text-[var(--nexa-text-secondary)] font-mono pt-1 border-t border-[var(--nexa-border)]">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Department Head:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{d.head}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Headcount:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">{d.headCount} Staff</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Budget Allocation:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.budget}</span>
                </div>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>

      {/* ADD DEPARTMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)]">
                  Add Department Division
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Create a cost center and assign leadership.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDept} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Dept Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEPT-OPS"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CC-601"
                    value={newCostCenter}
                    onChange={(e) => setNewCostCenter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Department Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Support & Success"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Department Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Ade"
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Annual Budget (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000,000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  className="bg-[#1A56DB] text-white"
                >
                  Create Department
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}
