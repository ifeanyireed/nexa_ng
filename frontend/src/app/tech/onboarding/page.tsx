"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Briefcase, Banknote, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';
import { NexaInput } from '@/components/nexa/NexaInput';
import { NexaNavbar } from '@/components/nexa/NexaNav';
import { cn } from '@/lib/utils';

const steps = [
    { id: 1, name: 'Personal Details', icon: <User /> },
    { id: 2, name: 'Skills & Verification', icon: <Briefcase /> },
    { id: 3, name: 'Financials', icon: <Banknote /> },
    { id: 4, name: 'Review & Submit', icon: <CheckCircle /> },
];

export default function TechOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <>
            <NexaNavbar />
            <main className="container mx-auto px-4 pt-32 pb-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-display text-center mb-4">Become a Nexa Technician</h1>
                    <p className="text-nexa-text-secondary text-center mb-12">Join our elite team of verified professionals. Complete the steps below to get started.</p>

                    {/* Stepper */}
                    <div className="flex justify-between items-center mb-12">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                                        currentStep >= step.id ? "bg-nexa-brand text-white border-nexa-brand" : "bg-nexa-bg-surface border-nexa-border text-nexa-text-faint"
                                    )}>
                                        {step.icon}
                                    </div>
                                    <p className={cn("text-xs font-bold mt-2", currentStep >= step.id ? "text-nexa-text-primary" : "text-nexa-text-faint")}>{step.name}</p>
                                </div>
                                {index < steps.length - 1 && <div className={cn("flex-1 h-0.5 mx-4", currentStep > index + 1 ? "bg-nexa-brand" : "bg-nexa-border")} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <NexaCard className="p-8">
                        {currentStep === 1 && <StepPersonalDetails />}
                        {currentStep === 2 && <StepSkills />}
                        {currentStep === 3 && <StepFinancials />}
                        {currentStep === 4 && <StepReview />}
                    </NexaCard>
                    
                    <div className="flex justify-between mt-8">
                        <NexaButton variant="outline" onClick={prevStep} disabled={currentStep === 1} leftIcon={<ArrowLeft/>}>
                            Previous
                        </NexaButton>
                        <NexaButton onClick={nextStep} disabled={currentStep === steps.length} rightIcon={<ArrowRight/>}>
                            {currentStep === steps.length - 1 ? 'Submit Application' : 'Next Step'}
                        </NexaButton>
                    </div>
                </div>
            </main>
        </>
    );
}

const StepPersonalDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-xl font-bold">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NexaInput label="First Name" />
            <NexaInput label="Last Name" />
            <NexaInput label="Phone Number" />
            <NexaInput label="Email Address" type="email" />
            <NexaInput label="Home Address" className="md:col-span-2" />
        </div>
    </motion.div>
);

const StepSkills = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-xl font-bold">Skills & Verification</h2>
        <NexaInput label="Primary Skill / Trade" placeholder="e.g., Electrician, Plumber" />
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Certifications (Optional but recommended)</label>
            <div className="h-32 border-2 border-dashed border-nexa-border rounded-2xl flex items-center justify-center text-nexa-text-faint">
                Drag & drop or click to upload documents
            </div>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-2xl text-sm text-yellow-600 flex items-center gap-3">
            <Shield/>
            A background check is required. We will send a separate email to initiate this process.
        </div>
    </motion.div>
);

const StepFinancials = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-xl font-bold">Financial Information</h2>
        <p className="text-sm text-nexa-text-secondary">Provide your bank details for payouts.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NexaInput label="Bank Name" />
            <NexaInput label="Account Number" />
            <NexaInput label="Account Holder Name" />
        </div>
    </motion.div>
);

const StepReview = () => (
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ready to Submit?</h2>
        <p className="text-nexa-text-secondary">
            Review your information in the previous steps, then click "Submit Application" to send it to our team for review. You'll hear from us within 3-5 business days.
        </p>
    </motion.div>
);
