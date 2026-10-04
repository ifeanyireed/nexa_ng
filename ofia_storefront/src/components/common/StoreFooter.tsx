import Link from "next/link";
import { VendorStore } from "@/types/storefront";
import { ShieldCheck, Truck, Clock, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

interface StoreFooterProps {
  store: VendorStore;
}

export default function StoreFooter({ store }: StoreFooterProps) {
  return (
    <footer className="w-full bg-[#111216] text-white pt-14 pb-10 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={store.logo}
                alt={store.name}
                className="w-8 h-8 rounded-lg object-contain p-1 bg-white border border-white/20"
              />
              <span className="font-dropa font-bold text-xl text-white">{store.name}</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
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

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Store Hours & Contact</h4>
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
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">7 Templates Showcase</h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-zinc-400 font-medium">
              <Link href="/fashion" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Fashion</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/cars" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Cars</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/food" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Food</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/property" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Property</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/gadgets" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Gadgets</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/beauty" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Beauty</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/home-living" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>Home & Living</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link href="/templates" className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                <span>All 7 Views</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} {store.name} · Powered by Ofia Commerce & Logistics Platform</p>
          <div className="flex items-center gap-4 text-zinc-400">
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
