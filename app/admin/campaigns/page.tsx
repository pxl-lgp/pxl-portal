'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CalendarRange, Megaphone, RefreshCw, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/errors';
import { createCampaign, getCampaigns, getClients } from '@/lib/api';
import { CampaignPayload, CampaignStatus } from '@/lib/types';

const statuses: CampaignStatus[] = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED'];

type CampaignFormValues = {
  clientId: string;
  name: string;
  status: CampaignStatus;
  goal: string;
  budget: string;
  audience: string;
  offer: string;
  notes: string;
  startsAt: string;
  endsAt: string;
};

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ clientId: '', status: '', q: '' });
  const campaignsQuery = useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => getCampaigns(filters),
  });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const campaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const [values, setValues] = useState<CampaignFormValues>(() => emptyValues(clients[0]?.id));
  const createMutation = useMutation({
    mutationFn: (payload: CampaignPayload) => createCampaign(payload),
    onSuccess: async () => {
      setValues(emptyValues(values.clientId));
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => ['PLANNED', 'ACTIVE'].includes(campaign.status)).length,
    [campaigns],
  );
  const selectedClientId = values.clientId || clients[0]?.id || '';

  function updateValue<K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClientId) {
      return;
    }

    createMutation.mutate({
      clientId: selectedClientId,
      name: values.name.trim(),
      status: values.status,
      goal: values.goal.trim() || undefined,
      budget: values.budget.trim() || undefined,
      audience: values.audience.trim() || undefined,
      offer: values.offer.trim() || undefined,
      notes: values.notes.trim() || undefined,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : undefined,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Group content by objective, budget, audience, and timeline.</p>
        </div>
        <Button onClick={() => campaignsQuery.refetch()} type="button" variant="outline">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Campaigns" value={campaigns.length} />
        <Metric label="Planned / Active" value={activeCampaigns} />
        <Metric label="Clients" value={new Set(campaigns.map((campaign) => campaign.clientId)).size} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Campaign List</h2>
          </div>
          <div className="grid gap-3 border-b p-4 md:grid-cols-3">
            <select className="select" onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} value={filters.clientId}>
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.businessName}</option>
              ))}
            </select>
            <select className="select" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} value={filters.status}>
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input className="input" onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search campaign" value={filters.q} />
          </div>
          {campaignsQuery.isError ? (
            <ErrorPanel message="Unable to load campaigns." />
          ) : campaigns.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">No campaigns yet.</div>
          ) : (
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <article className="grid gap-3 p-4" key={campaign.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{clientById.get(campaign.clientId)?.businessName ?? 'Unknown client'}</p>
                    </div>
                    <span className="w-fit rounded-full border px-2.5 py-1 text-xs font-semibold">{campaign.status}</span>
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <Info label="Goal" value={campaign.goal ?? 'Not set'} />
                    <Info label="Budget" value={campaign.budget ?? 'Not set'} />
                    <Info label="Audience" value={campaign.audience ?? 'Not set'} />
                    <Info label="Offer" value={campaign.offer ?? 'Not set'} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarRange className="size-3.5" />
                    {formatDate(campaign.startsAt)} - {formatDate(campaign.endsAt)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <h2 className="font-semibold">Create Campaign</h2>
          </div>
          {clients.length === 0 ? <ErrorPanel message="Create a client before adding campaigns." /> : null}
          {createMutation.isError ? <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Campaign creation failed.')} /> : null}
          {createMutation.isSuccess ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Campaign saved.</div> : null}
          <form className="rounded-xl border bg-card p-4 shadow-sm grid gap-4" onSubmit={submit}>
            <Field label="Client">
              <select className="select" onChange={(event) => updateValue('clientId', event.target.value)} required value={selectedClientId}>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.businessName}</option>)}
              </select>
            </Field>
            <TextField label="Campaign name" onChange={(value) => updateValue('name', value)} required value={values.name} />
            <Field label="Status">
              <select className="select" onChange={(event) => updateValue('status', event.target.value as CampaignStatus)} value={values.status}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Start date" onChange={(value) => updateValue('startsAt', value)} type="date" value={values.startsAt} />
              <TextField label="End date" onChange={(value) => updateValue('endsAt', value)} type="date" value={values.endsAt} />
            </div>
            <TextField label="Budget" onChange={(value) => updateValue('budget', value)} value={values.budget} />
            <TextArea label="Goal" onChange={(value) => updateValue('goal', value)} value={values.goal} />
            <TextArea label="Target audience" onChange={(value) => updateValue('audience', value)} value={values.audience} />
            <TextArea label="Offer" onChange={(value) => updateValue('offer', value)} value={values.offer} />
            <TextArea label="Notes" onChange={(value) => updateValue('notes', value)} value={values.notes} />
            <Button disabled={createMutation.isPending || !selectedClientId} type="submit">
              <Save className="size-4" />
              {createMutation.isPending ? 'Saving' : 'Save campaign'}
            </Button>
          </form>
        </aside>
      </section>
    </>
  );
}

function emptyValues(clientId = ''): CampaignFormValues {
  return { clientId, name: '', status: 'PLANNED', goal: '', budget: '', audience: '', offer: '', notes: '', startsAt: '', endsAt: '' };
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-card p-4 shadow-sm"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></div>;
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}{children}</label>;
}

function TextField({ label, onChange, required, type = 'text', value }: { label: string; onChange: (value: string) => void; required?: boolean; type?: string; value: string }) {
  return <Field label={label}><input className="input" onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} /></Field>;
}

function TextArea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return <Field label={label}><textarea className="textarea" onChange={(event) => onChange(event.target.value)} value={value} /></Field>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="font-medium text-foreground">{label}:</span> {value}</div>;
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 size-4 shrink-0" />{message}</div>;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not set';
}
