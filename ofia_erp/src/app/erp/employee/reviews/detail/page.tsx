import { Suspense } from "react";
import ReviewDetailClient from "./ReviewDetailClient";

export default function ReviewDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-bold">Loading self-appraisal dossier...</p>
      </div>
    }>
      <ReviewDetailClient />
    </Suspense>
  );
}

