"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface SwipeToggleProps {
  label?: string;
  href: string;
  className?: string;
}

export default function SwipeToggle({
  label = "View All",
  href,
  className = "",
}: SwipeToggleProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState<number>(130);
  const [isSwiped, setIsSwiped] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const controls = useAnimation();

  // Measure exact track and thumb widths to calculate maximum swipe travel distance
  useEffect(() => {
    const calculateBounds = () => {
      if (trackRef.current && thumbRef.current) {
        const trackW = trackRef.current.clientWidth;
        const thumbW = thumbRef.current.clientWidth;
        const travel = Math.max(trackW - thumbW, 40);
        setMaxDrag(travel);
      }
    };

    calculateBounds();
    window.addEventListener("resize", calculateBounds);
    return () => window.removeEventListener("resize", calculateBounds);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setTimeout(() => setIsDragging(false), 80);
    // If dragged past 45% of the track or with positive velocity to the right
    if (info.offset.x > maxDrag * 0.45 || info.velocity.x > 200) {
      setIsSwiped(true);
      await controls.start({
        x: maxDrag,
        transition: { duration: 0.18, ease: "easeOut" },
      });
      router.push(href);
    } else {
      // Snap back if released prematurely
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 450, damping: 30 },
      });
    }
  };

  const handleClick = async () => {
    if (isDragging || isSwiped) return;
    setIsSwiped(true);
    // Smoothly animate the thumb across to the end on click
    await controls.start({
      x: maxDrag,
      transition: { duration: 0.22, ease: "easeInOut" },
    });
    router.push(href);
  };

  return (
    <div
      ref={trackRef}
      className={`relative w-full max-w-[220px] sm:max-w-[240px] h-9 sm:h-10 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-2xl border border-white/10 hover:border-white/20 shadow-xs p-0 flex items-center justify-between select-none overflow-hidden transition-all cursor-pointer group ${className}`}
      onClick={handleClick}
      title="Swipe or click to view all"
    >
      {/* Draggable 'View All' Pill Thumb - Same reduced height as background track (h-full) */}
      <motion.div
        ref={thumbRef}
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.08}
        animate={controls}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className="relative z-20 h-full px-5 sm:px-6 rounded-full bg-white text-zinc-900 font-medium text-xs shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/95 transition-colors shrink-0"
      >
        <span>{label}</span>
      </motion.div>

      {/* Target Arrow on Right of Track */}
      <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white pr-2.5 sm:pr-3 shrink-0 pointer-events-none group-hover:translate-x-0.5 transition-transform">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
