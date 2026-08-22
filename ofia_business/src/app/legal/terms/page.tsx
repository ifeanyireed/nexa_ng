"use client";

import React from "react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";

export default function TermsOfServicePage() {
  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-nexa-bg-surface border-b border-nexa-border text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-display mb-4">Terms of Service</h1>
          <p className="text-nexa-text-secondary">Last updated: April 19, 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-nexa dark:prose-invert max-w-none space-y-12">
           <section>
              <h2 className="text-2xl font-extrabold mb-6">1. Agreement to Terms</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                By accessing or using Nexa ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">2. User Conduct</h2>
              <p className="text-nexa-text-secondary leading-relaxed mb-4">
                Users are responsible for their accounts and the accuracy of the information provided.
              </p>
              <ul className="list-disc pl-6 space-y-3 text-nexa-text-secondary">
                 <li><strong>Businesses:</strong> Must provide legitimate services and possess all necessary licenses and registrations.</li>
                 <li><strong>Consumers:</strong> Must respect the time and expertise of the businesses they interact with.</li>
                 <li><strong>Communication:</strong> Abusive or fraudulent communication is strictly prohibited and will lead to immediate account termination.</li>
              </ul>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">3. Bookings and Payments</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                Nexa facilitates connections but is not a party to the contract between the consumer and the business. All payments processed through the Platform are subject to the terms and conditions of our payment gateway partners.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">4. Platform Fees</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                We may charge fees for certain features or transactions. These fees are clearly disclosed before they are incurred. We reserve the right to modify our fee structure at any time.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-extrabold mb-6">5. Limitation of Liability</h2>
              <p className="text-nexa-text-secondary leading-relaxed">
                Nexa is not liable for any disputes, damages, or losses resulting from the quality of services provided by businesses listed on the Platform. We provide the platform "as-is" and do not guarantee continuous availability or the outcome of any booking.
              </p>
           </section>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
