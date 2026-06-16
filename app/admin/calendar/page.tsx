'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { Button } from '@/components/ui/button';
import { getCampaigns, getClients, getContentItems } from '@/lib/api';
import { ContentItem } from '@/lib/types';

const statusOptions = [
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

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [filters, setFilters] = useState({ clientId: '', campaignId: '', status: '', platform: '', q: '' });
  const contentQuery = useQuery({
    queryKey: ['content'],
    queryFn: () => getContentItems(),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns(),
  });
  const contentItems = useMemo(() => contentQuery.data ?? [], [contentQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const campaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const platforms = useMemo(
    () =>
      Array.from(
        new Set(
          contentItems
            .flatMap((item) => [item.platform, ...item.platforms])
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [contentItems],
  );
  const visibleItems = useMemo(
    () => contentItems.filter((item) => matchesFilters(item, filters)),
    [contentItems, filters],
  );
  const scheduledItems = visibleItems.filter((item) => item.scheduledAt || item.publishedAt);
  const unscheduledItems = visibleItems.filter((item) => !item.scheduledAt && !item.publishedAt);
  const days = useMemo(() => buildCalendarDays(cursor), [cursor]);
  const itemsByDay = useMemo(() => {
    const byDay = new Map<string, ContentItem[]>();

    for (const item of scheduledItems) {
      const date = item.scheduledAt ?? item.publishedAt;

      if (!date) {
        continue;
      }

      const key = toDayKey(new Date(date));
      byDay.set(key, [...(byDay.get(key) ?? []), item]);
    }

    return byDay;
  }, [scheduledItems]);

  function shiftMonth(offset: number) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, review, and jump into scheduled content across clients and platforms.
          </p>
        </div>
        <Button onClick={() => contentQuery.refetch()} type="button" variant="outline">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4 text-primary" />
          Filters
        </div>
        <div className="grid gap-3 md:grid-cols-5">
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
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <select
            className="select"
            onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value }))}
            value={filters.platform}
          >
            <option value="">All platforms</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <input
            className="input"
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Search title or caption"
            value={filters.q}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">{formatMonth(cursor)}</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => shiftMonth(-1)} type="button" variant="outline">
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button onClick={() => setCursor(startOfMonth(new Date()))} type="button" variant="outline">
              Today
            </Button>
            <Button onClick={() => shiftMonth(1)} type="button" variant="outline">
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {contentQuery.isLoading || clientsQuery.isLoading || campaignsQuery.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading calendar.</div>
        ) : contentQuery.isError || clientsQuery.isError || campaignsQuery.isError ? (
          <div className="p-6 text-sm text-destructive">Unable to load calendar data.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-7 border-b bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div className="border-r p-3 last:border-r-0" key={day}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid min-w-[980px] grid-cols-7">
              {days.map((day) => {
                const dayItems = itemsByDay.get(toDayKey(day.date)) ?? [];

                return (
                  <div
                    className={`min-h-40 border-b border-r p-3 last:border-r-0 ${
                      day.inMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'
                    }`}
                    key={day.key}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={isToday(day.date) ? 'grid size-7 place-items-center rounded-full bg-primary text-primary-foreground' : ''}>
                        {day.date.getDate()}
                      </span>
                      {dayItems.length > 0 ? <span className="text-xs text-muted-foreground">{dayItems.length}</span> : null}
                    </div>
                    <div className="grid gap-2">
                      {dayItems.slice(0, 4).map((item) => (
                        <CalendarItem
                          clientName={clientById.get(item.clientId)?.businessName ?? 'Unknown client'}
                          campaignName={item.campaignId ? campaignById.get(item.campaignId)?.name : undefined}
                          item={item}
                          key={item.id}
                        />
                      ))}
                      {dayItems.length > 4 ? (
                        <div className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                          +{dayItems.length - 4} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Unscheduled Content</h2>
          <p className="mt-1 text-sm text-muted-foreground">Items matching the filters with no scheduled or published date.</p>
        </div>
        {unscheduledItems.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No unscheduled content matches the current filters.</div>
        ) : (
          <div className="divide-y">
            {unscheduledItems.map((item) => (
              <Link
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                href={`/admin/content/${item.id}`}
                key={item.id}
              >
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {clientById.get(item.clientId)?.businessName ?? 'Unknown client'} / {item.contentType}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <ContentStatusBadge status={item.status} />
                  <ExternalLink className="size-4 text-muted-foreground" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CalendarItem({ campaignName, clientName, item }: { campaignName?: string; clientName: string; item: ContentItem }) {
  const date = item.scheduledAt ?? item.publishedAt;

  return (
    <Link className="block rounded-lg border bg-card p-2 text-xs shadow-sm transition-colors hover:bg-muted/60" href={`/admin/content/${item.id}`}>
      <div className="font-semibold leading-snug">{item.title}</div>
      <div className="mt-1 text-muted-foreground">{clientName}</div>
      {campaignName ? <div className="mt-1 text-muted-foreground">{campaignName}</div> : null}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <ContentStatusBadge status={item.status} />
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
        </span>
      </div>
    </Link>
  );
}

function matchesFilters(item: ContentItem, filters: { campaignId: string; clientId: string; status: string; platform: string; q: string }) {
  const query = filters.q.trim().toLowerCase();
  const platforms = [item.platform, ...item.platforms].filter(Boolean);

  return (
    (!filters.clientId || item.clientId === filters.clientId) &&
    (!filters.campaignId || item.campaignId === filters.campaignId) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.platform || platforms.includes(filters.platform)) &&
    (!query || `${item.title} ${item.caption ?? ''}`.toLowerCase().includes(query))
  );
}

function buildCalendarDays(cursor: Date) {
  const first = startOfMonth(cursor);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      inMonth: date.getMonth() === cursor.getMonth(),
      key: toDayKey(date),
    };
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isToday(date: Date) {
  return toDayKey(date) === toDayKey(new Date());
}

function formatMonth(date: Date) {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}
