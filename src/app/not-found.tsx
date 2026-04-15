"use client";

import Link from "next/link";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-nexa-text-secondary mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <NexaButton>Return Home</NexaButton>
      </Link>
    </div>
  );
}
