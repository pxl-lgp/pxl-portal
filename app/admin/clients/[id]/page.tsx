'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, KeyRound, Pencil, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const clientQuery = useQuery({
    queryKey: ['clients', params.id],
    queryFn: () => getClient(params.id),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: ClientPayload) => updateClient(params.id, payload),
    onSuccess: async (client) => {
      setIsEditModalOpen(false);
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
          <button className="button button-primary" onClick={() => setIsEditModalOpen(true)} type="button">
            <Pencil className="h-4 w-4" />
            Edit client
          </button>
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

      <ClientDetailsCard client={client} />

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
      <EditClientModal
        client={client}
        isSaving={updateMutation.isPending}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        open={isEditModalOpen}
      />
      <SocialConnectionsPanel clientId={client.id} />
      <DriveBrowser clientId={client.id} driveUrl={client.driveFolderUrl} />
    </>
  );
}

function ClientDetailsCard({ client }: { client: NonNullable<Awaited<ReturnType<typeof getClient>>> }) {
  const socialLinks = Object.entries(client.socialLinks).filter(([, value]) => value);

  return (
    <section className="panel grid gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">Client details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Read-only overview. Use Edit client to update this profile.</p>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Detail label="Business name" value={client.businessName} />
        <Detail label="Industry" value={client.industry} />
        <Detail label="Contact person" value={client.contactPerson} />
        <Detail label="Email" value={client.email} />
        <Detail label="Phone" value={client.phone} />
        <Detail label="Portal account" value={client.userId ? client.portalUserEmail ?? 'Linked' : 'Not linked'} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Detail label="Services needed" value={client.servicesNeeded.join(', ') || null} />
        <Detail label="Drive folder" value={client.driveFolderUrl} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <LongDetail label="Goals" value={client.goals} />
        <LongDetail label="Brand notes" value={client.brandNotes} />
      </div>

      <div>
        <h3 className="text-sm font-bold">Social links</h3>
        {socialLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {socialLinks.map(([key, value]) => (
              <a className="button button-secondary" href={value} key={key} rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" />
                {key}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No social links set.</p>
        )}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-[var(--panel-muted)] p-3">
      <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-bold">{value || 'Not set'}</div>
    </div>
  );
}

function LongDetail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-[var(--panel-muted)] p-3">
      <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{value || 'Not set'}</p>
    </div>
  );
}

function EditClientModal({
  client,
  isSaving,
  onClose,
  onSubmit,
  open,
}: {
  client: NonNullable<Awaited<ReturnType<typeof getClient>>>;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: ClientPayload) => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog">
      <div className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Edit client</h2>
          </div>
          <button aria-label="Close modal" className="button button-secondary p-2" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ClientForm client={client} isSaving={isSaving} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
