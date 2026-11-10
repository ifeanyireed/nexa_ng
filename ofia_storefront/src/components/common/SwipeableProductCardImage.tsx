"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableProductCardImageProps {
  images: string[];
  title: string;
  href?: string;
  aspectRatioClass?: string;
  className?: string;
  badges?: React.ReactNode;
}

export default function SwipeableProductCardImage({
  images,
  title,
  href,
  aspectRatioClass = "aspect-[4/5]",
  className = "",
  badges,
}: SwipeableProductCardImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const isDraggingRef = useRef(false);

  // Normalize valid images
  const validImages = Array.isArray(images) && images.length > 0
    ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
    : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"];

  const hasMultiple = validImages.length > 1;
  const safeIndex = currentIndex >= 0 && currentIndex < validImages.length ? currentIndex : 0;

  const paginate = useCallback(
    (newDirection: number) => {
      if (!hasMultiple) return;
      setDirection(newDirection);
      setCurrentIndex((prev) => (prev + newDirection + validImages.length) % validImages.length);
    },
    [hasMultiple, validImages.length]
  );

  const goToIndex = useCallback(
    (idx: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (idx === safeIndex) return;
      setDirection(idx > safeIndex ? 1 : -1);
      setCurrentIndex(idx);
    },
    [safeIndex]
  );

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;
    const threshold = 35;

    if (swipePower < -4000 || info.offset.x < -threshold) {
      paginate(1);
    } else if (swipePower > 4000 || info.offset.x > threshold) {
      paginate(-1);
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0,
      opacity: 0,
    }),
  };

  const imageContent = (
    <div
      className={`relative ${aspectRatioClass} bg-stone-100 overflow-hidden select-none group/gallery ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      {/* Animated Image Viewport */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={safeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 360, damping: 32 },
            opacity: { duration: 0.2 },
          }}
          drag={hasMultiple ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`absolute inset-0 w-full h-full select-none ${
            hasMultiple ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          style={{ touchAction: "pan-y" }}
        >
          <img
            src={validImages[safeIndex]}
            alt={`${title} - view ${safeIndex + 1} of ${validImages.length}`}
            draggable={false}
            className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </AnimatePresence>

      {/* Badges Overlay */}
      {badges && (
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 pointer-events-none">
          {badges}
        </div>
      )}

      {/* Multi-image Count Indicator Badge */}
      {hasMultiple && (
        <div className="absolute top-3.5 right-3.5 z-20 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-sm pointer-events-none">
          <span>{safeIndex + 1}</span>
          <span className="text-white/60 mx-0.5">/</span>
          <span className="text-white/90">{validImages.length}</span>
        </div>
      )}

      {/* Navigation Arrow Controls (Visible on hover and tap-friendly) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              paginate(-1);
            }}
            aria-label="Previous image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              paginate(1);
            }}
            aria-label="Next image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultiple && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md pointer-events-auto">
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => goToIndex(idx, e)}
              aria-label={`Go to image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                safeIndex === idx
                  ? "w-4 bg-white shadow-xs"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleLinkClick} className="block relative overflow-hidden">
        {imageContent}
      </Link>
    );
  }

  return imageContent;
}
