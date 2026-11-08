"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  ExternalLink,
  Plus,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  CourseModule,
  CourseModuleLesson,
  CourseEnrollment,
} from "@/lib/workforce-types";

export default function CourseClassroomPage() {
  const params = useParams();
  const courseId = typeof params?.courseId === "string" ? params.courseId : "";

  const {
    courses,
    courseModules,
    courseEnrollments,
    people,
    createCourseModule,
    enrollLearner,
    updateLessonProgress,
    isLoaded,
  } = useWorkforceManager();

  const course = courses.find(
    (c) => c.id === courseId || c.code.toLowerCase() === courseId.toLowerCase()
  );

  const modules = courseModules
    .filter((m) => m.courseId === course?.id || m.courseId === courseId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const enrollments = courseEnrollments.filter(
    (e) => e.courseId === course?.id || e.courseId === courseId
  );

  // Expanded modules state
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  );

  // Active quiz state: { moduleId, answers: Record<questionId, number>, submitted: boolean }
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Add Module Modal
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [modTitle, setModTitle] = useState("");
  const [modSummary, setModSummary] = useState("");
  const [modDurationHours, setModDurationHours] = useState(4);
  const [modLessonTitle, setModLessonTitle] = useState("");
  const [modLessonContent, setModLessonContent] = useState("");

  // Quick enroll modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState("");

  const toggleModule = (id: string) => {
    setExpandedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleLessonToggle = (enrollmentId: string, lessonId: string, currentlyCompleted: boolean) => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    updateLessonProgress(enrollmentId, lessonId, !currentlyCompleted, totalLessons || 5);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !modTitle) return;

    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId: course.id,
      title: modTitle,
      orderIndex: modules.length + 1,
      durationHours: modDurationHours,
      summary: modSummary,
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: modLessonTitle || "Introduction to Module Requirements",
          durationMinutes: 45,
          content: modLessonContent || "Detailed instructional overview and operational guidelines.",
        },
      ],
    };

    createCourseModule(newMod);
    setIsAddModuleModalOpen(false);
    setModTitle("");
    setModSummary("");
    setModLessonTitle("");
    setModLessonContent("");
    setExpandedModuleIds((prev) => [...prev, newMod.id]);
  };

  const handleEnrollStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !selectedPersonId) return;

    const person = people.find((p) => p.id === selectedPersonId);
    if (!person) return;

    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      courseId: course.id,
      personId: person.id,
      personName: person.name,
      progressPercentage: 0,
      completedLessons: [],
      status: "enrolled",
      enrolledAt: new Date().toISOString(),
    };

    enrollLearner(newEnrollment);
    setIsEnrollModalOpen(false);
    setSelectedPersonId("");
  };

  if (!isLoaded) {
    return (
      <ErpAdminShell title="Loading Course..." activeModule="workforce">
        <div className="p-12 text-center text-xs text-nexa-text-secondary">
          Synchronizing curriculum database...
        </div>
      </ErpAdminShell>
    );
  }

  if (!course) {
    return (
      <ErpAdminShell title="Course Not Found" activeModule="workforce">
        <div className="p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-nexa-text-secondary mx-auto opacity-40" />
          <h2 className="text-lg font-bold text-nexa-text-primary">Programme Not Found</h2>
          <p className="text-xs text-nexa-text-secondary max-w-sm mx-auto">
            The requested academy curriculum &ldquo;{courseId}&rdquo; does not exist or has been archived.
          </p>
          <Link href="/erp/admin/workforce/academy">
            <NexaButton size="sm" variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Academy
            </NexaButton>
          </Link>
        </div>
      </ErpAdminShell>
    );
  }

  // Active learner context (default to first enrolled learner or empty)
  const activeLearner = enrollments[0];

  return (
    <ErpAdminShell
      title={course.title}
      subtitle={`Curriculum & Modular Syllabus · ${course.code} · Track: ${course.track}`}
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/workforce/academy">
            <NexaButton size="sm" variant="secondary" className="gap-1.5 text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Academy
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-1.5 text-xs"
            onClick={() => setIsAddModuleModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Module
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* COURSE BANNER & KEY HIGHLIGHTS */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                  {course.code}
                </span>
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-nexa-border/40 text-nexa-text-secondary">
                  {course.track}
                </span>
                <NexaBadge variant="secondary" className="capitalize text-[10px]">
                  {course.status}
                </NexaBadge>
              </div>
              <h1 className="text-xl font-bold text-nexa-text-primary">{course.title}</h1>
              <p className="text-xs text-nexa-text-secondary">
                Instructor: <strong className="text-nexa-text-primary">{course.instructor}</strong> · Standard Delivery: {course.durationWeeks} Weeks
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NexaButton
                size="sm"
                variant="secondary"
                className="text-xs gap-1.5"
                onClick={() => setIsEnrollModalOpen(true)}
              >
                <Users className="w-4 h-4 text-purple-400" />
                Enroll Personnel
              </NexaButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-nexa-border/60 text-xs">
            <div>
              <span className="text-nexa-text-secondary text-[10px] block">Syllabus Modules</span>
              <span className="font-bold text-nexa-text-primary text-sm">{modules.length} Modules</span>
            </div>
            <div>
              <span className="text-nexa-text-secondary text-[10px] block">Total Lessons</span>
              <span className="font-bold text-nexa-text-primary text-sm">
                {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Units
              </span>
            </div>
            <div>
              <span className="text-nexa-text-secondary text-[10px] block">Active Enrollments</span>
              <span className="font-bold text-purple-400 text-sm">{enrollments.length} Learners</span>
            </div>
            <div>
              <span className="text-nexa-text-secondary text-[10px] block">Target Competencies</span>
              <span className="font-bold text-emerald-400 text-sm">{course.competenciesGranted.length} Certified</span>
            </div>
          </div>
        </section>

        {/* MAIN LAYOUT: CURRICULUM SYLLABUS + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: MODULAR SYLLABUS & LESSON VIEWER */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Modular Curriculum & Syllabus Breakdown
              </h2>
              <span className="text-xs text-nexa-text-secondary">
                {modules.length} Modules · Order sequence
              </span>
            </div>

            {modules.length === 0 ? (
              <div className="p-8 bg-nexa-surface border border-nexa-border rounded-xl text-center space-y-3">
                <p className="text-xs text-nexa-text-secondary">
                  No syllabus modules have been published for this course yet.
                </p>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAddModuleModalOpen(true)}
                  className="text-xs gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Initial Module
                </NexaButton>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((mod) => {
                  const isExpanded = expandedModuleIds.includes(mod.id);

                  return (
                    <div
                      key={mod.id}
                      className="bg-nexa-surface border border-nexa-border rounded-xl overflow-hidden shadow-sm transition-all"
                    >
                      {/* Module Header Bar */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-nexa-border/10 transition-colors border-b border-transparent data-[open=true]:border-nexa-border"
                        data-open={isExpanded}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                            0{mod.orderIndex}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-nexa-text-primary">{mod.title}</h3>
                            <p className="text-xs text-nexa-text-secondary line-clamp-1">{mod.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-nexa-text-secondary flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {mod.durationHours} hrs
                          </span>
                          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {mod.lessons.length} Lessons
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-nexa-text-secondary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-nexa-text-secondary" />
                          )}
                        </div>
                      </button>

                      {/* Module Content & Lessons */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-nexa-surface/40">
                          <p className="text-xs text-nexa-text-secondary leading-relaxed bg-nexa-surface p-3 rounded-lg border border-nexa-border/60">
                            {mod.summary}
                          </p>

                          {/* Lessons List */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-semibold uppercase text-nexa-text-secondary tracking-wider">
                              Lessons & Practical Units
                            </span>

                            {mod.lessons.map((lesson) => {
                              const isCompleted = activeLearner?.completedLessons?.includes(lesson.id) ?? false;

                              return (
                                <div
                                  key={lesson.id}
                                  className="p-3.5 bg-nexa-surface border border-nexa-border rounded-lg space-y-2 hover:border-purple-500/40 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-nexa-text-primary flex items-center gap-1.5">
                                          <Play className="w-3 h-3 text-purple-400" />
                                          {lesson.title}
                                        </h4>
                                        <span className="text-[10px] text-nexa-text-secondary font-mono flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {lesson.durationMinutes}m
                                        </span>
                                      </div>
                                      <p className="text-xs text-nexa-text-secondary leading-relaxed pl-4.5">
                                        {lesson.content}
                                      </p>
                                    </div>

                                    {activeLearner && (
                                      <button
                                        onClick={() => handleLessonToggle(activeLearner.id, lesson.id, isCompleted)}
                                        className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
                                          isCompleted
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-nexa-surface text-nexa-text-secondary border-nexa-border hover:border-purple-500/40"
                                        }`}
                                      >
                                        <Check className="w-3 h-3" />
                                        {isCompleted ? "Completed" : "Mark Done"}
                                      </button>
                                    )}
                                  </div>

                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <div className="pt-2 border-t border-nexa-border/40 flex flex-wrap gap-2 text-[11px]">
                                      <span className="text-nexa-text-secondary">Resources:</span>
                                      {lesson.resources.map((res, rIdx) => (
                                        <a
                                          key={rIdx}
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline underline-offset-2"
                                        >
                                          {res.title} <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Module Quiz Runner */}
                          {mod.quiz && mod.quiz.questions && mod.quiz.questions.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="w-4 h-4 text-purple-400" />
                                  <h4 className="text-xs font-bold text-nexa-text-primary">
                                    Module Assessment Quiz ({mod.quiz.questions.length} Questions · Pass Benchmark: {mod.quiz.passPercentage}%)
                                  </h4>
                                </div>
                                <NexaButton
                                  size="sm"
                                  variant="secondary"
                                  className="text-[10px] py-0.5 px-2"
                                  onClick={() => {
                                    setActiveQuizModuleId(activeQuizModuleId === mod.id ? null : mod.id);
                                    setQuizSubmitted(false);
                                  }}
                                >
                                  {activeQuizModuleId === mod.id ? "Hide Quiz" : "Take Quiz Simulator"}
                                </NexaButton>
                              </div>

                              {activeQuizModuleId === mod.id && (
                                <div className="space-y-4 pt-2">
                                  {mod.quiz.questions.map((q, qIdx) => {
                                    const selectedOpt = quizAnswers[q.id];
                                    const isCorrect = selectedOpt === q.correctOptionIndex;

                                    return (
                                      <div
                                        key={q.id}
                                        className="p-3 bg-nexa-surface border border-nexa-border rounded-lg space-y-2 text-xs"
                                      >
                                        <p className="font-semibold text-nexa-text-primary">
                                          {qIdx + 1}. {q.question}
                                        </p>
                                        <div className="space-y-1.5 pl-2">
                                          {q.options.map((opt, optIdx) => {
                                            const isOptionSelected = selectedOpt === optIdx;

                                            return (
                                              <label
                                                key={optIdx}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${
                                                  isOptionSelected
                                                    ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                                                    : "border-transparent hover:bg-nexa-border/20 text-nexa-text-secondary"
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`q_${q.id}`}
                                                  checked={isOptionSelected}
                                                  onChange={() =>
                                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                                  }
                                                  className="accent-purple-500"
                                                />
                                                <span>{opt}</span>
                                              </label>
                                            );
                                          })}
                                        </div>

                                        {quizSubmitted && (
                                          <div
                                            className={`p-2.5 rounded-lg border text-xs mt-2 ${
                                              isCorrect
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : "bg-red-500/10 border-red-500/20 text-red-400"
                                            }`}
                                          >
                                            <p className="font-bold">
                                              {isCorrect ? "Correct!" : "Incorrect."}
                                            </p>
                                            <p className="text-[11px] mt-0.5">{q.explanation}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  <div className="flex justify-end pt-2">
                                    <NexaButton
                                      size="sm"
                                      variant="primary"
                                      onClick={() => setQuizSubmitted(true)}
                                      className="text-xs"
                                    >
                                      Submit Quiz Answers
                                    </NexaButton>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT 1 COL: ENROLLED LEARNERS & COMPETENCIES */}
          <div className="space-y-6">
            {/* ENROLLED LEARNERS CARD */}
            <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    Enrolled Personnel ({enrollments.length})
                  </h3>
                  <p className="text-[11px] text-nexa-text-secondary">
                    Active learners progressing through syllabus
                  </p>
                </div>
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="p-1 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                  title="Enroll staff member"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {enrollments.length === 0 ? (
                <div className="py-6 text-center text-xs text-nexa-text-secondary border border-dashed border-nexa-border rounded-lg">
                  No staff members enrolled yet.
                </div>
              ) : (
                <div className="divide-y divide-nexa-border/60">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="py-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-nexa-text-primary">{enr.personName}</span>
                        <NexaBadge
                          variant={enr.status === "completed" ? "primary" : "secondary"}
                          className="text-[10px] capitalize"
                        >
                          {enr.status.replace("_", " ")}
                        </NexaBadge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-nexa-text-secondary">
                          <span>Syllabus Progress</span>
                          <span className="font-mono font-bold text-nexa-text-primary">
                            {enr.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-nexa-border/60 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              enr.progressPercentage === 100
                                ? "bg-emerald-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${enr.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMPETENCIES AWARDED CARD */}
            <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Accredited Competencies
              </h3>
              <p className="text-[11px] text-nexa-text-secondary">
                Learners mastering this programme qualify for these verified capabilities on their dossier:
              </p>
              <div className="space-y-1.5 pt-1">
                {course.competenciesGranted.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span className="font-medium">{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ADD MODULE MODAL */}
        {isAddModuleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Add Syllabus Module</h3>
                <button
                  onClick={() => setIsAddModuleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Module Title</label>
                  <input
                    type="text"
                    required
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus & Raft Protocols"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Estimated Duration (Hours)</label>
                    <input
                      type="number"
                      value={modDurationHours}
                      onChange={(e) => setModDurationHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Module Index</label>
                    <input
                      type="text"
                      disabled
                      value={`Module 0${modules.length + 1}`}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-border/30 border border-nexa-border text-nexa-text-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Summary & Outcomes</label>
                  <textarea
                    rows={2}
                    value={modSummary}
                    onChange={(e) => setModSummary(e.target.value)}
                    placeholder="Brief description of skills covered in this module..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-nexa-border/60">
                  <span className="text-[11px] font-bold text-nexa-text-primary block mb-2">
                    Initial Lesson in Module
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={modLessonTitle}
                      onChange={(e) => setModLessonTitle(e.target.value)}
                      placeholder="Lesson Title (e.g. Leader Election & Heartbeats)"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      value={modLessonContent}
                      onChange={(e) => setModLessonContent(e.target.value)}
                      placeholder="Lesson syllabus content and operational guidelines..."
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAddModuleModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Publish Module
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK ENROLL MODAL */}
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Enroll Personnel in Course</h3>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEnrollStaff} className="space-y-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Programme</span>
                  <span className="font-bold text-purple-400">{course.title}</span>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Select Candidate / Staff</label>
                  <select
                    required
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Choose person --</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role.toUpperCase()} · {p.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEnrollModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Confirm Enrollment
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
