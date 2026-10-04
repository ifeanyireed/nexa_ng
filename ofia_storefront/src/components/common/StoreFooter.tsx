import Link from "next/link";
import { VendorStore, VerticalType } from "@/types/storefront";
import {
  ShieldCheck,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Info,
} from "lucide-react";

interface StoreFooterProps {
  store: VendorStore;
}

const VERTICAL_FOOTER_CONFIG: Record<
  VerticalType,
  {
    servicesHeading: string;
    services: Array<{ label: string; href: string; badge?: string }>;
    pagesHeading: string;
    pages: Array<{ label: string; href: string }>;
  }
> = {
  fashion: {
    servicesHeading: "Tailoring & Bespoke Services",
    services: [
      { label: "Bespoke Fitting & Tailoring", href: "/fashion/custom-tailoring", badge: "Artisan" },
      { label: "Garment Alteration & Hemming", href: "/fashion/custom-tailoring" },
      { label: "At-Home Private Valet Fitting", href: "/fashion/custom-tailoring" },
      { label: "Styling & Drape Consultation", href: "/fashion/custom-tailoring" },
    ],
    pagesHeading: "Atelier Pages",
    pages: [
      { label: "Collection Homepage", href: "/fashion" },
      { label: "Garment Catalog & Filters", href: "/fashion/catalog" },
      { label: "Store Information & Policies", href: "/info?vertical=fashion" },
      { label: "Customer Account & Bookings", href: "/account" },
      { label: "Live Dispatch Tracking", href: "/order-tracking" },
    ],
  },
  cars: {
    servicesHeading: "VIP Dealership Workflows",
    services: [
      { label: "Dealership Showroom Test-Drive", href: "/cars/book-test-drive/car-001", badge: "VIP" },
      { label: "At-Home Valet Test-Drive", href: "/cars/book-test-drive/car-001" },
      { label: "150-Point Mechanic Inspection", href: "/cars/book-test-drive/car-001", badge: "Certified" },
      { label: "Vehicle Sourcing & Concierge", href: "/cars/book-test-drive/car-001" },
    ],
    pagesHeading: "Showroom & Fleet",
    pages: [
      { label: "Showroom Overview", href: "/cars" },
      { label: "Certified Inventory & Fleet", href: "/cars/listings" },
      { label: "Dealership Info & Verification", href: "/info?vertical=cars" },
      { label: "Customer Account & Test-Drives", href: "/account" },
      { label: "Delivery Tracking", href: "/order-tracking" },
    ],
  },
  food: {
    servicesHeading: "Culinary & Catering Services",
    services: [
      { label: "Celebration Cake Commission", href: "/food/custom-order", badge: "Custom" },
      { label: "Corporate Executive Catering", href: "/food/custom-order" },
      { label: "Private Chef Dining", href: "/food/custom-order" },
      { label: "Express Hot-Bag Dispatch", href: "/order-tracking" },
    ],
    pagesHeading: "Kitchen & Dining",
    pages: [
      { label: "Kitchen Homepage", href: "/food" },
      { label: "Full Dining Menu & Add-ons", href: "/food/menu" },
      { label: "Kitchen Info & Health Standards", href: "/info?vertical=food" },
      { label: "Customer Account & Orders", href: "/account" },
      { label: "Track Live Delivery", href: "/order-tracking" },
    ],
  },
  property: {
    servicesHeading: "Residency & Viewing Workflows",
    services: [
      { label: "In-Person Guided Property Tour", href: "/property/schedule-viewing/prp-001", badge: "Private" },
      { label: "Live 4K Video Walkthrough", href: "/property/schedule-viewing/prp-001" },
      { label: "Move-In Deep Cleaning Service", href: "/property/schedule-viewing/prp-001" },
      { label: "Relocation & Logistics Support", href: "/property/schedule-viewing/prp-001" },
    ],
    pagesHeading: "Listings & Estates",
    pages: [
      { label: "Prime Residences Overview", href: "/property" },
      { label: "Available Rental Listings", href: "/property/listings" },
      { label: "Agency Info & Tenant Policies", href: "/info?vertical=property" },
      { label: "Customer Account & Tours", href: "/account" },
      { label: "Relocation Tracking", href: "/order-tracking" },
    ],
  },
  gadgets: {
    servicesHeading: "Hardware & Tech Support",
    services: [
      { label: "Authorized Hardware Diagnostics", href: "/gadgets/repairs", badge: "Lab" },
      { label: "Display & OLED Replacement", href: "/gadgets/repairs" },
      { label: "Battery Health Servicing", href: "/gadgets/repairs" },
      { label: "Check Hardware Warranty", href: "/gadgets/repairs", badge: "OfiaCare" },
    ],
    pagesHeading: "Hardware Catalog",
    pages: [
      { label: "Gadgets Flagship Store", href: "/gadgets" },
      { label: "Tech Catalog & Workstations", href: "/gadgets/catalog" },
      { label: "Store Info & Warranty Terms", href: "/info?vertical=gadgets" },
      { label: "Customer Account & Orders", href: "/account" },
      { label: "Hardware Delivery Tracking", href: "/order-tracking" },
    ],
  },
  beauty: {
    servicesHeading: "Studio Sanctuary Services",
    services: [
      { label: "Spa Treatments & Facials", href: "/beauty/services", badge: "Studio" },
      { label: "Skin Health Consultations", href: "/beauty/book-appointment" },
      { label: "Bridal Makeup & Hair Styling", href: "/beauty/services" },
      { label: "Book Therapist Appointment", href: "/beauty/book-appointment" },
    ],
    pagesHeading: "Products & Formulas",
    pages: [
      { label: "Beauty Sanctuary Home", href: "/beauty" },
      { label: "Skincare & Cosmetics Catalog", href: "/beauty/products" },
      { label: "Sanctuary Info & Studio Hours", href: "/info?vertical=beauty" },
      { label: "Customer Account & Appointments", href: "/account" },
      { label: "Dispatch Order Tracking", href: "/order-tracking" },
    ],
  },
  "home-living": {
    servicesHeading: "Interior & Assembly Services",
    services: [
      { label: "White-Glove Furniture Assembly", href: "/home-living/services", badge: "Full Service" },
      { label: "In-Room Spatial Styling", href: "/home-living/services" },
      { label: "Custom Millwork & Carpentry", href: "/home-living/services" },
      { label: "Delivery & Logistics Options", href: "/home-living/delivery-options" },
    ],
    pagesHeading: "Furniture & Living",
    pages: [
      { label: "Design Studio Homepage", href: "/home-living" },
      { label: "Furniture Catalog & Dimensions", href: "/home-living/catalog" },
      { label: "Store Information & Hours", href: "/info?vertical=home-living" },
      { label: "Customer Account & Deliveries", href: "/account" },
    ],
  },
  pharmacy: {
    servicesHeading: "Clinical & Prescription Services",
    services: [
      { label: "Doctor Prescription Verification", href: "/pharmacy/prescription", badge: "Rx" },
      { label: "Clinical Pharmacist Consultation", href: "/pharmacy/consultation", badge: "Telehealth" },
      { label: "Automated Monthly Refill Schedules", href: "/pharmacy/prescription" },
      { label: "Cold-Chain Temperature Dispatch", href: "/order-tracking" },
    ],
    pagesHeading: "Regulated Dispensary",
    pages: [
      { label: "Dispensary Homepage", href: "/pharmacy" },
      { label: "Medication & Wellness Catalog", href: "/pharmacy/catalog" },
      { label: "Dispensary Hours & Verification", href: "/info?vertical=pharmacy" },
      { label: "Customer Account & Prescriptions", href: "/account" },
    ],
  },
  hardware: {
    servicesHeading: "Engineering & Field Services",
    services: [
      { label: "On-Site Solar Load Sizing Audit", href: "/hardware/services", badge: "COREN" },
      { label: "Turnkey Inverter Installation", href: "/hardware/services" },
      { label: "Solar Load Sizing Calculator", href: "/hardware/calculator", badge: "Interactive" },
      { label: "Contractor Wholesale RFQ", href: "/hardware/services" },
    ],
    pagesHeading: "Hardware & Energy",
    pages: [
      { label: "Energy Flagship Store", href: "/hardware" },
      { label: "Technical Equipment Catalog", href: "/hardware/catalog" },
      { label: "Store Information & Warranty Terms", href: "/info?vertical=hardware" },
      { label: "Customer Account & Orders", href: "/account" },
    ],
  },
  retail: {
    servicesHeading: "Artisan Atelier Services",
    services: [
      { label: "Brass Laser Engraving & Inscription", href: "/retail/customization", badge: "Custom" },
      { label: "Handmade Mulberry Wax-Seal Wrap", href: "/retail/customization" },
      { label: "Wedding & Baby Gift Registry", href: "/retail/customization", badge: "Registry" },
      { label: "Specialty Book & Drop Pre-Orders", href: "/retail/customization" },
    ],
    pagesHeading: "Specialty Departments",
    pages: [
      { label: "Specialty Storefront Home", href: "/retail" },
      { label: "Multi-Department Catalog", href: "/retail/catalog" },
      { label: "Store Directory & Policies", href: "/info?vertical=retail" },
      { label: "Customer Account & Orders", href: "/account" },
    ],
  },
};

