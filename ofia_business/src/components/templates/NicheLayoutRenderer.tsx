"use client";

import React, { useState, useEffect } from "react";
import { QuickOrderTemplate } from "./QuickOrderTemplate";
import { BookingStayTemplate } from "./BookingStayTemplate";
import { OnDemandDispatchTemplate } from "./OnDemandDispatchTemplate";
import { CalendarBookingTemplate } from "./CalendarBookingTemplate";
import { VehicleInspectionTemplate } from "./VehicleInspectionTemplate";
import { SubscriptionPickupTemplate } from "./SubscriptionPickupTemplate";
import { TechnicalQuoteTemplate } from "./TechnicalQuoteTemplate";

// Default Master Subdomain Layout Mapping Table
export const DEFAULT_SUBDOMAIN_LAYOUT_MAP: Record<
  string,
  {
    layoutKey: string;
    title: string;
    subtitle: string;
  }
> = {
  // 11 Master Verticals
  food: {
    layoutKey: "quick_order",
    title: "Food & Fast Delivery",
    subtitle: "Order from verified cloud kitchens and instant eateries with 25-minute doorstep dispatch.",
  },
  hotels: {
    layoutKey: "booking_stay",
    title: "Hotels & Verified Shortlets",
    subtitle: "Reserve luxury apartments, boutique hotels, and serviced villas with guaranteed 24/7 power.",
  },
  hotel: {
    layoutKey: "booking_stay",
    title: "Hotels & Stays",
    subtitle: "Reserve verified hotel rooms and boutique suites.",
  },
  rides: {
    layoutKey: "on_demand_dispatch",
    title: "On-Demand Rides & Transit",
    subtitle: "Instant commuter transport, airport drop-offs, and private car hires across Lagos and Abuja.",
  },
  ride: {
    layoutKey: "on_demand_dispatch",
    title: "On-Demand Rides",
    subtitle: "Instant commuter transport and airport drop-offs.",
  },
  dispatch: {
    layoutKey: "on_demand_dispatch",
    title: "Express Courier & Dispatch",
    subtitle: "Instant motorbike parcels, freight haulage, and interstate delivery with live GPS.",
  },
  beauty: {
    layoutKey: "calendar_booking",
    title: "Beauty Stylists & Barbers",
    subtitle: "Book verified hair braiders, makeup artists, nail techs, and master barbers.",
  },
  apartments: {
    layoutKey: "booking_stay",
    title: "Serviced Apartments & Villas",
    subtitle: "Premium shortlet rentals with smart lock access and swimming pool facilities.",
  },
  apartment: {
    layoutKey: "booking_stay",
    title: "Serviced Apartments",
    subtitle: "Premium shortlet rentals with smart lock access.",
  },
  shortlets: {
    layoutKey: "booking_stay",
    title: "Luxury Shortlets & Holiday Homes",
    subtitle: "Fully furnished executive apartments with high-speed WiFi and standby generators.",
  },
  shortlet: {
    layoutKey: "booking_stay",
    title: "Luxury Shortlet Suites",
    subtitle: "Fully furnished executive apartments.",
  },
  cars: {
    layoutKey: "vehicle_inspection",
    title: "Certified Cars & Auto Sales",
    subtitle: "Verified pre-purchase 150-point diagnostic reports for foreign-used and Nigerian cars.",
  },
  car: {
    layoutKey: "vehicle_inspection",
    title: "Car Diagnostics & Inspection",
    subtitle: "Verified pre-purchase 150-point diagnostic reports.",
  },
  laundry: {
    layoutKey: "subscription_pickup",
    title: "Laundry & Dry Cleaning Pickup",
    subtitle: "Subscribe to scheduled weekly doorstep laundry collection and steam pressing.",
  },
  tutors: {
    layoutKey: "calendar_booking",
    title: "Private Tutors & Academic Mentors",
    subtitle: "1-on-1 private tuition for Cambridge IGCSE, SAT, WAEC, and coding.",
  },
  tutor: {
    layoutKey: "calendar_booking",
    title: "Private Tutors & Mentors",
    subtitle: "1-on-1 private tuition and exam prep.",
  },
  autocare: {
    layoutKey: "vehicle_inspection",
    title: "Autocare & Mobile Mechanics",
    subtitle: "OBD2 computer scanning, gearbox repair, and mobile emergency breakdown assistance.",
  },
  properties: {
    layoutKey: "technical_quote",
    title: "Properties & Construction Engineering",
    subtitle: "Hire verified architects, builders, and structural survey engineers.",
  },
  property: {
    layoutKey: "technical_quote",
    title: "Property Inspections & Quotes",
    subtitle: "Hire verified architects and structural survey engineers.",
  },

  // 24 Canonical Subcategories & Niche Finders
  handyman: {
    layoutKey: "technical_quote",
    title: "Handyman & Technical Repairs",
    subtitle: "Certified electricians, plumbers, carpenters, painters, and tilers on demand.",
  },
  specialists: {
    layoutKey: "technical_quote",
    title: "Specialist Engineering Contractors",
    subtitle: "Solar inverter engineers, borehole drillers, and AC technicians.",
  },
  cleaning: {
    layoutKey: "subscription_pickup",
    title: "Cleaning & Sanitation Schedule",
    subtitle: "Recurring home cleaning, deep fumigation, and industrial post-construction cleanup.",
  },
  sanitation: {
    layoutKey: "subscription_pickup",
    title: "Sanitation & Waste Management",
    subtitle: "Professional fumigation, water tank washing, and scheduled waste disposal.",
  },
  style: {
    layoutKey: "calendar_booking",
    title: "Bespoke Fashion Tailoring & Styling",
    subtitle: "Book appointments with premium bespoke fashion designers and braiders.",
  },
  wardrobe: {
    layoutKey: "subscription_pickup",
    title: "Wardrobe & Garment Care",
    subtitle: "Scheduled garment dry cleaning and delicate fabric treatment.",
  },
  tech: {
    layoutKey: "technical_quote",
    title: "IT Hardware & CCTV Installation",
    subtitle: "Network cabling, IP cloud CCTV setup, and inverter diagnostics.",
  },
  corporate: {
    layoutKey: "calendar_booking",
    title: "Corporate Legal & Accounting Consultations",
    subtitle: "Verified business attorneys, chartered accountants, and tax advisors.",
  },
  creative: {
    layoutKey: "technical_quote",
    title: "Creative & Media Production",
    subtitle: "Videography, drone cinematography, and corporate media production.",
  },
  talent: {
    layoutKey: "calendar_booking",
    title: "Talent & Event Staffing",
    subtitle: "Verified event ushers, bouncers, protocol officers, and private drivers.",
  },
  tutoring: {
    layoutKey: "calendar_booking",
    title: "Academic Tutoring & Language Lessons",
    subtitle: "Private instructors for French, IELTS, Python, and Mathematics.",
  },
  vocational: {
    layoutKey: "calendar_booking",
    title: "Vocational Skills & Practical Workshops",
    subtitle: "Hands-on culinary training, solar wiring, and fashion design courses.",
  },
  planning: {
    layoutKey: "calendar_booking",
    title: "Event Planning & Coordination",
    subtitle: "Certified event directors, decorators, and stage lighting coordinators.",
  },
  entertainment: {
    layoutKey: "calendar_booking",
    title: "Event DJs, MCs & Sound Engineers",
    subtitle: "Hire premium sound equipment and certified event entertainers.",
  },
  medical: {
    layoutKey: "calendar_booking",
    title: "Home Health & Medical Consultations",
    subtitle: "Certified nurses, home physiotherapy, and geriatric care specialists.",
  },
  wellness: {
    layoutKey: "calendar_booking",
    title: "Spa, Massage & Wellness Therapies",
    subtitle: "Mobile therapeutic deep tissue and relaxation massage sessions.",
  },
  caregiving: {
    layoutKey: "calendar_booking",
    title: "Verified Childcare & Senior Support",
    subtitle: "Vetted nannies, elderly companions, and domestic assistants.",
  },
  transport: {
    layoutKey: "on_demand_dispatch",
    title: "Interstate Transit & Haulage",
    subtitle: "Dedicated cargo vans and trucks for interstate relocation and logistics.",
  },
  mechanics: {
    layoutKey: "vehicle_inspection",
    title: "Certified Mobile Auto Mechanics",
    subtitle: "Emergency roadside assistance and computerized auto diagnostics.",
  },
  culinary: {
    layoutKey: "quick_order",
    title: "Chefs, Meal Prep & Cloud Kitchens",
    subtitle: "Weekly healthy meal prep trays and on-demand party catering.",
  },
  agriculture: {
    layoutKey: "quick_order",
    title: "Fresh Farm Produce & Agribusiness",
    subtitle: "Direct-from-farm tubers, vegetables, poultry, and grains express delivery.",
  },
  construction: {
    layoutKey: "technical_quote",
    title: "Building Construction & Renovation",
    subtitle: "Certified structural engineers, bricklayers, roofers, and quantity surveyors.",
  },
  plumber: {
    layoutKey: "technical_quote",
    title: "Certified Plumbers & Piping",
    subtitle: "Emergency leak repairs, water heater installation, and borehole piping.",
  },
  solar: {
    layoutKey: "technical_quote",
    title: "Solar Inverters & Renewable Energy",
    subtitle: "Hybrid inverter sizing, lithium batteries, and solar panel installation.",
  },
};

