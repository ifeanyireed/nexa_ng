"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Network,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Plus,
  Compass,
  Star,
  Check,
  X,
  FileCheck2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceRequest, DeploymentAllocation } from "@/lib/workforce-types";

export default function WorkforcePlanningDeploymentPage() {
  const {
    workforceRequests,
    deployments,
    people,
    deployPerson,
  } = useWorkforceManager();

  const [searchSkill, setSearchSkill] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WorkforceRequest | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Deploy allocation form state
  const [deployPersonName, setDeployPersonName] = useState("Kalu Nwosu");
  const [deployClient, setDeployClient] = useState("First Zenith Financial");
  const [deployContract, setDeployContract] = useState("Tier-1 Network & Infrastructure Support");
  const [deployBilling, setDeployBilling] = useState(650000);
  const [deployCost, setDeployCost] = useState(250000);
  const [deployPercent, setDeployPercent] = useState(100);

  // Available staff matching search
  const availableStaff = people.filter((p) => {
    const isAvailable = p.status === "active";
    const matchesSkill =
      !searchSkill ||
      p.skills.some((s) => s.name.toLowerCase().includes(searchSkill.toLowerCase())) ||
      p.designation.toLowerCase().includes(searchSkill.toLowerCase());
    return isAvailable && matchesSkill;
  });

  const handleExecuteDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.name === deployPersonName);
    if (!person) return;

    const allocation: DeploymentAllocation = {
      id: `dep-${Date.now()}`,
      personId: person.id,
      personName: person.name,
      role: person.designation,
      clientName: deployClient,
      contractTitle: deployContract,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2028-04-30",
      allocationPercent: deployPercent,
      status: "active",
      billingRateMonthly: deployBilling,
      costRateMonthly: deployCost,
    };

    deployPerson(allocation);
    setIsDeployModalOpen(false);
  };

  return (
    <ErpAdminShell
      title="Workforce Planning & Deployment"
      subtitle="Module 07 · Skills-based candidate matching, staffing request fulfillment, and client contract allocation."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsDeployModalOpen(true)}
        >
          <Network className="w-4 h-4" />
          Deploy Personnel
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* TOP METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Deployments</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{deployments.length} Specialists</p>
            <p className="text-xs text-cyan-400 mt-1 font-medium">Delivering client contracts</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Workforce Requests</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{workforceRequests.length} Requisitions</p>
            <p className="text-xs text-nexa-text-secondary mt-1">From corporate B2B clients</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Available on Bench</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {people.filter((p) => p.status === "active").length} Ready
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Qualified for immediate allocation</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Monthly Deployment Margin</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{(
                deployments.reduce((sum, d) => sum + (d.billingRateMonthly - d.costRateMonthly), 0)
              ).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">53.4% Gross Profitability</p>
          </div>
        </section>

        {/* WORKFORCE REQUESTS (CLIENT STAFFING NEEDS) */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-500" />
                Client Staffing Requests (Outsourcing)
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Incoming demand from B2B partners requiring certified and trained technical personnel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workforceRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 bg-nexa-surface/70 rounded-xl border border-nexa-border hover:border-cyan-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-nexa-text-primary">{req.clientName}</span>
                  <NexaBadge
                    variant={req.status === "fulfilled" ? "primary" : "secondary"}
                    className="capitalize text-[10px]"
                  >
                    {req.status.replace(/_/g, " ")}
                  </NexaBadge>
                </div>

                <p className="text-xs font-medium text-cyan-300">{req.contractTitle}</p>

                <div className="flex items-center justify-between text-xs py-2 border-y border-nexa-border/60">
                  <span className="text-nexa-text-secondary">Headcount:</span>
                  <span className="font-semibold text-nexa-text-primary">
                    {req.fulfilledHeadcount} / {req.requiredHeadcount} Deployed
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-nexa-text-secondary">Required Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {req.requiredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-nexa-text-secondary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-nexa-text-secondary flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-nexa-text-secondary" /> {req.location}
                  </span>
                  <NexaButton
                    size="sm"
                    variant="secondary"
                    className="text-xs py-1 px-2.5 text-cyan-400 gap-1"
                    onClick={() => {
                      setDeployClient(req.clientName);
                      setDeployContract(req.contractTitle);
                      setIsDeployModalOpen(true);
                    }}
                  >
                    Match & Allocate &rarr;
                  </NexaButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS-BASED TALENT SEARCH ENGINE */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                Skills-Based Workforce Search Engine
              </h3>
              <p className="text-xs text-nexa-text-secondary">
                Search available bench personnel by certifications, technical competencies, and location.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-nexa-text-secondary" />
              <input
                type="text"
                placeholder="Search e.g. Cisco CCNA, PostgreSQL, CAC..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableStaff.map((person) => (
              <div
                key={person.id}
                className="p-4 bg-nexa-surface/60 rounded-xl border border-nexa-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-nexa-text-primary">{person.name}</h4>
                  <NexaBadge variant="secondary" className="uppercase font-mono text-[9px]">
                    {person.role}
                  </NexaBadge>
                </div>

                <p className="text-xs text-nexa-text-secondary">{person.designation}</p>

                <div className="flex flex-wrap gap-1">
                  {person.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" /> {s.name}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                  <span className="text-nexa-text-secondary">{person.location}</span>
                  <NexaButton
                    size="sm"
                    variant="primary"
                    className="text-xs py-1 px-2.5"
                    onClick={() => {
                      setDeployPersonName(person.name);
                      setIsDeployModalOpen(true);
                    }}
                  >
                    Deploy to Client
                  </NexaButton>
                </div>
              </div>
            ))}

            {availableStaff.length === 0 && (
              <div className="col-span-3 p-6 text-center text-xs text-nexa-text-secondary border border-dashed border-nexa-border rounded-xl">
                No bench personnel found matching &ldquo;{searchSkill}&rdquo;.
              </div>
            )}
          </div>
        </section>

        {/* ACTIVE DEPLOYMENTS TABLE */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-nexa-text-primary">Current Active Deployments</h3>
              <p className="text-xs text-nexa-text-secondary">
                Track client assignments, allocation percentages, monthly billing rates, and direct labor costs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                <tr>
                  <th className="py-3 px-4">Specialist</th>
                  <th className="py-3 px-4">Client Account</th>
                  <th className="py-3 px-4">Contract Title</th>
                  <th className="py-3 px-4">Allocation</th>
                  <th className="py-3 px-4">Monthly Billed</th>
                  <th className="py-3 px-4">Labor Cost</th>
                  <th className="py-3 px-4 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border/60">
                {deployments.map((dep) => {
                  const margin = dep.billingRateMonthly - dep.costRateMonthly;
                  const marginPct = Math.round((margin / dep.billingRateMonthly) * 100);
                  return (
                    <tr key={dep.id} className="hover:bg-nexa-surface/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-nexa-text-primary">{dep.personName}</div>
                        <div className="text-[11px] text-nexa-text-secondary">{dep.role}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-nexa-text-primary">{dep.clientName}</td>
                      <td className="py-3.5 px-4 text-nexa-text-secondary">{dep.contractTitle}</td>
                      <td className="py-3.5 px-4 font-mono">{dep.allocationPercent}% Full-Time</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ₦{dep.billingRateMonthly.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">
                        ₦{dep.costRateMonthly.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        +{marginPct}% (₦{margin.toLocaleString()})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* DEPLOY PERSONNEL MODAL */}
        {isDeployModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Deploy Personnel to Client</h3>
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteDeployment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Select Candidate from Bench</label>
                  <select
                    value={deployPersonName}
                    onChange={(e) => setDeployPersonName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.role} · {p.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Client Organisation</label>
                  <input
                    type="text"
                    required
                    value={deployClient}
                    onChange={(e) => setDeployClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Contract / Scope of Work</label>
                  <input
                    type="text"
                    required
                    value={deployContract}
                    onChange={(e) => setDeployContract(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Monthly Billing Rate (₦)</label>
                    <input
                      type="number"
                      value={deployBilling}
                      onChange={(e) => setDeployBilling(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Monthly Cost Rate (₦)</label>
                    <input
                      type="number"
                      value={deployCost}
                      onChange={(e) => setDeployCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsDeployModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Confirm & Deploy
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
