export default function OfiaFleetManagerAdmin() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Ofia Fleet Manager</h1>
      <p className="text-gray-500 mb-8">Global Administrator Dashboard for Fleet Operations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Total Routes</h2>
          <p className="text-4xl font-bold mt-4">142</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Active Vehicles</h2>
          <p className="text-4xl font-bold mt-4">1,204</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border">
          <h2 className="text-lg font-semibold">Platform Revenue</h2>
          <p className="text-4xl font-bold mt-4">₦14.2M</p>
        </div>
      </div>
    </div>
  );
}
