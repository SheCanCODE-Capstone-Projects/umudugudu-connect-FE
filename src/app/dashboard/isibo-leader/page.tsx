'use client';
/**
 * IsiboLeader Dashboard — TODO: implement widgets.
 * Use useQuery() for server state. useAppSelector() for auth state.
 */
export default function IsiboLeaderDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">IsiboLeader Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['Stat 1', 'Stat 2', 'Stat 3'].map((s) => (
          <div key={s} className="card"><p className="text-sm text-gray-500">{s}</p><p className="text-2xl font-bold">—</p></div>
        ))}
      </div>
      <div className="card"><p className="text-gray-400 text-sm text-center py-8">TODO: add IsiboLeader dashboard widgets</p></div>
    </div>
  );
}
