export default function PricingPage() {
  const plans = [
    {
      name: "Entry plan",
      price: "₦5,000",
      note: "Founding-offer pricing, first 500 businesses",
      features: ["Compass profile", "Basic Shop", "Core ERP dashboard"]
    },
    {
      name: "SME plan",
      price: "₦25,000",
      note: "Full Shop + core ERP modules",
      featured: true,
      features: ["Full Shop customization", "Sales, inventory, accounting modules", "AI Marketing assistant"]
    },
    {
      name: "Growth plan",
      price: "₦75,000",
      note: "Multi-location + advanced analytics",
      features: ["HR & payroll integrations", "Advanced analytics", "Priority Compass placement"]
    }
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Pricing</h1>
        <p className="text-xl text-slate-600">Subscriptions for every stage of your business.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div key={plan.name} className={`p-8 rounded-2xl bg-white border ${plan.featured ? 'border-blue-500 shadow-xl relative' : 'border-slate-200 shadow-sm'}`}>
            {plan.featured && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                RECOMMENDED
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-500 uppercase tracking-wider mb-4">{plan.name}</h3>
            <div className="text-4xl font-bold text-slate-900 mb-2">{plan.price} <span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-sm text-slate-500 mb-8 h-10">{plan.note}</p>
            <ul className="space-y-4">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-center text-slate-500 mt-12 max-w-2xl mx-auto">
        Enterprise and module add-ons priced individually; Logistics, Virtual Office, and Business Hub billed as separate subscriptions on top of any plan.
      </p>
    </div>
  );
}
