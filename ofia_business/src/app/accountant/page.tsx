"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountantRoot() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/accountant/overview");
	}, [router]);

	return (
		<div className="py-20 flex justify-center items-center">
			<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
		</div>
	);
}
