'use client';
/**
 * ServiceRequests Page — Citizens submit requests; leaders review and respond.
 * TODO: implement with useQuery() for data + components from src/components/
 */
export default function ServiceRequestsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ServiceRequests</h1>
      </div>
      <div className="card">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-500 font-medium">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">TODO: implement ServiceRequests list and actions</p>
        </div>
      </div>
    </div>
  );
}
