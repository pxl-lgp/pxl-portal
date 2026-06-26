'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Building2, CheckCircle2, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createClient, getClients } from '@/lib/api';
import { Client, ClientPayload } from '@/lib/types';
import { ClientForm } from '@/components/portal/client-form';
import { StatusBadge } from '@/components/portal/status-badge';
import { getApiErrorMessage } from '@/lib/errors';

type CreateClientResult =
  | { type: 'success'; client: Client }
  | { type: 'error'; message: string }
  | null;

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [createResult, setCreateResult] = useState<CreateClientResult>(null);
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const createMutation = useMutation({
    mutationFn: (payload: ClientPayload) => createClient(payload),
    onSuccess: async (client) => {
      setCreateResult({ type: 'success', client });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      setCreateResult({
        type: 'error',
        message: getApiErrorMessage(error, 'Client creation failed.'),
      });
    },
  });
  const clients = clientsQuery.data ?? [];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Onboarding records and account details</p>
        </div>
        <button className="button button-secondary" onClick={() => clientsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="font-black">Client list</h2>
          </div>
          {clientsQuery.isError ? (
            <ErrorPanel message="Unable to load clients." />
          ) : clients.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No clients yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr className="border-t border-[var(--border)]" key={client.id}>
                      <td className="px-4 py-3">
                        <Link className="font-bold text-[var(--brand-dark)]" href={`/admin/clients/${client.id}`}>
                          {client.businessName}
                        </Link>
                        <div className="text-xs text-muted-foreground">{client.industry ?? 'No industry set'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{client.contactPerson ?? 'No contact set'}</div>
                        <div className="text-xs text-muted-foreground">{client.email ?? 'No email set'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(client.updatedAt).toLocaleDateString()}
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
            <Building2 className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create client</h2>
          </div>
          <ClientForm isSaving={createMutation.isPending} onSubmit={(payload) => createMutation.mutate(payload)} />
        </aside>
      </section>

      <CreateClientModal result={createResult} onClose={() => setCreateResult(null)} />
    </>
  );
}

function CreateClientModal({ result, onClose }: { result: CreateClientResult; onClose: () => void }) {
  if (!result) {
    return null;
  }

  const isSuccess = result.type === 'success';

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={
                isSuccess
                  ? 'rounded-full bg-emerald-500/10 p-2 text-emerald-400'
                  : 'rounded-full bg-red-500/10 p-2 text-red-400'
              }
            >
              {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black">{isSuccess ? 'Client created' : 'Client creation failed'}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {isSuccess
                  ? 'The client was saved and the automation workflow has been queued.'
                  : result.message}
              </p>
            </div>
          </div>
          <button className="button button-secondary p-2" onClick={onClose} type="button" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm">
            <div className="font-bold text-[var(--brand-dark)]">{result.client.businessName}</div>
            <div className="mt-1 text-muted-foreground">
              {result.client.contactPerson ?? 'No contact'} / {result.client.email ?? 'No email'}
            </div>
            <div className="mt-3">
              <StatusBadge status={result.client.status} />
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {isSuccess ? (
            <Link className="button button-primary" href={`/admin/clients/${result.client.id}`} onClick={onClose}>
              View client
            </Link>
          ) : null}
          <button className="button button-secondary" onClick={onClose} type="button">
            {isSuccess ? 'Create another' : 'Back to form'}
          </button>
        </div>
      </div>
    </div>
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
