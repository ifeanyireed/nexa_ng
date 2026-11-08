"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CareersNav } from "./CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { JobOpening } from "@/lib/workforce-types";
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";

export default function CareersPage() {
  const { jobOpenings } = useWorkforceManager();

  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const departments = ["ALL", "Technology", "Customer Success", "Compliance Hub", "Operations"];
  const roleTypes = [
    { id: "ALL", label: "All Roles" },
    { id: "intern", label: "Graduate Internship" },
    { id: "employee", label: "Full-Time Staff" },
    { id: "contractor", label: "Specialist Contractor" },
  ];
  const locations = ["ALL", "Lagos", "Abuja", "Hybrid"];

  const filteredJobs = jobOpenings.filter((job) => {
    if (selectedDept !== "ALL" && job.department.toLowerCase() !== selectedDept.toLowerCase()) {
      return false;
    }
    if (selectedType !== "ALL" && job.type.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }
    if (selectedLocation !== "ALL" && !job.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(q);
      const matchesSkill = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchesTitle && !matchesSkill) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <CareersNav />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full border border-blue-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider">
                WorkforceOS Talent Operations • 2027 In-Take
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Develop Your Craft. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Deploy to Real Work.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              We connect recruitment, hands-on academy training, competency certification, and real client deployments. Join high-performing cohorts in engineering, customer success, compliance, and enterprise operations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#positions"
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>View Open Opportunities ({jobOpenings.length})</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/careers/status"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Track Existing Application</span>
              </Link>
            </div>
          </div>

          {/* 4 Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              {
                title: "Guaranteed Monthly Pay",
                desc: "Transparent stipends & salaries with on-time disbursements",
                icon: <Award className="w-5 h-5 text-emerald-600" />,
                bg: "bg-emerald-50 text-emerald-600",
              },
              {
                title: "Talent Academy / LMS",
                desc: "Intensive 8-week structured curriculum with senior mentorship",
                icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
                bg: "bg-indigo-50 text-indigo-600",
              },
              {
                title: "Direct Client Deployment",
                desc: "Transition from training directly into active project contracts",
                icon: <Briefcase className="w-5 h-5 text-blue-600" />,
                bg: "bg-blue-50 text-blue-600",
              },
              {
                title: "Competency Badges",
                desc: "Verifiable digital credentials that prove real capabilities",
                icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
                bg: "bg-purple-50 text-purple-600",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-2 hover:border-blue-200 transition-all"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${p.bg}`}>
                  {p.icon}
                </div>
                <h4 className="text-sm font-black text-slate-800">{p.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONS & OPPORTUNITIES DIRECTORY */}
      <section id="positions" className="py-20 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                Explore Positions
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                Open Opportunities & Requisitions
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Filter by department, role category, or search required skills
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
              Showing {filteredJobs.length} of {jobOpenings.length} Requisitions
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title or skills (e.g., TypeScript, Next.js, CRM, CCNA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="py-2.5 px-3.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none font-semibold text-slate-700 cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "ALL" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 shrink-0">
                Department:
              </span>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDept === dept
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {dept === "ALL" ? "All Departments" : dept}
                </button>
              ))}
            </div>

            {/* Role Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 shrink-0">
                Category:
              </span>
              {roleTypes.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedType === rt.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Openings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {job.department}
                      </span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {job.stipendOrSalary}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {job.openings - job.filled} Positions Remaining
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Closes {job.closingDate}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Required Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-50 text-slate-700 border border-slate-200/80 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      {job.type === "intern" ? "Paid Internship Track" : "Full-Time Placement"}
                    </span>
                    <Link
                      href={`/careers/${job.id}`}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Apply for Requisition</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-800">No Openings Match Your Filter</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your department or location filters to discover all available requisitions.
                </p>
                <button
                  onClick={() => {
                    setSelectedDept("ALL");
                    setSelectedType("ALL");
                    setSelectedLocation("ALL");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SELECTION WORKFLOW INFOGRAPHIC */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Clear & Objective
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              How Selection & Onboarding Works
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              We eliminate guesswork with structured assessment testing and competency-based evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Apply Online",
                desc: "Complete the 3-minute intake form and submit your portfolio or CV links.",
              },
              {
                step: "02",
                title: "Assessment Test",
                desc: "Take the pre-screening aptitude and technical assessment in our portal.",
              },
              {
                step: "03",
                title: "Structured Interview",
                desc: "Converse with our department leads on real-world problem scenarios.",
              },
              {
                step: "04",
                title: "Offer & Onboarding",
                desc: "Receive your offer letter and automatically create your workforce profile.",
              },
              {
                step: "05",
                title: "Academy & Deploy",
                desc: "Graduate from the 8-week academy directly into active client contracts.",
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-2 relative"
              >
                <span className="text-2xl font-black text-blue-600/30 block font-mono">
                  {st.step}
                </span>
                <h4 className="text-sm font-black text-slate-800">{st.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
              alt="Ofia"
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-slate-300">
              Ofia Enterprise Suite • WorkforceOS Platform
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/careers" className="hover:text-white transition-colors">
              Opportunities
            </Link>
            <Link href="/careers/status" className="hover:text-white transition-colors">
              Track Application
            </Link>
            <Link href="/careers/assessment" className="hover:text-white transition-colors">
              Assessment Centre
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Portal
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Ofia Technologies Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
