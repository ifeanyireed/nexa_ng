"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    if (totalItems !== undefined && totalItems > 0) {
      return (
        <div className={`flex items-center justify-between pt-4 border-t border-[var(--nexa-border)] text-xs text-[var(--nexa-text-muted)] ${className}`}>
          <span>
            Showing <strong className="text-[var(--nexa-text-primary)] font-bold">1</strong> to{" "}
            <strong className="text-[var(--nexa-text-primary)] font-bold">{totalItems}</strong> of{" "}
            <strong className="text-[var(--nexa-text-primary)] font-bold">{totalItems}</strong> entries
          </span>
          <span className="font-semibold text-[var(--nexa-text-primary)]">Page 1 of 1</span>
        </div>
      );
    }
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems !== undefined ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--nexa-border)] text-xs ${className}`}>
      {totalItems !== undefined && (
        <span className="text-[var(--nexa-text-muted)]">
          Showing <strong className="text-[var(--nexa-text-primary)] font-bold">{totalItems > 0 ? startItem : 0}</strong> to{" "}
          <strong className="text-[var(--nexa-text-primary)] font-bold">{endItem}</strong> of{" "}
          <strong className="text-[var(--nexa-text-primary)] font-bold">{totalItems}</strong> entries
        </span>
      )}

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--nexa-bg-surface)] transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--nexa-bg-surface)] transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPageNumbers().map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === p
                  ? "bg-[#1A56DB] text-white shadow-sm font-black"
                  : "border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-[var(--nexa-text-muted)] font-mono select-none">
              {p}
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--nexa-bg-surface)] transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--nexa-bg-surface)] transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
