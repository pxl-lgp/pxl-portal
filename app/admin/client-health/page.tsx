'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { HeartPulse, RefreshCw } from 'lucide-react';
import { getClientHealth } from '@/lib/api';

export default function ClientHealthPage() {
  const query = useQuery({ queryKey: ['client-health'], queryFn: getClientHealth });
  const records = query.data ?? [];

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Client health</h1>
          <p className="mt-1 text-sm text-muted-foreground">Risk scoring from approvals, assets, reports, social connections, and automation failures.</p>
        </div>
        <button className="button button-secondary" onClick={() => query.refetch()} type="button"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>
      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b p-5"><HeartPulse className="h-5 w-5 text-[var(--brand)]" /><h2 className="font-black">Scores</h2></div>
        {records.map((record) => (
          <Link className="grid gap-3 border-t p-5 first:border-t-0 hover:bg-muted/40 md:grid-cols-[1fr_120px_120px] md:items-center" href={`/admin/clients/${record.clientId}`} key={record.clientId}>
            <div><h3 className="font-black">{record.businessName}</h3><p className="mt-1 text-sm text-muted-foreground">{record.reasons.join(', ') || 'No risks detected'}</p></div>
            <div className="text-2xl font-black">{record.score}</div>
            <span className={`badge ${record.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : record.status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{record.status}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
