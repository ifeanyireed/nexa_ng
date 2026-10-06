export default function OfiaFleetManagerERP() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Ofia Fleet Manager</h1>
      <p className="text-gray-500 mb-8">Corporate ERP Dashboard for Fleet Operations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Staff Commuters</h2>
          <p className="text-4xl font-bold mt-4">245</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Our Vehicles</h2>
          <p className="text-4xl font-bold mt-4">12</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Fleet ROI</h2>
          <p className="text-4xl font-bold mt-4">₦1.2M</p>
        </div>
      </div>
    </div>
  );
}
