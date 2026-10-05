import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Master Product Blueprint · v1.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
              Ofia is the operating system <br className="hidden md:block" />
              Nigerian businesses <span className="text-blue-600">run on.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              Not a marketplace. A multi-tenant business ecosystem — storefront, ERP, AI, logistics, and discovery, all under one login — so a business enters its data once and it renders everywhere that&apos;s relevant.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/pricing" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                View Pricing
              </Link>
              <Link href="/products" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Explore the Suite
              </Link>
            </div>
          </div>
        </section>

        {/* What Ofia does */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">What Ofia does for a business</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">Establish</h3>
                <p className="text-slate-600">Online presence, a storefront, and a discoverable Compass profile.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">Operate</h3>
                <p className="text-slate-600">POS, inventory, HR, accounting, and industry-specific ERP modules.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">Sell & Connect</h3>
                <p className="text-slate-600">Products, services, bookings, payments, logistics, and customer relationships.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">Grow</h3>
                <p className="text-slate-600">AI-powered marketing, marketplace discovery, and business infrastructure like a virtual office or hub.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
