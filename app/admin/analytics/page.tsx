'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, BarChart3, LineChart, Pencil, RefreshCw, Save, Sparkles, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import {
  analyzePerformance,
  createAnalyticsRecord,
  getAnalyticsRecords,
  getClients,
  getContentItems,
  updateAnalyticsRecord,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { AnalyticsPayload, AnalyticsRecord } from '@/lib/types';
import { BestTimePanel } from '@/components/portal/best-time-panel';

type AnalyticsFormValues = {
  contentItemId: string;
  reach: string;
  impressions: string;
  engagement: string;
  clicks: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  followersGained: string;
  capturedAt: string;
};

const emptyValues: AnalyticsFormValues = {
  contentItemId: '',
  reach: '0',
  impressions: '0',
  engagement: '0',
  clicks: '0',
  likes: '0',
  comments: '0',
  shares: '0',
  saves: '0',
  followersGained: '0',
  capturedAt: toInputDateTime(new Date().toISOString()),
};

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const analyticsQuery = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalyticsRecords,
  });
  const contentQuery = useQuery({
    queryKey: ['content'],
    queryFn: () => getContentItems(),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const analyticsRecords = useMemo(() => analyticsQuery.data ?? [], [analyticsQuery.data]);
  const contentItems = useMemo(() => contentQuery.data ?? [], [contentQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const contentById = new Map(contentItems.map((item) => [item.id, item]));
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const reportableContent = contentItems.filter((item) => ['PUBLISHED', 'REPORTED'].includes(item.status));
  const [values, setValues] = useState<AnalyticsFormValues>({
    ...emptyValues,
    contentItemId: reportableContent[0]?.id ?? '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: (payload: AnalyticsPayload) => createAnalyticsRecord(payload),
    onSuccess: async () => {
      setValues({
        ...emptyValues,
        contentItemId: values.contentItemId,
      });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AnalyticsPayload> }) =>
      updateAnalyticsRecord(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      setValues((current) => ({ ...emptyValues, contentItemId: current.contentItemId }));
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
  const saveMutation = editingId ? updateMutation : createMutation;
  const totals = useMemo(
    () =>
      analyticsRecords.reduce(
        (current, record) => ({
          reach: current.reach + record.reach,
          impressions: current.impressions + record.impressions,
          engagement: current.engagement + record.engagement,
          clicks: current.clicks + record.clicks,
          likes: current.likes + record.likes,
          comments: current.comments + record.comments,
          shares: current.shares + record.shares,
          saves: current.saves + record.saves,
          followersGained: current.followersGained + record.followersGained,
        }),
        {
          reach: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          followersGained: 0,
        },
      ),
    [analyticsRecords],
  );
  const insightsMutation = useMutation({
    mutationFn: () =>
      analyzePerformance({ clientName: 'All tracked content', metrics: totals }),
  });

  function updateValue<K extends keyof AnalyticsFormValues>(key: K, value: AnalyticsFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startEdit(record: AnalyticsRecord) {
    setEditingId(record.id);
    setValues({
      contentItemId: record.contentItemId,
      reach: String(record.reach),
      impressions: String(record.impressions),
      engagement: String(record.engagement),
      clicks: String(record.clicks),
      likes: String(record.likes),
      comments: String(record.comments),
      shares: String(record.shares),
      saves: String(record.saves),
      followersGained: String(record.followersGained),
      capturedAt: toInputDateTime(record.capturedAt),
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setValues((current) => ({ ...emptyValues, contentItemId: current.contentItemId }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.contentItemId) {
      return;
    }

    const payload: AnalyticsPayload = {
      contentItemId: values.contentItemId,
      reach: toNumber(values.reach),
      impressions: toNumber(values.impressions),
      engagement: toNumber(values.engagement),
      clicks: toNumber(values.clicks),
      likes: toNumber(values.likes),
      comments: toNumber(values.comments),
      shares: toNumber(values.shares),
      saves: toNumber(values.saves),
      followersGained: toNumber(values.followersGained),
      capturedAt: values.capturedAt ? new Date(values.capturedAt).toISOString() : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manual performance tracking for published content</p>
        </div>
        <button className="button button-secondary" onClick={() => analyticsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Reach" value={totals.reach} />
        <Metric label="Impressions" value={totals.impressions} />
        <Metric label="Engagement" value={totals.engagement} />
        <Metric label="Clicks" value={totals.clicks} />
      </section>

      <section className="panel grid gap-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">AI performance insights</h2>
          </div>
          <button
            className="button button-primary w-fit"
            disabled={insightsMutation.isPending || analyticsRecords.length === 0}
            onClick={() => insightsMutation.mutate()}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            {insightsMutation.isPending ? 'Analyzing' : 'Generate insights'}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Summarizes all tracked metrics into plain-English insights and recommendations. Always review before sharing
          with a client.
        </p>
        {analyticsRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add some performance metrics first.</p>
        ) : null}
        {insightsMutation.isError ? (
          <ErrorPanel message={getApiErrorMessage(insightsMutation.error, 'Could not generate insights.')} />
        ) : null}
        {insightsMutation.data ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm">{insightsMutation.data.output}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Generated by {insightsMutation.data.model === 'fallback' ? 'built-in analysis' : insightsMutation.data.model}.
            </p>
          </div>
        ) : null}
      </section>

      <BestTimePanel clients={clients} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
            <LineChart className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Performance records</h2>
          </div>
          {analyticsQuery.isError ? (
            <ErrorPanel message="Unable to load analytics records." />
          ) : analyticsRecords.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No analytics records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Content</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Reach</th>
                    <th className="px-4 py-3">Engagement</th>
                    <th className="px-4 py-3">Captured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsRecords.map((record) => {
                    const contentItem = contentById.get(record.contentItemId);
                    const client = contentItem ? clientById.get(contentItem.clientId) : undefined;

                    return (
                      <tr className="border-t border-[var(--border)]" key={record.id}>
                        <td className="px-4 py-3">
                          <div className="font-bold">{contentItem?.title ?? 'Unknown content'}</div>
                          <div className="text-xs text-muted-foreground">
                            {contentItem?.platform ?? 'No platform'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {client?.businessName ?? 'Unknown client'}
                        </td>
                        <td className="px-4 py-3">{record.reach.toLocaleString()}</td>
                        <td className="px-4 py-3">{record.engagement.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(record.capturedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="button button-secondary" onClick={() => startEdit(record)} type="button">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="font-black">{editingId ? 'Edit metrics' : 'Add metrics'}</h2>
            </div>
            {editingId ? (
              <button className="button button-secondary" onClick={cancelEdit} type="button">
                <X className="h-4 w-4" />
                Cancel
              </button>
            ) : null}
          </div>
          {saveMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(saveMutation.error, 'Analytics save failed.')} />
          ) : null}
          {saveMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Metrics saved.
            </div>
          ) : null}
          <form className="panel grid gap-4 p-5" onSubmit={submit}>
            <div className="field">
              <label htmlFor="contentItemId">Published content</label>
              <select
                className="select"
                disabled={reportableContent.length === 0}
                id="contentItemId"
                onChange={(event) => updateValue('contentItemId', event.target.value)}
                value={values.contentItemId}
              >
                {reportableContent.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            {reportableContent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Mark content as published before adding metrics.</p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Reach" onChange={(value) => updateValue('reach', value)} value={values.reach} />
              <NumberField
                label="Impressions"
                onChange={(value) => updateValue('impressions', value)}
                value={values.impressions}
              />
              <NumberField
                label="Engagement"
                onChange={(value) => updateValue('engagement', value)}
                value={values.engagement}
              />
              <NumberField label="Clicks" onChange={(value) => updateValue('clicks', value)} value={values.clicks} />
              <NumberField label="Likes" onChange={(value) => updateValue('likes', value)} value={values.likes} />
              <NumberField
                label="Comments"
                onChange={(value) => updateValue('comments', value)}
                value={values.comments}
              />
              <NumberField label="Shares" onChange={(value) => updateValue('shares', value)} value={values.shares} />
              <NumberField label="Saves" onChange={(value) => updateValue('saves', value)} value={values.saves} />
              <NumberField
                label="Followers gained"
                onChange={(value) => updateValue('followersGained', value)}
                value={values.followersGained}
              />
              <div className="field">
                <label htmlFor="capturedAt">Captured at</label>
                <input
                  className="input"
                  id="capturedAt"
                  onChange={(event) => updateValue('capturedAt', event.target.value)}
                  type="datetime-local"
                  value={values.capturedAt}
                />
              </div>
            </div>
            <button
              className="button button-primary"
              disabled={saveMutation.isPending || !values.contentItemId}
              type="submit"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving' : editingId ? 'Update metrics' : 'Save metrics'}
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel p-5">
      <div className="text-sm font-bold text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-black">{value.toLocaleString()}</div>
    </div>
  );
}

function NumberField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  const id = label.toLowerCase().replaceAll(' ', '-');

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="input"
        id={id}
        min="0"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
    </div>
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

function toNumber(value: string) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function toInputDateTime(value: string) {
  return value.slice(0, 16);
}
