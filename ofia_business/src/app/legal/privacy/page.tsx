"use client";

import React from "react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-nexa-bg-surface border-b border-nexa-border text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-display mb-4">Privacy Policy</h1>
          <p className="text-nexa-text-secondary">Last updated: April 19, 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-nexa dark:prose-invert max-w-none space-y-12">
           <section>
              <h2 className="text-2xl font-extrabold mb-6">1. Introduction</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                Nexa Technologies Ltd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our platform, mobile application, and services.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">2. Information We Collect</h2>
              <p className="text-nexa-text-secondary leading-relaxed mb-4">
                We collect information that you provide directly to us, such as when you create an account, list a business, or communicate with other users.
              </p>
              <ul className="list-disc pl-6 space-y-3 text-nexa-text-secondary">
                 <li><strong>Personal Data:</strong> Name, email address, phone number, and location.</li>
                 <li><strong>Business Data:</strong> Business name, industry, registration details, and services offered.</li>
                 <li><strong>Usage Data:</strong> Pages visited, searches performed, and booking history.</li>
              </ul>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">3. How We Use Your Information</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                We use your information to facilitate connections between consumers and businesses, process payments via third-party providers, improve our platform through analytics, and send relevant notifications about your bookings or account status.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">4. Data Sharing</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                We do not sell your personal data. We share information with businesses you interact with (to facilitate bookings) and third-party service providers who assist with payment processing, hosting, and customer support.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">5. Your Rights</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                As a user in Nigeria, you have rights under the Nigeria Data Protection Act (NDPA), including the right to access, correct, or delete your personal information. You can manage most of these settings directly through your Nexa Account Dashboard.
              </p>
           </section>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
