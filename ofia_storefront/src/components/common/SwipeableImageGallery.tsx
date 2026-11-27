"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableImageGalleryProps {
  images: string[];
  title: string;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  aspectRatioClass?: string;
  thumbnailShapeClass?: string;
  activeThumbnailClass?: string;
  inactiveThumbnailClass?: string;
  badges?: React.ReactNode;
  className?: string;
  /**
   * When true, places the thumbnail carousel vertically on the LEFT of the product image on desktop (lg+),
   * reduces the desktop product image height, and on mobile makes the thumbnail carousel float & sticky
   * just above the bottom nav menu until the user scrolls below its original position (below the image frame).
   */
  desktopVerticalLeft?: boolean;
  desktopImageHeightClass?: string;
}

export default function SwipeableImageGallery({
  images,
  title,
  selectedIndex,
  onSelectIndex,
  aspectRatioClass = "aspect-[4/5]",
  thumbnailShapeClass = "w-20 h-24 rounded-2xl",
  activeThumbnailClass = "border-amber-700 shadow-md scale-105 ring-2 ring-amber-700/20",
  inactiveThumbnailClass = "border-transparent opacity-70 hover:opacity-100",
  badges,
  className = "",
  desktopVerticalLeft = false,
  desktopImageHeightClass = "lg:h-[520px] lg:aspect-auto",
}: SwipeableImageGalleryProps) {
  const [direction, setDirection] = useState<number>(0);
  const [isMobileFloating, setIsMobileFloating] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const desktopLeftThumbnailsRef = useRef<HTMLDivElement>(null);
  const mobileOriginalSlotRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef<boolean>(false);

  // Normalize images array to ensure at least one valid image
  const validImages =
    images && images.length > 0
      ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80"];

  const safeIndex = selectedIndex >= 0 && selectedIndex < validImages.length ? selectedIndex : 0;
  const hasMultiple = validImages.length > 1;

  // Keep product image frame top in view and NEVER auto-scroll the document window to the bottom of the image frame
  const ensureImageFrameTopInView = useCallback(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // If the top of the image frame has scrolled above the sticky store header, bring its top back into view
    if (rect.top < 76) {
      const targetY = Math.max(0, window.scrollY + rect.top - 84);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (!hasMultiple) return;
      setDirection(newDirection);
      const nextIdx = (safeIndex + newDirection + validImages.length) % validImages.length;
      onSelectIndex(nextIdx);
      ensureImageFrameTopInView();
    },
    [hasMultiple, safeIndex, validImages.length, onSelectIndex, ensureImageFrameTopInView]
  );

  const goToIndex = useCallback(
    (idx: number) => {
      if (idx === safeIndex) return;
      setDirection(idx > safeIndex ? 1 : -1);
      onSelectIndex(idx);
      ensureImageFrameTopInView();
    },
    [safeIndex, onSelectIndex, ensureImageFrameTopInView]
  );

  // Scroll only the internal thumbnail strip container (never call element.scrollIntoView which scrolls the page window to the bottom!)
  useEffect(() => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const activeEl = container.children[safeIndex] as HTMLElement | undefined;
      if (activeEl) {
        const targetLeft =
          activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      }
    }
    if (desktopLeftThumbnailsRef.current) {
      const container = desktopLeftThumbnailsRef.current;
      const activeEl = container.children[safeIndex] as HTMLElement | undefined;
      if (activeEl) {
        const targetTop =
          activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }
    }
    if (didMountRef.current) {
      ensureImageFrameTopInView();
    } else {
      didMountRef.current = true;
    }
  }, [safeIndex, ensureImageFrameTopInView]);

  // Mobile sticky floating carousel above bottom nav menu until user scrolls below its original position (below the product image frame)
  useEffect(() => {
    if (!desktopVerticalLeft || !hasMultiple || typeof window === "undefined") return;

    const handleScroll = () => {
      if (!mobileOriginalSlotRef.current) return;
      const slotRect = mobileOriginalSlotRef.current.getBoundingClientRect();
      // Float sticky just above the mobile bottom nav menu while viewing the product image area,
      // until the user scrolls below the area of its original position (below the product image frame).
      const hasScrolledBelowOriginalArea = slotRect.bottom < 88;
      setIsMobileFloating(!hasScrolledBelowOriginalArea);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [desktopVerticalLeft, hasMultiple]);

  // Framer Motion slide variants
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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;
    const threshold = 40;

    if (swipePower < -8000 || info.offset.x < -threshold) {
      paginate(1);
    } else if (swipePower > 8000 || info.offset.x > threshold) {
      paginate(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      paginate(-1);
    } else if (e.key === "ArrowRight") {
      paginate(1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={
          desktopVerticalLeft
            ? "flex flex-col lg:flex-row lg:items-start lg:gap-4"
            : "space-y-4"
        }
      >
        {/* Desktop Vertical Left Carousel Placeholder (only when desktopVerticalLeft is true) */}
        {desktopVerticalLeft && hasMultiple && (
          <div
            ref={desktopLeftThumbnailsRef}
            className={`hidden lg:flex lg:flex-col items-center gap-3 overflow-y-auto pr-1 scrollbar-none shrink-0 ${desktopImageHeightClass}`}
          >
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`Thumbnail ${idx + 1}`}
                className={`${thumbnailShapeClass} overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  safeIndex === idx ? activeThumbnailClass : inactiveThumbnailClass
                }`}
              >
                <img
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Swipeable Image Stage */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`${title} image gallery. Use arrow keys or swipe to navigate images.`}
          className={`relative ${aspectRatioClass} ${
            desktopVerticalLeft ? `flex-1 w-full ${desktopImageHeightClass}` : ""
          } bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/80 shadow-md select-none group focus:outline-hidden focus:ring-2 focus:ring-amber-600/30`}
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
                x: { type: "spring", stiffness: 340, damping: 32 },
                opacity: { duration: 0.2 },
              }}
              drag={hasMultiple ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
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
                className="w-full h-full object-cover object-top select-none pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Custom Badges */}
          {badges && <div className="absolute top-4 left-4 z-20 pointer-events-auto">{badges}</div>}

          {/* Counter Pill Badge */}
          {hasMultiple && (
            <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-xs font-semibold tracking-wider flex items-center gap-1 shadow-xs pointer-events-none">
              <span>{safeIndex + 1}</span>
              <span className="text-white/60">/</span>
              <span className="text-white/80">{validImages.length}</span>
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-900 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-900 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dot Pagination Indicator */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToIndex(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    safeIndex === idx
                      ? "w-6 bg-white shadow-xs"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Original Position Below Product Image Frame (Mobile Sticky Floating / Standard Row) */}
      {hasMultiple && (
        <div
          ref={mobileOriginalSlotRef}
          className={`${desktopVerticalLeft ? "lg:hidden min-h-[84px]" : ""}`}
        >
          <div
            ref={thumbnailsContainerRef}
            className={
              desktopVerticalLeft && isMobileFloating
                ? "lg:hidden fixed bottom-[58px] left-3 right-3 z-30 flex items-center gap-2.5 overflow-x-auto px-3 py-2 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-xl scrollbar-none"
                : "flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none"
            }
          >
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`Thumbnail ${idx + 1}`}
                className={`${
                  desktopVerticalLeft && isMobileFloating
                    ? "w-13 h-13 rounded-full"
                    : thumbnailShapeClass
                } overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  safeIndex === idx ? activeThumbnailClass : inactiveThumbnailClass
                }`}
              >
                <img
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
