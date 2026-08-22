"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Tab {
	id: string;
	label: string;
	slug: string;
}

interface SubNavTabsProps {
	tabs: Tab[];
	activeTabId: string;
	colorTheme?: "red" | "blue";
}

export default function SubNavTabs({ tabs, activeTabId, colorTheme = "blue" }: SubNavTabsProps) {
	const router = useRouter();
	const activeColorClass = colorTheme === "red" ? "text-red-500 font-bold" : "text-blue-600 font-bold";
	const underlineColorClass = colorTheme === "red" ? "bg-red-500" : "bg-blue-600";
	
	// Create a stable key for layoutId transition animation
	const groupKey = tabs.length > 0 ? tabs[0].id : "subnav";

	return (
		<div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide gap-1 w-full">
			{tabs.map((tab) => {
				const isActive = tab.id === activeTabId;
				return (
					<button
						key={tab.id}
						onClick={() => router.push(tab.slug)}
						className={`relative px-5 py-3 font-extrabold text-xs whitespace-nowrap transition-all cursor-pointer ${
							isActive
								? activeColorClass
								: "text-slate-400 hover:text-slate-700"
						}`}
					>
						{isActive && (
							<motion.div
								layoutId={`activeUnderline_${groupKey}`}
								className={`absolute bottom-0 left-0 right-0 h-0.5 ${underlineColorClass} z-10`}
								transition={{ type: "spring", stiffness: 380, damping: 30 }}
							/>
						)}
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}
