'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Cog, RefreshCw, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAutomationLogs, retryAutomationLog } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { AutomationLog, AutomationStatus } from '@/lib/types';

const statusFilters: Array<{ label: string; value: AutomationStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Succeeded', value: 'SUCCEEDED' },
];

export default function AutomationPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AutomationStatus | ''>('');
  const logsQuery = useQuery({
    queryKey: ['automation', 'logs', status || 'all'],
    queryFn: () => getAutomationLogs(status || undefined),
  });
  const retryMutation = useMutation({
    mutationFn: (id: string) => retryAutomationLog(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['automation', 'logs'] });
    },
  });
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);
  const failedCount = useMemo(
    () => (logsQuery.data ?? []).filter((log) => log.status === 'FAILED').length,
    [logsQuery.data],
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Automation logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drive provisioning, calendar reminders, and lead events dispatched by the API
          </p>
        </div>
        <button className="button button-secondary" onClick={() => logsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {retryMutation.isError ? (
        <ErrorPanel message={getApiErrorMessage(retryMutation.error, 'Retry failed.')} />
      ) : null}
      {retryMutation.isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Re-dispatched {retryMutation.data.eventName}.
        </div>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Event history</h2>
            {failedCount > 0 && status !== 'FAILED' ? (
              <span className="badge bg-red-100 text-red-800">{failedCount} failed</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                className={`badge cursor-pointer border ${
                  status === filter.value
                    ? 'border-transparent bg-[var(--brand)] text-white'
                    : 'border-[var(--border)] bg-[var(--panel-muted)] text-foreground/70'
                }`}
                key={filter.label}
                onClick={() => setStatus(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {logsQuery.isError ? (
          <ErrorPanel message="Unable to load automation logs." />
        ) : logs.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
            {status ? `No ${status.toLowerCase()} events.` : 'No automation events yet.'}
          </div>
        ) : (
          <div className="grid">
            {logs.map((log) => (
              <LogRow
                isRetrying={retryMutation.isPending && retryMutation.variables === log.id}
                key={log.id}
                log={log}
                onRetry={() => retryMutation.mutate(log.id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function LogRow({
  isRetrying,
  log,
  onRetry,
}: {
  isRetrying: boolean;
  log: AutomationLog;
  onRetry: () => void;
}) {
  return (
    <article className="grid gap-3 border-t border-[var(--border)] p-5 first:border-t-0 lg:grid-cols-[1fr_auto] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${statusClass(log.status)}`}>{log.status}</span>
          <h3 className="font-black">{log.eventName}</h3>
        </div>
        <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
          {log.entityType}
          {log.entityId ? ` · ${log.entityId}` : ''} / {new Date(log.createdAt).toLocaleString()}
        </p>
        {log.errorMessage ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{log.errorMessage}</p>
        ) : null}
      </div>
      {log.status === 'FAILED' ? (
        <button className="button button-primary" disabled={isRetrying} onClick={onRetry} type="button">
          <RotateCcw className="h-4 w-4" />
          {isRetrying ? 'Retrying' : 'Retry'}
        </button>
      ) : null}
    </article>
  );
}

function statusClass(status: AutomationStatus) {
  if (status === 'SUCCEEDED') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (status === 'FAILED') {
    return 'bg-red-100 text-red-800';
  }

  if (status === 'SENT') {
    return 'bg-sky-100 text-sky-800';
  }

  return 'bg-amber-100 text-amber-800';
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
