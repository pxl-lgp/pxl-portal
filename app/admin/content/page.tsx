'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ContentForm } from '@/components/portal/content-form';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { createContentItem, getClients, getContentItems } from '@/lib/api';
import { ContentPayload } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

export default function ContentPage() {
  const queryClient = useQueryClient();
  const contentQuery = useQuery({
    queryKey: ['content'],
    queryFn: getContentItems,
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const createMutation = useMutation({
    mutationFn: (payload: ContentPayload) => createContentItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
  const contentItems = contentQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const clientById = new Map(clients.map((client) => [client.id, client]));

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
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr className="border-t border-[var(--border)]" key={item.id}>
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
