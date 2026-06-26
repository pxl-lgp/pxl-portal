'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, KeyRound, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  createClientPortalUser,
  disableClientPortalUser,
  getClient,
  sendClientPortalPasswordReset,
  unlinkClientPortalUser,
  updateClient,
} from '@/lib/api';
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
  const createPortalUserMutation = useMutation({
    mutationFn: () => createClientPortalUser(params.id),
    onSuccess: async (client) => {
      queryClient.setQueryData(['clients', params.id], client);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  const resetPortalUserMutation = useMutation({
    mutationFn: () => sendClientPortalPasswordReset(params.id),
  });
  const disablePortalUserMutation = useMutation({
    mutationFn: () => disableClientPortalUser(params.id),
    onSuccess: async (client) => {
      queryClient.setQueryData(['clients', params.id], client);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  const unlinkPortalUserMutation = useMutation({
    mutationFn: () => unlinkClientPortalUser(params.id),
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
        <div className="flex flex-wrap gap-2">
          <Link className="button button-secondary" href={`/admin/workspace?clientId=${client.id}`}>
            Workspace
          </Link>
          {client.driveFolderUrl ? (
            <a className="button button-secondary" href={client.driveFolderUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="h-4 w-4" />
              Drive
            </a>
          ) : null}
        </div>
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

      <section className="panel grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-black">Client portal access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {client.userId
                ? `Linked to ${client.portalUserEmail ?? 'a portal user'} (${client.portalUserStatus ?? 'unknown'}).`
                : 'Create a linked client portal account before sending access.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {client.userId ? (
              <>
                <button
                  className="button button-secondary"
                  disabled={resetPortalUserMutation.isPending}
                  onClick={() => resetPortalUserMutation.mutate()}
                  type="button"
                >
                  <KeyRound className="h-4 w-4" />
                  {resetPortalUserMutation.isPending ? 'Sending reset' : 'Send password reset'}
                </button>
                <button
                  className="button button-secondary"
                  disabled={disablePortalUserMutation.isPending || client.portalUserStatus === 'DISABLED'}
                  onClick={() => disablePortalUserMutation.mutate()}
                  type="button"
                >
                  {disablePortalUserMutation.isPending ? 'Disabling' : 'Disable access'}
                </button>
                <button
                  className="button button-secondary text-red-700"
                  disabled={unlinkPortalUserMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Unlink this portal user from the client profile?')) {
                      unlinkPortalUserMutation.mutate();
                    }
                  }}
                  type="button"
                >
                  {unlinkPortalUserMutation.isPending ? 'Unlinking' : 'Unlink'}
                </button>
              </>
            ) : (
              <button
                className="button button-primary"
                disabled={createPortalUserMutation.isPending || !client.email}
                onClick={() => createPortalUserMutation.mutate()}
                type="button"
              >
                <UserPlus className="h-4 w-4" />
                {createPortalUserMutation.isPending ? 'Sending invite' : 'Create portal account'}
              </button>
            )}
          </div>
        </div>
        {!client.email ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Add a client email before creating portal access.
          </div>
        ) : null}
        {createPortalUserMutation.isError || resetPortalUserMutation.isError || disablePortalUserMutation.isError || unlinkPortalUserMutation.isError ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {getApiErrorMessage(
              createPortalUserMutation.error ??
                resetPortalUserMutation.error ??
                disablePortalUserMutation.error ??
                unlinkPortalUserMutation.error,
              'Unable to update client portal access.',
            )}
          </div>
        ) : null}
        {createPortalUserMutation.isSuccess || resetPortalUserMutation.isSuccess || disablePortalUserMutation.isSuccess || unlinkPortalUserMutation.isSuccess ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {createPortalUserMutation.isSuccess
              ? 'Portal invite sent.'
              : resetPortalUserMutation.isSuccess
                ? 'Password reset email sent.'
                : disablePortalUserMutation.isSuccess
                  ? 'Portal access disabled.'
                  : 'Portal user unlinked.'}
          </div>
        ) : null}
      </section>

      <ClientOnboardingPanel client={client} />
      <ContentPillarsPanel clientId={client.id} />
      <ClientForm client={client} isSaving={updateMutation.isPending} onSubmit={(payload) => updateMutation.mutate(payload)} />
      <SocialConnectionsPanel clientId={client.id} />
      <DriveBrowser clientId={client.id} driveUrl={client.driveFolderUrl} />
    </>
  );
}
