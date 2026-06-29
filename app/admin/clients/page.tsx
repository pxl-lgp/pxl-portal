'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Building2, CheckCircle2, ExternalLink, FolderOpen, MoreHorizontal, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const createMutation = useMutation({
    mutationFn: (payload: ClientPayload) => createClient(payload),
    onSuccess: async (client) => {
      setIsCreateModalOpen(false);
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
        <div className="flex flex-wrap gap-2">
          <button className="button button-primary" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Building2 className="h-4 w-4" />
            Create client
          </button>
          <button className="button button-secondary" onClick={() => clientsQuery.refetch()} type="button">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-5">
            <h2 className="font-black">Client list</h2>
            <p className="text-sm text-muted-foreground">{clients.length} clients</p>
          </div>
          {clientsQuery.isError ? (
            <ErrorPanel message="Unable to load clients." />
          ) : clients.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No clients yet.
            </div>
          ) : (
            <Table className="min-w-[900px]">
                <TableHeader className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3">Business</TableHead>
                    <TableHead className="px-4 py-3">Contact</TableHead>
                    <TableHead className="px-4 py-3">Portal</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="px-4 py-3">Updated</TableHead>
                    <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="px-4 py-3">
                        <Link className="font-bold text-[var(--brand-dark)]" href={`/admin/clients/${client.id}`}>
                          {client.businessName}
                        </Link>
                        <div className="text-xs text-muted-foreground">{client.industry ?? 'No industry set'}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div>{client.contactPerson ?? 'No contact set'}</div>
                        <div className="text-xs text-muted-foreground">{client.email ?? 'No email set'}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {client.userId ? (
                          <div>
                            <span className="badge bg-emerald-500/10 text-emerald-300">Linked</span>
                            <div className="mt-1 text-xs text-muted-foreground">{client.portalUserEmail ?? 'Portal user'}</div>
                          </div>
                        ) : (
                          <span className="badge bg-[var(--panel-muted)] text-muted-foreground">Not linked</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={client.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {new Date(client.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="button button-secondary p-2" type="button" aria-label={`Open actions for ${client.businessName}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/clients/${client.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/workspace?clientId=${client.id}`}>
                                  <FolderOpen className="h-4 w-4" />
                                  Workspace
                                </Link>
                              </DropdownMenuItem>
                              {client.driveFolderUrl ? (
                                <DropdownMenuItem asChild>
                                  <a href={client.driveFolderUrl} rel="noreferrer" target="_blank">
                                    <FolderOpen className="h-4 w-4" />
                                    Drive folder
                                  </a>
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
      </section>

      <CreateClientFormModal
        isSaving={createMutation.isPending}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        open={isCreateModalOpen}
      />
      <CreateClientModal result={createResult} onClose={() => setCreateResult(null)} />
    </>
  );
}

function CreateClientFormModal({
  isSaving,
  onClose,
  onSubmit,
  open,
}: {
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
      <div className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create client</h2>
          </div>
          <button aria-label="Close modal" className="button button-secondary p-2" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ClientForm isSaving={isSaving} onSubmit={onSubmit} />
      </div>
    </div>
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
