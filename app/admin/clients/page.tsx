'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Building2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { createClient, getClients } from '@/lib/api';
import { ClientPayload } from '@/lib/types';
import { ClientForm } from '@/components/portal/client-form';
import { StatusBadge } from '@/components/portal/status-badge';
import { getApiErrorMessage } from '@/lib/errors';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const createMutation = useMutation({
    mutationFn: (payload: ClientPayload) => createClient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
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
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Client creation failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Client saved. Automation event logged.
            </div>
          ) : null}
          <ClientForm isSaving={createMutation.isPending} onSubmit={(payload) => createMutation.mutate(payload)} />
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
