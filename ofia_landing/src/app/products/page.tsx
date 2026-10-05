export default function ProductsPage() {
  const products = [
    { name: "Ofia Compass", desc: "Business discovery and marketplace layer. Be found." },
    { name: "Ofia Shops", desc: "Dedicated digital storefronts (.ofia.shop)." },
    { name: "Ofia Merchant App", desc: "Mobile operating environment to run your day." },
    { name: "Ofia ERP", desc: "Operational software: POS, HR, Accounting, Inventory." },
    { name: "Vertical Experiences", desc: "Specialized templates for Cars, Food, Hotels, etc." },
    { name: "Ofia AI", desc: "Shared AI infrastructure for marketing, content, and sales." },
    { name: "Ofia Logistics", desc: "Delivery infrastructure shared across shops and ERP." },
    { name: "Virtual Office", desc: "Business address, mail handling, and meeting rooms." },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">The Suite</h1>
        <p className="text-xl text-slate-600">Twelve product families, one ecosystem.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.name} className="p-8 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
            <p className="text-slate-600 leading-relaxed">{product.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
