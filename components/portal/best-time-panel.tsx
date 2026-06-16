'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock4, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { getBestTimes } from '@/lib/api';
import { Client } from '@/lib/types';

export function BestTimePanel({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState('');
  const bestTimeQuery = useQuery({
    queryKey: ['analytics', 'best-times', clientId || 'all'],
    queryFn: () => getBestTimes(clientId || undefined),
  });
  const result = bestTimeQuery.data;

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Clock4 className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Best time to post</h2>
        </div>
        <select className="select sm:w-64" onChange={(event) => setClientId(event.target.value)} value={clientId}>
          <option value="">All clients (overall)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.businessName}
            </option>
          ))}
        </select>
      </div>

      {bestTimeQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Calculating best posting times.</p>
      ) : bestTimeQuery.isError ? (
        <p className="text-sm text-red-800">Unable to load best-time analysis.</p>
      ) : !result || result.topSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {result?.note ?? 'Not enough published-content engagement data yet to recommend posting times.'}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.topSlots.slice(0, 6).map((slot, index) => (
              <div
                className="rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-4"
                key={`${slot.weekday}-${slot.hour}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-muted-foreground">#{index + 1}</span>
                  {index === 0 ? <TrendingUp className="h-4 w-4 text-[var(--brand)]" /> : null}
                </div>
                <div className="mt-1 text-lg font-black">
                  {slot.weekdayLabel} · {formatHour(slot.hour)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Avg engagement {Math.round(slot.avgEngagement).toLocaleString()} · {slot.sampleSize} post
                  {slot.sampleSize === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {result.sampleSize} published post{result.sampleSize === 1 ? '' : 's'} with recorded engagement.
            {result.note ? ` ${result.note}` : ''}
          </p>
        </>
      )}
    </section>
  );
}

function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;

  return `${display}:00 ${suffix}`;
}
