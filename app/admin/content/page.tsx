'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckSquare, FileText, RefreshCw, Send } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ContentForm } from '@/components/portal/content-form';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { createApproval, createContentItem, getCampaigns, getClients, getContentItems, scheduleContentItem, updateContentItem } from '@/lib/api';
import { ContentPayload, ContentStatus } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

const CONTENT_STATUSES = [
  'IDEA',
  'DRAFTING',
  'DESIGNING',
  'INTERNAL_REVIEW',
  'CLIENT_APPROVAL',
  'APPROVED',
  'REVISION_REQUESTED',
  'SCHEDULED',
  'PUBLISHED',
  'REPORTED',
];

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ clientId: '', campaignId: '', status: '', q: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ContentStatus>('DRAFTING');
  const [bulkScheduledAt, setBulkScheduledAt] = useState('');
  const contentQuery = useQuery({
    queryKey: ['content', filters],
    queryFn: () => getContentItems(filters),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns(),
  });
  const createMutation = useMutation({
    mutationFn: (payload: ContentPayload) => createContentItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
  const contentItems = useMemo(() => contentQuery.data ?? [], [contentQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const campaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const selectedItems = useMemo(
    () => contentItems.filter((item) => selectedIds.includes(item.id)),
    [contentItems, selectedIds],
  );
  const allVisibleSelected = contentItems.length > 0 && contentItems.every((item) => selectedIds.includes(item.id));
  const bulkStatusMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedItems.map((item) => updateContentItem(item.id, { status: bulkStatus, clientId: item.clientId, title: item.title, contentType: item.contentType })));
    },
    onSuccess: handleBulkSuccess,
  });
  const bulkScheduleMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = new Date(bulkScheduledAt).toISOString();
      await Promise.all(selectedItems.map((item) => scheduleContentItem(item.id, scheduledAt)));
    },
    onSuccess: handleBulkSuccess,
  });
  const bulkApprovalMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedItems.map((item) => createApproval({ contentItemId: item.id })));
    },
    onSuccess: handleBulkSuccess,
  });
  const bulkError = bulkStatusMutation.error ?? bulkScheduleMutation.error ?? bulkApprovalMutation.error;
  const isBulkBusy = bulkStatusMutation.isPending || bulkScheduleMutation.isPending || bulkApprovalMutation.isPending;

  async function handleBulkSuccess() {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: ['content'] });
    await queryClient.invalidateQueries({ queryKey: ['approvals'] });
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds(checked ? contentItems.map((item) => item.id) : []);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Posts, reels, carousels, captions, and status tracking</p>
        </div>
        <button className="button button-secondary" onClick={() => contentQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="font-black">Content list</h2>
          </div>
          <div className="grid gap-3 border-b border-[var(--border)] bg-[var(--panel-muted)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold">
                {selectedIds.length} selected
              </div>
              <button className="button button-secondary" disabled={selectedIds.length === 0 || isBulkBusy} onClick={() => setSelectedIds([])} type="button">
                Clear selection
              </button>
            </div>
            {bulkError ? <ErrorPanel message={getApiErrorMessage(bulkError, 'Bulk action failed.')} /> : null}
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <select className="select" onChange={(event) => setBulkStatus(event.target.value as ContentStatus)} value={bulkStatus}>
                {CONTENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="button button-secondary" disabled={selectedIds.length === 0 || isBulkBusy} onClick={() => bulkStatusMutation.mutate()} type="button">
                <CheckSquare className="h-4 w-4" />
                Apply status
              </button>
              <button className="button button-primary" disabled={selectedIds.length === 0 || isBulkBusy} onClick={() => bulkApprovalMutation.mutate()} type="button">
                <Send className="h-4 w-4" />
                Send for approval
              </button>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input className="input" onChange={(event) => setBulkScheduledAt(event.target.value)} type="datetime-local" value={bulkScheduledAt} />
              <button className="button button-secondary" disabled={selectedIds.length === 0 || !bulkScheduledAt || isBulkBusy} onClick={() => bulkScheduleMutation.mutate()} type="button">
                Schedule selected
              </button>
            </div>
          </div>
          <div className="grid gap-3 border-b border-[var(--border)] p-4 sm:grid-cols-4">
            <select
              className="select"
              onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))}
              value={filters.clientId}
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.businessName}
                </option>
              ))}
            </select>
            <select
              className="select"
              onChange={(event) => setFilters((current) => ({ ...current, campaignId: event.target.value }))}
              value={filters.campaignId}
            >
              <option value="">All campaigns</option>
              {campaigns
                .filter((campaign) => !filters.clientId || campaign.clientId === filters.clientId)
                .map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
            </select>
            <select
              className="select"
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              value={filters.status}
            >
              <option value="">All statuses</option>
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              className="input"
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Search title"
              value={filters.q}
            />
          </div>
          {contentQuery.isError ? (
            <ErrorPanel message="Unable to load content." />
          ) : contentItems.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No content items yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        aria-label="Select all visible content"
                        checked={allVisibleSelected}
                        onChange={(event) => toggleAllVisible(event.target.checked)}
                        type="checkbox"
                      />
                    </th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr className="border-t border-[var(--border)]" key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          aria-label={`Select ${item.title}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={(event) => toggleSelected(item.id, event.target.checked)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link className="font-bold text-[var(--brand-dark)]" href={`/admin/content/${item.id}`}>
                          {item.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {item.contentType}
                          {item.platform ? ` / ${item.platform}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {clientById.get(item.clientId)?.businessName ?? 'Unknown client'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.campaignId ? campaignById.get(item.campaignId)?.name ?? 'Unknown campaign' : 'No campaign'}
                      </td>
                      <td className="px-4 py-3">
                        <ContentStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'Not scheduled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create content</h2>
          </div>
          {clients.length === 0 ? <ErrorPanel message="Create a client before adding content." /> : null}
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Content creation failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Content saved.
            </div>
          ) : null}
          <ContentForm
            clients={clients}
            isSaving={createMutation.isPending}
            onSubmit={(payload) => createMutation.mutate(payload)}
          />
        </aside>
      </section>
    </>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="m-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