interface NicheLayoutRendererProps {
  nicheSlug: string;
  forcedLayoutKey?: string;
  customTitle?: string;
  customSubtitle?: string;
}

export const NicheLayoutRenderer: React.FC<NicheLayoutRendererProps> = ({
  nicheSlug,
  forcedLayoutKey,
  customTitle,
  customSubtitle,
}) => {
  const normalized = (nicheSlug || "handyman").toLowerCase();
  const defaultMeta = DEFAULT_SUBDOMAIN_LAYOUT_MAP[normalized] || {
    layoutKey: "technical_quote",
    title: `${normalized.charAt(0).toUpperCase() + normalized.slice(1)} Marketplace`,
    subtitle: "Verified pros, instant quotes, and escrow protected bookings.",
  };

  const [activeLayoutKey, setActiveLayoutKey] = useState<string>(
    forcedLayoutKey || defaultMeta.layoutKey
  );
  const [activeTitle, setActiveTitle] = useState<string>(
    customTitle || defaultMeta.title
  );
  const [activeSubtitle, setActiveSubtitle] = useState<string>(
    customSubtitle || defaultMeta.subtitle
  );

  // Sync layout from remote API if available
  useEffect(() => {
    let isMounted = true;
    const fetchLayoutConfig = async () => {
      try {
        const res = await fetch(`/api/subdomain-layouts/${normalized}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.layout_key && isMounted) {
            setActiveLayoutKey(data.layout_key);
            if (data.custom_title) setActiveTitle(data.custom_title);
            if (data.custom_subtitle) setActiveSubtitle(data.custom_subtitle);
          }
        }
      } catch (err) {
        // Graceful fallback to static map
      }
    };

    fetchLayoutConfig();
    return () => {
      isMounted = false;
    };
  }, [normalized]);

  const effectiveLayout = forcedLayoutKey || activeLayoutKey;

  switch (effectiveLayout) {
    case "quick_order":
      return (
        <QuickOrderTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "booking_stay":
      return (
        <BookingStayTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "on_demand_dispatch":
      return (
        <OnDemandDispatchTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "calendar_booking":
      return (
        <CalendarBookingTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "vehicle_inspection":
      return (
        <VehicleInspectionTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "subscription_pickup":
      return (
        <SubscriptionPickupTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );

    case "technical_quote":
    default:
      return (
        <TechnicalQuoteTemplate
          title={activeTitle}
          subtitle={activeSubtitle}
          subdomain={normalized}
        />
      );
  }
};
