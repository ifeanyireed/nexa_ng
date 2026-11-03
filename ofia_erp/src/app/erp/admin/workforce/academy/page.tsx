"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Filter,
  FileCheck2,
  Star,
  Plus,
  Play,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { AcademyCourse, PracticalAssignment } from "@/lib/workforce-types";

export default function TalentAcademyLmsPage() {
  const {
    courses,
    assignments,
    gradeAssignment,
    addCourse,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"courses" | "assignments" | "certifications">("courses");
  const [selectedAssignment, setSelectedAssignment] = useState<PracticalAssignment | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(90);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  // New course form
  const [newTitle, setNewTitle] = useState("");
  const [newTrack, setNewTrack] = useState("Technology");
  const [newCode, setNewCode] = useState("TECH-202");
  const [newModules, setNewModules] = useState(6);
  const [newInstructor, setNewInstructor] = useState("Ifeanyi Felix");

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    gradeAssignment(selectedAssignment.id, gradingScore, gradingFeedback || "Passed competency requirements.");
    setSelectedAssignment(null);
    setGradingFeedback("");
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const course: AcademyCourse = {
      id: `course-${Date.now()}`,
      title: newTitle,
      track: newTrack,
      code: newCode,
      modulesCount: newModules,
      durationWeeks: 6,
      enrolledLearners: 12,
      completionRate: 0,
      instructor: newInstructor,
      status: "active",
      competenciesGranted: ["Core Domain Knowledge", "Operational Verification"],
    };

    addCourse(course);
    setIsNewCourseModalOpen(false);
    setNewTitle("");
  };

  return (
    <ErpAdminShell
      title="Talent Academy & Competency LMS"
      subtitle="Module 03 · Cohort learning tracks, curriculum delivery, practical assignments, and verified competency certifications."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsNewCourseModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Course
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* TOP ACADEMY METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Cohorts</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">Cohort 2027-Alpha</p>
            <p className="text-xs text-purple-400 mt-1 font-medium">15 Interns & Trainees Enrolled</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Available Courses</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{courses.length} Programmes</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Across Tech, Ops & Compliance</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Practical Assignments</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{assignments.length} Submissions</p>
            <p className="text-xs text-emerald-400 mt-1">
              {assignments.filter((a) => a.status === "approved").length} Graded & Approved
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Average Completion Rate</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">87.5%</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High competency benchmark
            </p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "courses"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Library & Curriculum ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "assignments"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Practical Assignments & Grading ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab("certifications")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "certifications"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Award className="w-4 h-4" />
            Certifications & Verified Badges
          </button>
        </div>

        {/* TAB 1: COURSE LIBRARY */}
        {activeTab === "courses" && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 bg-nexa-surface rounded-xl border border-nexa-border hover:border-purple-500/50 transition-all space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {course.code} · {course.track}
                    </span>
                    <h3 className="text-base font-bold text-nexa-text-primary mt-2">{course.title}</h3>
                  </div>
                  <NexaBadge variant="secondary" className="capitalize text-[10px]">
                    {course.status}
                  </NexaBadge>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-nexa-border/60 text-xs">
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Duration</span>
                    <span className="font-semibold text-nexa-text-primary">{course.durationWeeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Curriculum</span>
                    <span className="font-semibold text-nexa-text-primary">{course.modulesCount} Modules</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Enrolled</span>
                    <span className="font-semibold text-nexa-text-primary">{course.enrolledLearners} Interns</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-nexa-text-secondary">
                    Competencies Granted
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {course.competenciesGranted.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-emerald-400 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" /> {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-nexa-text-secondary">Instructor: <strong className="text-nexa-text-primary">{course.instructor}</strong></span>
                  <span className="text-purple-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                    View Modules &rarr;
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TAB 2: PRACTICAL ASSIGNMENTS & GRADING */}
        {activeTab === "assignments" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Practical Learning Submissions</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Evaluate real-world tasks submitted by interns before clearing them for client deployment.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {assignments.map((asg) => (
                <div key={asg.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-nexa-text-primary">{asg.title}</h4>
                      <NexaBadge
                        variant={asg.status === "approved" ? "primary" : "secondary"}
                        className="text-[10px] uppercase font-mono py-0"
                      >
                        {asg.status.replace(/_/g, " ")}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-nexa-text-secondary">
                      Learner: <strong className="text-nexa-text-primary">{asg.assigneeName}</strong> ·{" "}
                      {asg.courseTitle}
                    </p>
                    {asg.feedback && (
                      <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-1">
                        Supervisor Feedback: &ldquo;{asg.feedback}&rdquo; (Score: {asg.score}%)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="text-nexa-text-secondary block">Deadline:</span>
                      <span className="font-mono text-nexa-text-primary">{asg.deadline}</span>
                    </div>
                    {asg.status !== "approved" && (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        className="text-xs py-1 px-3"
                        onClick={() => setSelectedAssignment(asg)}
                      >
                        Grade Deliverable
                      </NexaButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: CERTIFICATIONS */}
        {activeTab === "certifications" && (
          <section className="p-8 bg-nexa-surface border border-nexa-border rounded-xl text-center space-y-4">
            <Award className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-base font-bold text-nexa-text-primary">Competency-Based Verified Certificates</h3>
            <p className="text-xs text-nexa-text-secondary max-w-md mx-auto">
              Certifications are automatically granted upon practical assignment scoring &gt;= 80%. These verified credentials qualify personnel for deployment to client contracts.
            </p>
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verified Certificate</span>
                <h4 className="text-sm font-bold text-nexa-text-primary">PostgreSQL Database Engineering</h4>
                <p className="text-xs text-nexa-text-secondary">Awarded to: Kalu Nwosu · 95% Score</p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verified Certificate</span>
                <h4 className="text-sm font-bold text-nexa-text-primary">Cisco Enterprise Network Defense</h4>
                <p className="text-xs text-nexa-text-secondary">Awarded to: Zainab Al-Hassan · 94% Score</p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verified Certificate</span>
                <h4 className="text-sm font-bold text-nexa-text-primary">SCUML & CAC Corporate Compliance</h4>
                <p className="text-xs text-nexa-text-secondary">Awarded to: Folashade Ajayi · 87% Score</p>
              </div>
            </div>
          </section>
        )}

        {/* GRADE DELIVERABLE MODAL */}
        {selectedAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Grade Practical Deliverable</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGrade} className="space-y-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Learner</span>
                  <span className="font-bold text-nexa-text-primary">{selectedAssignment.assigneeName}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Assignment</span>
                  <span className="font-medium text-nexa-text-primary">{selectedAssignment.title}</span>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Score (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradingScore}
                    onChange={(e) => setGradingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Evaluator Feedback</label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Enter assessment notes and competency recommendation..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Approve & Issue Grade
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE COURSE MODAL */}
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Create Academy Course</h3>
                <button
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Cloud Architecture"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Track</label>
                    <select
                      value={newTrack}
                      onChange={(e) => setNewTrack(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations & IT">Operations & IT</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Course Code</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Modules Count</label>
                    <input
                      type="number"
                      value={newModules}
                      onChange={(e) => setNewModules(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Instructor</label>
                    <input
                      type="text"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewCourseModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Publish Course
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
