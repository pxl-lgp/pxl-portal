'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Megaphone, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/errors';
import { getCampaign, getClients, updateCampaign } from '@/lib/api';
import { Campaign, CampaignPayload, CampaignStatus } from '@/lib/types';

const statuses: CampaignStatus[] = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED'];

type CampaignFormValues = {
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

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const campaignQuery = useQuery({
    queryKey: ['campaigns', params.id],
    queryFn: () => getCampaign(params.id),
  });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const campaign = campaignQuery.data;
  const clients = clientsQuery.data ?? [];
  const clientName = clients.find((client) => client.id === campaign?.clientId)?.businessName;

  // Derive the form from the loaded campaign until the user starts editing, so we
  // never sync state in an effect.
  const [edited, setEdited] = useState<CampaignFormValues | null>(null);
  const values = edited ?? (campaign ? toFormValues(campaign) : EMPTY_VALUES);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CampaignPayload>) => updateCampaign(params.id, payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(['campaigns', params.id], updated);
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  function updateValue<K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) {
    setEdited({ ...values, [key]: value });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateMutation.mutate({
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

  if (campaignQuery.isLoading) {
    return <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Loading campaign.</div>;
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        Campaign not found.
      </div>
    );
  }

  return (
    <>
      <div>
        <Link className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/admin/campaigns">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
          <span className="w-fit rounded-full border px-2.5 py-1 text-xs font-semibold">{campaign.status}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientName ?? 'Unknown client'} &middot; updated {new Date(campaign.updatedAt).toLocaleString()}
        </p>
      </div>

      {updateMutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {getApiErrorMessage(updateMutation.error, 'Update failed.')}
        </div>
      ) : null}
      {updateMutation.isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Campaign updated.
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <h2 className="font-semibold">Edit campaign</h2>
          </div>
          <form className="rounded-xl border bg-card p-4 shadow-sm grid gap-4" onSubmit={submit}>
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
            <Button disabled={updateMutation.isPending || !values.name.trim()} type="submit">
              <Save className="size-4" />
              {updateMutation.isPending ? 'Saving' : 'Save changes'}
            </Button>
          </form>
        </aside>
      </section>
    </>
  );
}

const EMPTY_VALUES: CampaignFormValues = {
  name: '', status: 'PLANNED', goal: '', budget: '', audience: '', offer: '', notes: '', startsAt: '', endsAt: '',
};

function toFormValues(campaign: Campaign): CampaignFormValues {
  return {
    name: campaign.name,
    status: campaign.status,
    goal: campaign.goal ?? '',
    budget: campaign.budget ?? '',
    audience: campaign.audience ?? '',
    offer: campaign.offer ?? '',
    notes: campaign.notes ?? '',
    startsAt: toInputDate(campaign.startsAt),
    endsAt: toInputDate(campaign.endsAt),
  };
}

function toInputDate(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
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
