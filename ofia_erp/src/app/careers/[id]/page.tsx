"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CareersNav } from "../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { INITIAL_JOB_OPENINGS } from "@/lib/workforce-defaults";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Award,
  Send,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function JobApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : "";

  const { jobOpenings, submitApplication } = useWorkforceManager();

  // Find job from store or defaults
  const job =
    jobOpenings.find((j) => j.id.toLowerCase() === jobId.toLowerCase()) ||
    INITIAL_JOB_OPENINGS.find((j) => j.id.toLowerCase() === jobId.toLowerCase()) ||
    INITIAL_JOB_OPENINGS[0];

  // Intake Form Steps: 1 = Personal, 2 = Education, 3 = Skills & CV, 4 = Confirmed
  const [step, setStep] = useState(1);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationCity, setLocationCity] = useState("Lagos");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(job?.requiredSkills || []);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReferenceId, setGeneratedReferenceId] = useState("");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const refId = `cand-${Date.now().toString().slice(-6)}`;
      submitApplication({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        appliedRole: job.title,
        department: job.department,
        score: 0,
        experienceYears: Number(experienceYears),
        education: `${degree.trim() || "B.Sc."}, ${institution.trim() || "University"}`,
        skills: selectedSkills,
        resumeUrl: resumeUrl.trim() || portfolioUrl.trim(),
        interviewNotes: coverNote.trim(),
      });

      setGeneratedReferenceId(refId);
      setStep(4);
    } catch (err) {
      console.error("Failed to submit candidate application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <CareersNav />

      <main className="pt-28 pb-20 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
          {/* Back link */}
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Openings</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Role Overview Brief (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {job.department}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {job.stipendOrSalary}
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-snug">
                  {job.title}
                </h1>

                <div className="space-y-2 text-xs text-slate-600 font-semibold pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Location: <strong className="text-slate-800">{job.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Role Type: <strong className="text-slate-800 capitalize">{job.type} Track</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Openings: <strong className="text-slate-800">{job.openings - job.filled} Available</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Application Deadline: <strong className="text-rose-600">{job.closingDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Responsibilities & Description */}
              <div className="pt-4 border-t border-gray-100 space-y-3 text-xs leading-relaxed text-slate-600">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  About This Programme
                </h4>
                <p>
                  As part of the <strong>Ofia Enterprise WorkforceOS</strong> network, this requisition develops candidates through our hands-on Talent Academy before deploying them to live operations and client accounts.
                </p>

                <h5 className="font-extrabold text-slate-800 pt-2">Key Focus Areas:</h5>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Complete 8-week structured curriculum with senior technical mentorship.</li>
                  <li>Submit practical deliverable assignments for evaluation and quality scoring.</li>
                  <li>Achieve verified competency certifications across core tools and frameworks.</li>
                  <li>Deploy to active enterprise contracts with structured SLA governance.</li>
                </ul>

                <h5 className="font-extrabold text-slate-800 pt-2">What We Offer:</h5>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Guaranteed monthly remuneration ({job.stipendOrSalary}) disbursed on schedule.</li>
                  <li>Data and transit allowance for verified cohort training sessions.</li>
                  <li>Automatic conversion into permanent person records upon offer acceptance.</li>
                  <li>Verifiable digital credentials recognized across the Ofia partner network.</li>
                </ul>
              </div>

              {/* Skills required */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Target Competencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Multi-Step Application Intake Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              {step < 4 ? (
                <>
                  {/* Stepper Indicator */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                        Step {step} of 3
                      </span>
                      <h3 className="text-base font-black text-slate-800 mt-0.5">
                        {step === 1 && "Personal Credentials & Contact"}
                        {step === 2 && "Education & Background"}
                        {step === 3 && "Competency Ratings & Portfolio"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`w-7 h-2 rounded-full transition-all ${
                            step >= s ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={step === 3 ? handleSubmitApplication : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-5">
                    {/* STEP 1: Personal */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Full Legal Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Emeka Okonkwo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Email Address <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="name@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Phone Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="+234 803 000 0000"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              City & State of Residence <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Lagos, Abuja, Port Harcourt"
                              value={locationCity}
                              onChange={(e) => setLocationCity(e.target.value)}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              LinkedIn or Portfolio Link
                            </label>
                            <input
                              type="url"
                              placeholder="https://linkedin.com/in/... or github.com"
                              value={portfolioUrl}
                              onChange={(e) => setPortfolioUrl(e.target.value)}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="submit"
                            disabled={!fullName.trim() || !email.trim() || !phone.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                          >
                            <span>Continue to Education</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Education & Background */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tertiary Institution Attended <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. University of Lagos, Covenant University, YabaTech"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Degree / Field of Study <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. B.Sc. Computer Science"
                              value={degree}
                              onChange={(e) => setDegree(e.target.value)}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Years of Relevant Experience
                            </label>
                            <select
                              value={experienceYears}
                              onChange={(e) => setExperienceYears(Number(e.target.value))}
                              className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none font-semibold text-slate-700 cursor-pointer"
                            >
                              <option value={0}>0 Years (Fresh Graduate / Intern)</option>
                              <option value={1}>1 Year</option>
                              <option value={2}>2 Years</option>
                              <option value={3}>3 - 5 Years</option>
                              <option value={5}>5+ Years</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={!institution.trim() || !degree.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                          >
                            <span>Continue to Skills & CV</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Skills, CV & Submission */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Confirm Your Relevant Competencies (Click to toggle)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((s) => {
                              const isChecked = selectedSkills.includes(s);
                              return (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => toggleSkill(s)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isChecked
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5" />}
                                  <span>{s}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Resume / CV Document URL <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://drive.google.com/... or DropBox / PDF link"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                            className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Ensure link permissions are set to public view so reviewers can inspect your CV.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Brief Introduction / Cover Statement
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Why are you a fit for this track and what do you hope to accomplish in the academy?"
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                            className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>

                        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Submitting creates an application reference ID and queues you for pre-screening assessment testing.
                          </span>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !resumeUrl.trim()}
                            className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? "Transmitting Application..." : "Submit Application Now"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                /* STEP 4: Success & Reference Card */
                <div className="text-center space-y-6 py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Application Received Successfully
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Welcome, {fullName}!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Your application for <strong>{job.title}</strong> has been registered in the WorkforceOS recruitment engine.
                    </p>
                  </div>

                  {/* Reference ID card */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-sm mx-auto text-center space-y-1 font-mono">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Application Reference ID
                    </span>
                    <span className="text-lg font-black text-blue-700 tracking-wider">
                      {generatedReferenceId || "APP-2027-8912"}
                    </span>
                    <p className="text-[10px] text-slate-400 font-sans mt-1">
                      Save this code to check your recruitment stage and access tests.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/careers/assessment?candidateId=${generatedReferenceId}&email=${encodeURIComponent(email)}`}
                      className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Take Assessment Test Now</span>
                    </Link>
                    <Link
                      href={`/careers/status?ref=${generatedReferenceId}&email=${encodeURIComponent(email)}`}
                      className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Track Application Progress</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
