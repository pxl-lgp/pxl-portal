'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDownWideNarrow,
  CheckCircle2,
  Clock3,
  RefreshCw,
  RotateCcw,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { convertLead, getLeads, updateLead } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { Lead, LeadScoreBand, LeadStatus } from '@/lib/types';

type SortMode = 'score' | 'recent';

const statusActions: Array<{ label: string; status: LeadStatus; icon: React.ReactNode }> = [
  { label: 'Contacted', status: 'CONTACTED', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Qualified', status: 'QUALIFIED', icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: 'Lost', status: 'LOST', icon: <XCircle className="h-4 w-4" /> },
];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const leadsQuery = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLead(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
  const convertMutation = useMutation({
    mutationFn: convertLead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['leads'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['automation', 'logs'] }),
      ]);
    },
  });
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const leads = useMemo(() => {
    const rows = [...(leadsQuery.data ?? [])];

    if (sortMode === 'score') {
      return rows.sort(
        (a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leadsQuery.data, sortMode]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review inquiries, qualify prospects, and convert wins</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="button button-secondary"
            onClick={() => setSortMode((current) => (current === 'score' ? 'recent' : 'score'))}
            type="button"
          >
            {sortMode === 'score' ? <ArrowDownWideNarrow className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
            Sort: {sortMode === 'score' ? 'Hottest first' : 'Most recent'}
          </button>
          <button className="button button-secondary" onClick={() => leadsQuery.refetch()} type="button">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {updateMutation.isError ? (
        <ErrorPanel message={getApiErrorMessage(updateMutation.error, 'Lead update failed.')} />
      ) : null}
      {convertMutation.isError ? (
        <ErrorPanel message={getApiErrorMessage(convertMutation.error, 'Lead conversion failed.')} />
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
          <UserPlus className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Lead list</h2>
        </div>
        {leadsQuery.isError ? (
          <ErrorPanel message="Unable to load leads." />
        ) : leads.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
            No leads yet.
          </div>
        ) : (
          <div className="grid">
            {leads.map((lead) => (
              <LeadRow
                convertBusy={convertMutation.isPending}
                key={lead.id}
                lead={lead}
                onConvert={() => convertMutation.mutate(lead.id)}
                onStatus={(status) => updateMutation.mutate({ id: lead.id, status })}
                updateBusy={updateMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function LeadRow({
  convertBusy,
  lead,
  onConvert,
  onStatus,
  updateBusy,
}: {
  convertBusy: boolean;
  lead: Lead;
  onConvert: () => void;
  onStatus: (status: LeadStatus) => void;
  updateBusy: boolean;
}) {
  return (
    <article className="grid gap-4 border-t border-[var(--border)] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black">{lead.businessName}</h3>
            <span className={`badge ${scoreBandClass(lead.scoreBand)}`} title={`Lead score ${lead.score}/100`}>
              {lead.scoreBand} · {lead.score}
            </span>
            <span className={`badge ${statusClass(lead.status)}`}>{lead.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.contactPerson ?? 'No contact name'} / {lead.email}
            {lead.phone ? ` / ${lead.phone}` : ''}
          </p>
          {lead.scoreReasons.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {lead.scoreReasons.map((reason) => (
                <li
                  className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-1 text-xs text-foreground/70"
                  key={reason}
                >
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
          {lead.message ? <p className="mt-3 text-sm text-foreground/80">{lead.message}</p> : null}
          <p className="mt-2 text-xs font-bold uppercase text-muted-foreground">
            {lead.source ?? 'Unknown source'} / {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusActions.map((action) => (
            <button
              className="button button-secondary"
              disabled={updateBusy || lead.status === action.status || lead.status === 'WON'}
              key={action.status}
              onClick={() => onStatus(action.status)}
              type="button"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          <button
            className="button button-primary"
            disabled={convertBusy || lead.status === 'WON'}
            onClick={onConvert}
            type="button"
          >
            {lead.status === 'WON' ? <RotateCcw className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {lead.status === 'WON' ? 'Converted' : 'Convert'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function scoreBandClass(band: LeadScoreBand) {
  if (band === 'HOT') {
    return 'bg-red-100 text-red-800';
  }

  if (band === 'WARM') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-slate-100 text-slate-700';
}

function statusClass(status: LeadStatus) {
  if (status === 'WON') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (status === 'LOST') {
    return 'bg-red-100 text-red-800';
  }

  if (status === 'QUALIFIED') {
    return 'bg-sky-100 text-sky-800';
  }

  if (status === 'CONTACTED') {
    return 'bg-violet-100 text-violet-800';
  }

  return 'bg-amber-100 text-amber-800';
}
