"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPhoneCall,
  IconVideo,
  IconVideoOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconCheck,
  IconBuildingHospital,
  IconChecks,
  IconCalendar,
  IconCamera,
  IconWifi,
  IconWifiOff,
  IconReportMedical,
  IconShieldCheck,
  IconClock,
  IconSearch,
  IconAlertCircle,
  IconInfoCircle,
  IconQrcode
} from "@tabler/icons-react";
import { AhnaraCard } from "./AhnaraCard";
import { AhnaraButton } from "./AhnaraButton";
import { useRouter } from "next/navigation";

interface PatientConsultWorkspaceProps {
  workspaceType: "mama" | "kids" | "seniors" | "girlie" | "lady";
}

export function PatientConsultWorkspace({ workspaceType }: PatientConsultWorkspaceProps) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("booking");

  // Config mapping for branding and specialist details
  const config = {
    mama: {
      accent: "#8BB436",
      accentSoft: "rgba(139, 180, 54, 0.1)",
      textAccent: "text-[#8BB436]",
      bgAccent: "bg-[#8BB436]",
      borderAccent: "border-[#8BB436]",
      badgeTitle: "Maternal Care (Mama)",
      specialistType: "Midwife / Obstetrician",
      specialists: [
        { name: "Nurse Tyra Reed", specialty: "Certified Midwife", fee: "$30.00", times: ["Today 2:30 PM", "Tomorrow 9:00 AM"], rating: "4.9", image: "/character1.jpg" },
        { name: "Dr. Ifeanyi Adenuga", specialty: "OB/GYN Consultant", fee: "$45.00", times: ["Today 4:00 PM", "Tomorrow 11:30 AM"], rating: "5.0", image: "/character3.jpg" }
      ],
      defaultSymptom: "Logged contractions - Gestation Week 38"
    },
    kids: {
      accent: "#0089C1",
      accentSoft: "rgba(0, 137, 193, 0.1)",
      textAccent: "text-[#0089C1]",
      bgAccent: "bg-[#0089C1]",
      borderAccent: "border-[#0089C1]",
      badgeTitle: "Pediatric Care (Kids)",
      specialistType: "Pediatrician",
      specialists: [
        { name: "Dr. Donald Kalu", specialty: "Pediatric Specialist", fee: "$40.00", times: ["Today 3:30 PM", "Tomorrow 10:00 AM"], rating: "4.8", image: "/character4.jpg" },
        { name: "Dr. Sarah Miller", specialty: "Neonatologist", fee: "$50.00", times: ["Tomorrow 1:00 PM", "Monday 9:30 AM"], rating: "4.9", image: "/character2.jpg" }
      ],
      defaultSymptom: "Infant fever spike checkup"
    },
    seniors: {
      accent: "#6366F1",
      accentSoft: "rgba(99, 102, 241, 0.1)",
      textAccent: "text-[#6366F1]",
      bgAccent: "bg-[#6366F1]",
      borderAccent: "border-[#6366F1]",
      badgeTitle: "Geriatric Care (Seniors)",
      specialistType: "Gerontologist / Care Manager",
      specialists: [
        { name: "Dr. Sarah Miller", specialty: "Geriatrician", fee: "$45.00", times: ["Today 2:00 PM", "Tomorrow 3:00 PM"], rating: "4.9", image: "/character2.jpg" },
        { name: "Care Manager Felix Ngozi", specialty: "Cognitive Care Advisor", fee: "$35.00", times: ["Today 5:00 PM", "Monday 11:00 AM"], rating: "4.7", image: "/character3.jpg" }
      ],
      defaultSymptom: "Geriatric safety & Heart-rate telemetry alert"
    },
    lady: {
      accent: "#E11D48",
      accentSoft: "rgba(225, 29, 72, 0.1)",
      textAccent: "text-[#E11D48]",
      bgAccent: "bg-[#E11D48]",
      borderAccent: "border-[#E11D48]",
      badgeTitle: "Lady Care (Lady)",
      specialistType: "Gynecologist",
      specialists: [
        { name: "Dr. Ifeanyi Adenuga", specialty: "Gynecologic Surgeon", fee: "$50.00", times: ["Today 4:30 PM", "Tomorrow 8:30 AM"], rating: "5.0", image: "/character3.jpg" },
        { name: "Nurse Tyra Reed", specialty: "Reproductive Health Nurse", fee: "$30.00", times: ["Tomorrow 11:00 AM"], rating: "4.9", image: "/character1.jpg" }
      ],
      defaultSymptom: "Routine reproductive screening follow-up"
    },
    girlie: {
      accent: "#E572A1",
      accentSoft: "rgba(229, 114, 161, 0.1)",
      textAccent: "text-[#E572A1]",
      bgAccent: "bg-[#E572A1]",
      borderAccent: "border-[#E572A1]",
      badgeTitle: "Adolescent Care (Girlie)",
      specialistType: "Teen Counselor / Clinician",
      specialists: [
        { name: "Counselor Clara Reed", specialty: "Adolescent Psychologist", fee: "$25.00", times: ["Today 3:00 PM", "Tomorrow 4:30 PM"], rating: "4.8", image: "/character1.jpg" },
        { name: "Dr. Sarah Miller", specialty: "Teen Wellness Pediatrician", fee: "$40.00", times: ["Tomorrow 10:30 AM"], rating: "4.9", image: "/character2.jpg" }
      ],
      defaultSymptom: "AI Coach Cramp Log escalation"
    }
  }[workspaceType];

  // Call States (CO.02)
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);
  const [signalWarning, setSignalWarning] = useState(true);

  // Referral states (CO.05)
  const [activeReferrals, setActiveReferrals] = useState([
    { id: "ref-1", department: config.specialistType, hospital: "Lagos General Hospital", code: "REF-89021", date: "Expires July 20, 2026", status: "Active Handoff" }
  ]);

  // Care Plan states (CO.06)
  const [careTasks, setCareTasks] = useState([
    { id: "t1", text: "Take prescribed vitamins daily", checked: true },
    { id: "t2", text: "Log vitals telemetry twice daily", checked: false },
    { id: "t3", text: "Perform 10 minutes light stretching", checked: false }
  ]);

  // Call Timer Effect
  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const formatSecs = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleToggleTask = (id: string) => {
    setCareTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const getAdherenceRate = () => {
    const completed = careTasks.filter(t => t.checked).length;
    return Math.round((completed / careTasks.length) * 100);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Telehealth Workspace</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-display mt-0.5">Consult Portal</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700">
            {config.badgeTitle}
          </span>
        </div>
      </div>

      {/* Tabs Menu bar */}
      <div className="flex items-center gap-1.5 p-1 bg-[#DDEEF3] rounded-2xl border border-slate-300/30 max-w-max">
        <button
          onClick={() => setActiveSubTab("booking")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase border-none cursor-pointer transition-all ${
            activeSubTab === "booking" ? "bg-[#1E293B] text-white shadow" : "text-slate-600 hover:text-slate-950 bg-transparent"
          }`}
        >
          <IconCalendar className="w-4 h-4" />
          Schedules (CO.07)
        </button>
        <button
          onClick={() => setActiveSubTab("call")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase border-none cursor-pointer transition-all ${
            activeSubTab === "call" ? "bg-[#1E293B] text-white shadow" : "text-slate-600 hover:text-slate-950 bg-transparent"
          }`}
        >
          <IconVideo className="w-4 h-4" />
          Video Room (CO.02)
        </button>
        <button
          onClick={() => setActiveSubTab("referrals")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase border-none cursor-pointer transition-all ${
            activeSubTab === "referrals" ? "bg-[#1E293B] text-white shadow" : "text-slate-600 hover:text-slate-950 bg-transparent"
          }`}
        >
          <IconBuildingHospital className="w-4 h-4" />
          Referrals (CO.05)
        </button>
        <button
          onClick={() => setActiveSubTab("careplan")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase border-none cursor-pointer transition-all ${
            activeSubTab === "careplan" ? "bg-[#1E293B] text-white shadow" : "text-slate-600 hover:text-slate-950 bg-transparent"
          }`}
        >
          <IconChecks className="w-4 h-4" />
          Care Plan (CO.06)
        </button>
      </div>

      {/* SUBTAB CONTENT FRAME */}
      <div className="w-full flex-1">
        
        {/* CO.07 Booking Tab */}
        {activeSubTab === "booking" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-6 flex flex-col gap-5">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Available Specialists</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Book virtual video consultations or physical clinic visits with active practitioners.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.specialists.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-150 bg-slate-50 flex flex-col justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" />
                        <div className="flex flex-col">
                          <h4 className="text-sm font-black text-slate-850">{doc.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.specialty}</span>
                          <span className="text-[10px] text-amber-500 font-black mt-0.5">★ {doc.rating} Rating</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/60 pt-3">
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Available Slots</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {doc.times.map((time, tIdx) => (
                            <span key={tIdx} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 font-mono text-[9px] font-bold rounded-lg shadow-xs">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-black text-slate-400">Consultation Fee</span>
                          <span className="text-xs font-black text-[#608216]">{doc.fee}</span>
                        </div>
                        <AhnaraButton
                          variant="primary"
                          onClick={() => alert(`Appointment with ${doc.name} booked. Pre-consultation intake checklist active.`)}
                          className="bg-slate-900 hover:bg-black text-[10px] font-bold uppercase py-1.5 px-3.5 rounded-lg border-none cursor-pointer text-white"
                        >
                          Book Session
                        </AhnaraButton>
                      </div>
                    </div>
                  ))}
                </div>
              </AhnaraCard>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-[#E6F5FA] border border-[#BCE1EE] p-5 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#0089C1] tracking-wider">Direct Triage Path</span>
                <p className="text-xs text-[#0089C1]/80 font-bold leading-relaxed">
                  Experiencing an urgent symptom? Bypass scheduling and submit a Direct Triage Intake to connect to active midwives/pediatricians in under 5 minutes.
                </p>
                <AhnaraButton
                  variant="outline"
                  onClick={() => alert("Redirecting to Emergency Triage intake form...")}
                  className="text-xs text-[#0089C1] border-sky-300 hover:bg-[#D8EEF6] font-bold py-2 rounded-xl"
                >
                  Initiate Urgent Triage
                </AhnaraButton>
              </AhnaraCard>
            </div>
          </div>
        )}

        {/* CO.02 Video Room Tab */}
        {activeSubTab === "call" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {!callActive ? (
                <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto rounded-3xl mt-2">
                  <div className="w-16 h-16 rounded-full bg-[#E6F5FA] flex items-center justify-center text-[#0089C1]">
                    <IconVideo className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-extrabold text-slate-800 text-lg">Instant Telehealth Video Consultation</h3>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto">
                      Launch a secure WebRTC tele-consultation. System will automatically test your local connection bandwidth prior to establishing connection.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-150 text-left w-full max-w-sm mt-2">
                    <span className="text-[8px] uppercase font-black text-slate-400 block">Triage Symptom Category</span>
                    <span className="text-xs font-bold text-slate-700">{config.defaultSymptom}</span>
                  </div>
                  <AhnaraButton
                    variant="primary"
                    onClick={() => setCallActive(true)}
                    className="bg-slate-900 text-white hover:bg-black text-xs font-bold py-2.5 px-6 rounded-xl border-none cursor-pointer mt-2"
                  >
                    Start Consult Call
                  </AhnaraButton>
                </AhnaraCard>
              ) : (
                <AhnaraCard variant="flat" className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden text-white">
                  
                  {/* Call Header */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Live Stream Call
                    </span>
                    <span className="text-xs font-mono bg-slate-850 px-2.5 py-1 rounded font-black text-[#D4F475] border border-slate-800">
                      {formatSecs(callDuration)}
                    </span>
                  </div>

                  {/* Signal warnings */}
                  {signalWarning && (
                    <div className="bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl text-[10px] font-bold text-amber-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconWifiOff className="w-3.5 h-3.5 animate-pulse" />
                        <span>Low-bandwidth rules active. Video stream resolution degraded to preserve connection.</span>
                      </div>
                      <button onClick={() => setSignalWarning(false)} className="text-amber-400 border-none bg-transparent font-black cursor-pointer">✕</button>
                    </div>
                  )}

                  {/* Call Frame */}
                  <div className="w-full h-80 bg-slate-850 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-700">
                    {camMuted ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <IconVideoOff className="w-10 h-10" />
                        <span className="text-xs font-bold uppercase">Camera Muted</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-slate-900 to-indigo-950">
                        <div className="w-16 h-16 rounded-full bg-[#1E293B] border-2 border-slate-500 flex items-center justify-center mb-3">
                          <span className="font-black text-slate-300">DR</span>
                        </div>
                        <h4 className="text-sm font-black">Connected Specialist</h4>
                        <span className="text-[10px] opacity-75 mt-0.5">Encrypted Medical Consult (CO.02)</span>
                      </div>
                    )}

                    {/* PIP (Patient camera preview) */}
                    <div className="absolute bottom-4 right-4 w-24 h-16 bg-slate-900 border border-slate-600 rounded-xl overflow-hidden shadow-lg z-20 flex flex-col items-center justify-center text-[8px] font-bold text-slate-400">
                      <span className="text-[#D4F475] font-black">Local Camera</span>
                      <span className="opacity-75">Self (Patient)</span>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    <button 
                      onClick={() => setMicMuted(!micMuted)}
                      className={`p-3 rounded-full border text-white transition-all cursor-pointer ${
                        micMuted ? "bg-red-500 border-red-500 hover:bg-red-600" : "bg-slate-800 border-slate-750 hover:bg-slate-700"
                      }`}
                    >
                      {micMuted ? <IconMicrophoneOff className="w-5 h-5" /> : <IconMicrophone className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => setCamMuted(!camMuted)}
                      className={`p-3 rounded-full border text-white transition-all cursor-pointer ${
                        camMuted ? "bg-red-500 border-red-500 hover:bg-red-655" : "bg-slate-800 border-slate-750 hover:bg-slate-700"
                      }`}
                    >
                      {camMuted ? <IconVideoOff className="w-5 h-5" /> : <IconVideo className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => alert("Clinical snapshot taken and stored in consult records.")}
                      className="p-3 bg-slate-800 border border-slate-750 hover:bg-slate-700 text-white rounded-full transition-all cursor-pointer"
                    >
                      <IconCamera className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCallActive(false)}
                      className="p-3.5 bg-red-600 hover:bg-red-700 border-none text-white rounded-full transition-all cursor-pointer shadow-lg"
                    >
                      <IconPhoneOff className="w-5 h-5" />
                    </button>
                  </div>
                </AhnaraCard>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-5 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Connection Diagnostics</span>
                <div className="flex items-center gap-1.5 p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
                  <IconWifi className="w-4 h-4 text-emerald-600" />
                  <span>Channel: WebRTC Secure Direct</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Ahnara compensates for latency dropouts by shifting dynamically to audio-only if ping exceeds 250ms.
                </p>
              </AhnaraCard>
            </div>
          </div>
        )}

        {/* CO.05 Specialist Referrals Tab */}
        {activeSubTab === "referrals" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Active Clinical Referrals</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">If your virtual assessment requires physical support, clinicians generate referral documents here.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {activeReferrals.map((ref, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-400 font-bold">{ref.code}</span>
                        <h4 className="font-black text-slate-800 text-sm">{ref.department} Referral</h4>
                        <p className="text-xs text-slate-500 font-medium">Physical Facility: {ref.hospital}</p>
                        <span className="text-[10px] text-slate-450 font-bold mt-1 block">{ref.date}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600" title="Check-in QR Code">
                          <IconQrcode className="w-10 h-10" />
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 text-[10px] font-black uppercase border border-orange-100">
                          {ref.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AhnaraCard>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-[#E8F3CE]/60 border border-[#CCD0A4] p-5 flex flex-col gap-3 text-left">
                <span className="text-[10px] font-black uppercase text-[#608216]">How to use referral barcodes</span>
                <p className="text-xs text-[#608216]/80 font-bold leading-relaxed">
                  Simply present the QR/Barcode on your screen to the reception desk of Lagos General Hospital. The registrar will scan your ticket to pull EMR profiles instantly.
                </p>
              </AhnaraCard>
            </div>
          </div>
        )}

        {/* CO.06 Care Plan Tab */}
        {activeSubTab === "careplan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Daily Follow-Up Tasks</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Checklist assigned by your clinician to coordinate recovery or pregnancy progress.</p>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  {careTasks.map((task) => (
                    <label 
                      key={task.id} 
                      className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={task.checked}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4.5 h-4.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mr-2"
                      />
                      <span className={`text-xs font-semibold ${task.checked ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
              </AhnaraCard>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <AhnaraCard variant="flat" className="bg-white border border-slate-200 p-5 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Adherence Summary</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black text-slate-800">{getAdherenceRate()}%</span>
                  <span className="text-xs font-bold text-slate-400">task compliance</span>
                </div>
                <div className="border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 leading-relaxed">
                  Adherence is shared with your midwife/doctor to monitor recovery.
                </div>
              </AhnaraCard>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
