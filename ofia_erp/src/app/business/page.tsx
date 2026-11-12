"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  BarChart3, 
  Target, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Users,
  Globe,
  Check,
  ChevronDown,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { Footer } from "@/components/nexa/Footer";
import { PUBLIC_PRICING_PLANS, MODULE_ADDONS } from "@/lib/pricing-plans";

export default function BusinessSolutionsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Background image rotation (hero5.jpeg to hero8.jpeg)
  const heroImages = [
    "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686484/ofia_ng_assets/hgpojftxqtvq9ade6dd2.jpg",
    "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686484/ofia_ng_assets/bfpylrwnnl7wrzbcbfaa.jpg",
    "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686485/ofia_ng_assets/hvkuqabglsporl066v42.jpg",
    "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686485/ofia_ng_assets/rtsyms18tikxcq433tik.jpg"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Cross-fade every 6 seconds
    return () => clearInterval(imgInterval);
  }, []);

  const solutions = [
    { 
      title: "Niche Hub Advertising", 
      desc: "Get featured at the top of your specific service hub. Reach customers exactly when they need you.", 
      icon: <Target className="w-6 h-6" /> 
    },
    { 
      title: "Enterprise CRM", 
      desc: "Manage thousands of leads and bookings with our advanced pipeline tools designed for scale.", 
      icon: <BarChart3 className="w-6 h-6" /> 
    },
    { 
      title: "Verified Partner Program", 
      desc: "Gain the 'Nexa Gold' badge. Unlock higher trust and priority in search results.", 
      icon: <CheckCircle2 className="w-6 h-6" /> 
    },
    { 
      title: "Custom API Access", 
      desc: "Integrate Nexa's booking and discovery engine directly into your own corporate website.", 
      icon: <Globe className="w-6 h-6" /> 
    },
  ];

  const pricingPlans = PUBLIC_PRICING_PLANS.map((plan) => ({
    key: plan.key,
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPriceNGN,
    annualPrice: plan.annualPriceNGN,
    takeRates: plan.takeRates,
    seatsIncluded: plan.seatsIncluded,
    features: plan.highlights,
    cta: plan.ctaLabel,
    popular: Boolean(plan.popular),
    tag: plan.tag,
  }));

  const faqs = [
    {
      question: "How does the 3 Months Free promo work for the Growth tier?",
      answer: "To celebrate our launch, the first 500 verified businesses to complete KYB verification get 3 months of the Growth subscription (₦75,000/mo value) completely free, or 0% direct storefront commission on their first ₦5,000,000 in GMV."
    },
    {
      question: "How do Storefront Direct vs. Protected Escrow fees work?",
      answer: "In-store POS counter sales are always 0% commission. Online Storefront orders charge 0.5%–2.0% for Direct Checkout depending on your tier, or 1.5%–3.0% when Protected Escrow with Delivery OTP verification is enabled."
    },
    {
      question: "Can I add Mobility Fleet or Workforce OS without upgrading to Enterprise?",
      answer: "Yes! Any Growth or Scale workspace can activate specialized industry suites—like Ofia Mobility & Fleet (+₦75k/mo), Workforce Outsourcing OS (+₦60k/mo), or AI Voice Telephony (+₦50k/mo)—as modular add-ons."
    },
    {
      question: "Can I cancel or switch plan tiers at any time?",
      answer: "Yes, absolutely! Subscriptions are billed monthly or annually (with 2 months free on annual plans) via Paystack. You can upgrade, downgrade, or manage modular add-ons anytime from your Tenant Billing Portal."
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(price);
  };

  const scrollToPricing = () => {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12 text-nexa-text-primary">
      <NexaNavbar />
      
      {/* B2B HERO */}
      <section className="relative min-h-screen flex items-center justify-start pt-32 overflow-hidden bg-nexa-bg-base border-b border-nexa-border">
        {/* Background image & gradient blur overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={heroImages[currentImageIndex]}
              src={heroImages[currentImageIndex]} 
              alt="Hero background" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          {/* Water translucent blurry overlay resolving to zero opacity/blur to the right */}
          <div 
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
              WebkitBackdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
              maskImage: 'linear-gradient(to right, black 25%, transparent 75%)',
              WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 75%)'
            }}
          />
          {/* Vertical gradient tending towards the header area */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent" />
          {/* Left horizontal gradient to shield text content */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-30% to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-12 lg:px-20 relative z-10 text-left flex flex-col items-start">
          <div className="max-w-3xl">
             <motion.div 
               initial={{ opacity: 0, y: 25 }} 
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
             >
                <div className="inline-flex items-center gap-2 bg-nexa-brand/10 border border-nexa-brand/20 text-nexa-brand px-4 py-2 rounded-full mb-8 backdrop-blur-md">
                   <Briefcase className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">B2B & Enterprise Solutions</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-slate-900">
                  Scale your <br />
                  <span className="text-nexa-brand">Business Engine</span> <br />
                  with Nexa.
                </h1>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-10 max-w-xl">
                  Custom advertising, premium CRM pipelines, verified ratings, and custom APIs designed to help you dominate your local niche.
                </p>
                <div className="flex flex-wrap gap-4">
                   <NexaButton size="lg" className="px-10 h-16 rounded-2xl bg-nexa-brand text-white hover:bg-nexa-brand/90 transition-all shadow-xl shadow-nexa-brand/20" onClick={scrollToPricing}>
                     View Pricing Plans
                   </NexaButton>
                   <a href="mailto:sales@nexa.ng?subject=Nexa Enterprise Solutions Inquiry">
                     <NexaButton variant="secondary" size="lg" className="px-10 h-16 rounded-2xl border-slate-200/80 hover:bg-slate-50 text-slate-800 bg-white/80 backdrop-blur">
                       Talk to Sales
                     </NexaButton>
                   </a>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS GRID */}
      <section className="py-24">
         <div className="container mx-auto px-4">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-4">Enterprise Growth Tools</h2>
               <p className="text-nexa-text-secondary text-sm md:text-base">Tailored features for every stage of your local business operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {solutions.map((sol, i) => (
                 <NexaCard key={i} variant="interactive" className="p-8 h-full flex flex-col group border border-nexa-border/40 hover:border-nexa-brand/35 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                       {sol.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{sol.title}</h3>
                    <p className="text-sm text-nexa-text-secondary leading-relaxed flex-1 mb-8">{sol.desc}</p>
                    <NexaButton 
                      variant="ghost" 
                      className="p-0 h-auto justify-start text-nexa-brand font-extrabold hover:text-nexa-brand/85" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={scrollToPricing}
                    >
                      Learn More
                    </NexaButton>
                 </NexaCard>
               ))}
            </div>
         </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing-section" className="py-24 bg-nexa-bg-surface border-y border-nexa-border relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexa-brand/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-nexa-brand/10 text-nexa-brand px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Pricing Plans
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-4">Simple, transparent pricing</h2>
            <p className="text-nexa-text-secondary text-sm max-w-lg mx-auto mb-10">
              No hidden fees. Choose a plan that fits your current operational scale and upgrade as you grow.
            </p>

            {/* BILLING CYCLE TOGGLE */}
            <div className="inline-flex items-center bg-nexa-bg-base border border-nexa-border p-1.5 rounded-2xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  billingCycle === "monthly"
                    ? "bg-nexa-brand text-white shadow-md shadow-nexa-brand/20"
                    : "text-nexa-text-secondary hover:text-nexa-text-primary"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  billingCycle === "annually"
                    ? "bg-nexa-brand text-white shadow-md shadow-nexa-brand/20"
                    : "text-nexa-text-secondary hover:text-nexa-text-primary"
                )}
              >
                Annually
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingPlans.map((plan, i) => {
              const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
              const period = billingCycle === "monthly" ? "mo" : "yr";

              return (
                <div key={i} className="relative h-full flex">
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-nexa-brand text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 z-20">
                      <Sparkles className="w-3 h-3" /> {plan.tag}
                    </div>
                  )}
                  <NexaCard
                    variant="interactive"
                    className={cn(
                      "p-6 w-full flex flex-col relative border-t-4 transition-all duration-300 h-full",
                      plan.popular 
                        ? "border-t-nexa-brand shadow-2xl shadow-nexa-brand/5 border-x-nexa-brand/10 border-b-nexa-brand/10" 
                        : "border-t-nexa-border"
                    )}
                  >
                    <div className="mb-5">
                      <span className="text-[10px] uppercase tracking-widest font-black text-nexa-text-faint">
                        {plan.tag}
                      </span>
                      <h3 className="text-2xl font-extrabold mt-1">{plan.name}</h3>
                      <p className="text-xs text-nexa-text-secondary mt-2 min-h-8 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-5 p-4 rounded-2xl border border-nexa-border/30 bg-nexa-bg-base/40 space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-black tracking-tight">
                          {plan.key === "ENTERPRISE" ? `From ${formatPrice(price)}` : formatPrice(price)}
                        </span>
                        <span className="text-xs text-nexa-text-secondary font-bold">
                          /{period}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-nexa-border/40 text-nexa-text-secondary">
                        <span>Storefront Fee: <strong>{plan.takeRates.directCheckoutPct}%</strong></span>
                        <span>Escrow OTP: <strong>{plan.takeRates.escrowCheckoutPct}%</strong></span>
                      </div>
                    </div>

                    {/* FEATURES */}
                    <div className="flex-1 mb-6">
                      <p className="text-xs font-black uppercase text-nexa-text-faint tracking-wider mb-3">
                        What's Included ({plan.seatsIncluded} Seats)
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-nexa-text-secondary leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <NexaButton
                      variant={plan.popular ? "primary" : "secondary"}
                      className={cn(
                        "w-full h-12 rounded-xl text-xs font-black transition-all",
                        plan.popular ? "bg-nexa-brand text-white shadow-xl shadow-nexa-brand/15" : "hover:border-nexa-brand/45"
                      )}
                    >
                      {plan.cta}
                    </NexaButton>
                  </NexaCard>
                </div>
              );
            })}
          </div>

          {/* MODULAR ADD-ONS STRIP */}
          <div className="mt-12 pt-10 border-t border-nexa-border/50">
            <div className="text-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-nexa-brand">
                Layer 3 • À La Carte Extensions
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold mt-1">
                Modular Industry Suites for Growth & Scale
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODULE_ADDONS.map((addon) => (
                <div
                  key={addon.key}
                  className="p-5 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border/60 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold text-nexa-text-primary">
                        {addon.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nexa-brand/10 text-nexa-brand">
                        {addon.badge}
                      </span>
                    </div>
                    <p className="text-xs text-nexa-text-secondary leading-relaxed">
                      {addon.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-nexa-border/40 flex items-center justify-between text-xs">
                    <span className="font-black text-nexa-brand">
                      {addon.formattedPrice}
                    </span>
                    <span className="text-[10px] text-nexa-text-faint">
                      {addon.overageNote}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-4">Frequently Asked Questions</h2>
            <p className="text-nexa-text-secondary text-sm">Everything you need to know about Nexa business solutions.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} className="border border-nexa-border/60 rounded-2xl overflow-hidden bg-nexa-bg-surface/30">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-nexa-bg-surface transition-colors"
                  >
                    <span className="font-bold text-sm md:text-base pr-4 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-nexa-brand shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown className={cn("w-5 h-5 text-nexa-text-faint transition-transform shrink-0", isOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-6 pt-0 border-t border-nexa-border/30 text-xs md:text-sm text-nexa-text-secondary leading-relaxed bg-nexa-bg-base/20">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 bg-nexa-bg-surface border-t border-nexa-border relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-nexa-brand/5 to-transparent pointer-events-none" />
         <div className="container mx-auto px-4 text-center max-w-2xl relative z-10 text-nexa-text-primary">
            <div className="w-20 h-20 bg-nexa-brand/10 text-nexa-brand rounded-full flex items-center justify-center mx-auto mb-8 border border-nexa-brand/20">
               <Zap className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-6">Ready to lead your niche?</h2>
            <p className="text-base md:text-lg text-nexa-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
               Join over 500+ top-tier businesses currently using Nexa Enterprise to scale their booking operations and capture high-intent local clients.
            </p>
            <NexaButton size="lg" className="px-12 h-16 rounded-2xl bg-nexa-brand text-white hover:bg-nexa-brand/90 transition-all shadow-2xl shadow-nexa-brand/20" onClick={scrollToPricing}>
              Activate Business Hub
            </NexaButton>
         </div>
      </section>

      <Footer />

      <NexaBottomBar />
    </main>
  );
}