export default function StoreFooter({ store }: StoreFooterProps) {
  const footerConfig = VERTICAL_FOOTER_CONFIG[store.vertical] || VERTICAL_FOOTER_CONFIG.fashion;

  return (
    <footer className="w-full bg-[#111216] text-white pt-14 pb-10 border-t border-white/10 mt-20">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 space-y-12">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Business Storefront</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Direct merchant storefront running on Ofia Commerce ecosystem.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Integrated Logistics Dispatch</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Automated rider dispatch, express doorstep delivery & live route tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Industry-Tailored Workflows</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Bespoke fittings, vehicle test drives, meal prep counters & viewing appointments.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Store Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={store.logo}
                alt={store.name}
                className="w-9 h-9 object-contain shrink-0"
              />
              <span className="font-dropa font-bold text-xl text-white">{store.name}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {store.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {store.badges.map((b) => (
                <span
                  key={b}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-zinc-300"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Dynamic Extra Pages / Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {footerConfig.pagesHeading}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              {footerConfig.pages.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="hover:text-white flex items-center gap-1.5 transition-colors group"
                  >
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    <span>{p.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Dynamic Vertical Services & Workflows */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {footerConfig.servicesHeading}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              {footerConfig.services.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="hover:text-white flex items-center justify-between gap-2 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </div>
                    {s.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold shrink-0">
                        {s.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Store Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Store Hours & Contact
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>{store.contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href={`tel:${store.contact.phone}`} className="hover:text-white transition-colors">
                  {store.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href={`mailto:${store.contact.email}`} className="hover:text-white transition-colors">
                  {store.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-zinc-400 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{store.contact.operatingHours}</span>
              </li>
              <li className="pt-2">
                <Link
                  href={`/info?vertical=${store.vertical}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10 shadow-xs"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Store Info & Policies</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} {store.name} · Powered by Ofia Commerce & Logistics Platform</p>
          <div className="flex flex-wrap items-center gap-4 text-zinc-400">
            <Link
              href={`/info?vertical=${store.vertical}`}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Store Info</span>
            </Link>
            <span>·</span>
            <span>Customer Protection</span>
            <span>·</span>
            <span>Delivery Policy</span>
            <span>·</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
