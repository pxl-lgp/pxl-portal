'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, LineChart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AiAssistantPanel } from '@/components/portal/ai-assistant-panel';
import { ContentForm } from '@/components/portal/content-form';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { ContentTemplatePicker } from '@/components/portal/content-template-picker';
import { PlatformPreviewPanel } from '@/components/portal/platform-preview-panel';
import { PublishingPanel } from '@/components/portal/publishing-panel';
import { getClients, getContentAnalytics, getContentItem, updateContentItem } from '@/lib/api';
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

      <ContentTemplatePicker
        clientId={contentItem.clientId}
        onApply={(body) =>
          updateMutation.mutate({
            clientId: contentItem.clientId,
            title: contentItem.title,
            contentType: contentItem.contentType,
            caption: body,
          })
        }
      />

      <PlatformPreviewPanel contentItem={contentItem} />

      <PublishingPanel contentItem={contentItem} />

      <ContentAnalyticsPanel contentItemId={params.id} />

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

function ContentAnalyticsPanel({ contentItemId }: { contentItemId: string }) {
  const analyticsQuery = useQuery({
    queryKey: ['content-analytics', contentItemId],
    queryFn: () => getContentAnalytics(contentItemId),
  });
  const records = analyticsQuery.data ?? [];

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
        <LineChart className="h-5 w-5 text-[var(--brand)]" />
        <h2 className="font-black">Performance records</h2>
      </div>
      {analyticsQuery.isLoading ? (
        <div className="p-5 text-sm text-muted-foreground">Loading performance records.</div>
      ) : analyticsQuery.isError ? (
        <div className="flex items-start gap-2 p-5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Unable to load performance records.
        </div>
      ) : records.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No performance records yet. Add metrics from the Analytics page once this content is published.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Captured</th>
                <th className="px-4 py-3">Reach</th>
                <th className="px-4 py-3">Impressions</th>
                <th className="px-4 py-3">Engagement</th>
                <th className="px-4 py-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr className="border-t border-[var(--border)]" key={record.id}>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(record.capturedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{record.reach.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.engagement.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.clicks.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
