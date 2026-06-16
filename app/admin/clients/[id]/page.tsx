'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getClient, updateClient } from '@/lib/api';
import { ClientPayload } from '@/lib/types';
import { ClientForm } from '@/components/portal/client-form';
import { ClientOnboardingPanel } from '@/components/portal/client-onboarding-panel';
import { ContentPillarsPanel } from '@/components/portal/content-pillars-panel';
import { StatusBadge } from '@/components/portal/status-badge';
import { getApiErrorMessage } from '@/lib/errors';
import { DriveBrowser } from '@/components/portal/drive-browser';
import { SocialConnectionsPanel } from '@/components/portal/social-connections-panel';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const clientQuery = useQuery({
    queryKey: ['clients', params.id],
    queryFn: () => getClient(params.id),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: ClientPayload) => updateClient(params.id, payload),
    onSuccess: async (client) => {
      queryClient.setQueryData(['clients', params.id], client);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  const client = clientQuery.data;

  if (clientQuery.isLoading) {
    return <div className="panel p-5 text-sm text-muted-foreground">Loading client.</div>;
  }

  if (clientQuery.isError || !client) {
    return (
      <div className="panel flex items-start gap-2 p-5 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Client not found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-dark)]" href="/admin/clients">
            <ArrowLeft className="h-4 w-4" />
            Clients
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black">{client.businessName}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated {new Date(client.updatedAt).toLocaleString()}
          </p>
        </div>
        {client.driveFolderUrl ? (
          <a className="button button-secondary" href={client.driveFolderUrl} rel="noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Drive
          </a>
        ) : null}
      </div>

      {updateMutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {getApiErrorMessage(updateMutation.error, 'Update failed.')}
        </div>
      ) : null}
      {updateMutation.isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Client updated.
        </div>
      ) : null}

      <ClientOnboardingPanel client={client} />
      <ContentPillarsPanel clientId={client.id} />
      <ClientForm client={client} isSaving={updateMutation.isPending} onSubmit={(payload) => updateMutation.mutate(payload)} />
      <SocialConnectionsPanel clientId={client.id} />
      <DriveBrowser clientId={client.id} driveUrl={client.driveFolderUrl} />
    </>
  );
}
