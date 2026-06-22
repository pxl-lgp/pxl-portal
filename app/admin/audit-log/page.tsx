'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAuditLogs } from '@/lib/api';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', entityType: '' });
  const query = useQuery({
    queryKey: ['audit-log', filters],
    queryFn: () => getAuditLogs(filters),
  });
  const logs = useMemo(() => query.data ?? [], [query.data]);
  const actions = useMemo(() => Array.from(new Set(logs.map((log) => log.action))).sort(), [logs]);
  const entityTypes = useMemo(() => Array.from(new Set(logs.map((log) => log.entityType))).sort(), [logs]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Security-sensitive admin and account changes.</p>
        </div>
        <button className="button button-secondary" onClick={() => query.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Events</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select className="select" onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))} value={filters.action}>
              <option value="">All actions</option>
              {actions.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
            <select className="select" onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))} value={filters.entityType}>
              <option value="">All entities</option>
              {entityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        {query.isError ? (
          <div className="p-5 text-sm text-red-700">Unable to load audit log.</div>
        ) : logs.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-6 text-sm text-muted-foreground">No audit entries yet.</div>
        ) : (
          <div className="grid">
            {logs.map((log) => (
              <article className="grid gap-2 border-t p-5 first:border-t-0" key={log.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-800">{log.action}</span>
                  <span className="font-black">{log.entityType}</span>
                  {log.entityId ? <span className="text-xs text-muted-foreground">{log.entityId}</span> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Actor {log.actorUserId ?? 'system'} / {new Date(log.createdAt).toLocaleString()}
                </p>
                {Object.keys(log.metadata).length > 0 ? (
                  <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
