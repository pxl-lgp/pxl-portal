'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AiAssistantPanel } from '@/components/portal/ai-assistant-panel';
import { ContentForm } from '@/components/portal/content-form';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { PlatformPreviewPanel } from '@/components/portal/platform-preview-panel';
import { PublishingPanel } from '@/components/portal/publishing-panel';
import { getClients, getContentItem, updateContentItem } from '@/lib/api';
import { ContentPayload } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const contentQuery = useQuery({
    queryKey: ['content', params.id],
    queryFn: () => getContentItem(params.id),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const updateMutation = useMutation({
    mutationFn: (payload: ContentPayload) => updateContentItem(params.id, payload),
    onSuccess: async (contentItem) => {
      queryClient.setQueryData(['content', params.id], contentItem);
      await queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
  const contentItem = contentQuery.data;
  const clients = clientsQuery.data ?? [];
  const client = clients.find((item) => item.id === contentItem?.clientId);

  if (contentQuery.isLoading) {
    return <div className="panel p-5 text-sm text-muted-foreground">Loading content.</div>;
  }

  if (contentQuery.isError || !contentItem) {
    return (
      <div className="panel flex items-start gap-2 p-5 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Content item not found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-dark)]" href="/admin/content">
            <ArrowLeft className="h-4 w-4" />
            Content
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black">{contentItem.title}</h1>
            <ContentStatusBadge status={contentItem.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated {new Date(contentItem.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {updateMutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {getApiErrorMessage(updateMutation.error, 'Update failed.')}
        </div>
      ) : null}
      {updateMutation.isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Content updated.
        </div>
      ) : null}

      <ContentForm
        clients={clients}
        contentItem={contentItem}
        isSaving={updateMutation.isPending}
        onSubmit={(payload) => updateMutation.mutate(payload)}
      />

      <PlatformPreviewPanel contentItem={contentItem} />

      <PublishingPanel contentItem={contentItem} />

      <AiAssistantPanel
        client={client}
        contentItem={contentItem}
        onApplyCaption={(caption) =>
          updateMutation.mutate({
            clientId: contentItem.clientId,
            title: contentItem.title,
            contentType: contentItem.contentType,
            caption,
          })
        }
        onApplyHashtags={(hashtags) =>
          updateMutation.mutate({
            clientId: contentItem.clientId,
            title: contentItem.title,
            contentType: contentItem.contentType,
            hashtags,
          })
        }
      />
    </>
  );
}
