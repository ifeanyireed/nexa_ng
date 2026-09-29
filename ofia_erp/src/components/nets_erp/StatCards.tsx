"use client";

import React, { useState, useEffect } from "react";
import {
  IconClipboardCheck,
  IconStar,
  IconClock,
  IconUsers,
  IconChartBar,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useERPStore, User } from "@/lib/erp-store";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";

export default function StatCards() {
  const { reviews, users, cycles } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [finStats, setFinStats] = useState({
    revenue: 2420000,
    expenses: 760000,
    payables: 310000,
    receivables: 4250000,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);

        if (u.role === "accountant") {
          const financeApiUrl =
            process.env.NEXT_PUBLIC_FINANCE_API_URL || "https://nets-erp-m7iw.onrender.com";
          fetch(`${financeApiUrl}/stats`)
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error();
            })
            .then((data) => {
              setFinStats({
                revenue: data.totalRevenue,
                expenses: data.totalExpenses,
                payables: data.pendingPayables,
                receivables: data.outstandingInvoice,
              });
            })
            .catch(() => {});
        }
      }
    }
  }, []);

  const activeCycle = cycles.find((c) => c.status === "Active");
  const activeCycleReviews = activeCycle
    ? reviews.filter((r) => r.cycleId === activeCycle.id)
    : reviews.filter((r) => r.cycleId === "CYC001");
  const totalEmployeesCount = users.filter((u) => u.role !== "admin").length;
  const totalEvaluations = activeCycleReviews.length;
  const cycleSubmittedCount = activeCycleReviews.filter((r) =>
    ["Submitted", "Manager Reviewed", "HR Approved"].includes(r.status)
  ).length;
  const globalCompletionRate =
    totalEvaluations > 0 ? Math.round((cycleSubmittedCount / totalEvaluations) * 100) : 0;

  const hrScoredReviews = activeCycleReviews.filter(
    (r) => r.finalScore !== undefined && r.finalScore !== null
  );
  const globalAvgScore =
    hrScoredReviews.length > 0
      ? (
          hrScoredReviews.reduce((sum, r) => sum + (r.finalScore || 0), 0) /
          hrScoredReviews.length
        ).toFixed(1)
      : "N/A";

  const reviewsAwaitingHrAudit = activeCycleReviews.filter(
    (r) => r.status === "Manager Reviewed"
  ).length;

  return (
    <ErpStatGrid
      stats={[
        {
          label: "Completion Rate",
          value: `${globalCompletionRate}%`,
          change: `${cycleSubmittedCount}/${totalEvaluations} Done`,
          sub: "Company evaluations completed",
          icon: <IconClipboardCheck className="w-5 h-5 text-blue-500" />,
          iconBg: "bg-blue-500/10 text-blue-500",
        },
        {
          label: "Average Score",
          value: `${globalAvgScore} / 10`,
          change: "Top 10% SLA",
          sub: "Performance average across staff",
          icon: <IconStar className="w-5 h-5 text-emerald-500" />,
          iconBg: "bg-emerald-500/10 text-emerald-500",
        },
        {
          label: "Pending Audits",
          value: `${reviewsAwaitingHrAudit} Reviews`,
          change: "Action Required",
          changeType: "warning",
          sub: "Awaiting HR final audit",
          icon: <IconClock className="w-5 h-5 text-amber-500" />,
          iconBg: "bg-amber-500/10 text-amber-500",
        },
        {
          label: "Active Staff",
          value: `${totalEmployeesCount} Staff`,
          change: "100% Enrolled",
          sub: "Active cycle participants",
          icon: <IconUsers className="w-5 h-5 text-purple-500" />,
          iconBg: "bg-purple-500/10 text-purple-500",
        },
      ]}
    />
  );
}
