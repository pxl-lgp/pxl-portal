'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { getApiHealth, getApiReadiness } from '@/lib/api';

export default function ObservabilityPage() {
  const health = useQuery({ queryKey: ['api-health'], queryFn: getApiHealth });
  const readiness = useQuery({ queryKey: ['api-readiness'], queryFn: getApiReadiness });

  return (
    <>
      <section><h1 className="text-2xl font-black">Observability</h1><p className="mt-1 text-sm text-muted-foreground">API uptime, memory, and readiness checks.</p></section>
      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard title="Liveness" data={health.data} isError={health.isError} />
        <StatusCard title="Readiness" data={readiness.data} isError={readiness.isError} />
      </section>
    </>
  );
}

function StatusCard({ data, isError, title }: { data?: { status: string; timestamp: string; database?: string; uptime?: number; memory?: number }; isError: boolean; title: string }) {
  return <div className="panel grid gap-3 p-5"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[var(--brand)]" /><h2 className="font-black">{title}</h2></div>{isError ? <p className="text-red-700">Down</p> : <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>}</div>;
}
