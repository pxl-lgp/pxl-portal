'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  Camera,
  CheckCircle2,
  LoaderCircle,
  PanelsTopLeft,
  Send,
  XCircle,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getSocialConnections,
  publishContentItem,
  scheduleContentItem,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import {
  ContentItem,
  SocialConnection,
  SocialPublishResult,
  SocialTarget,
} from '@/lib/types';

export function PublishingPanel({ contentItem }: { contentItem: ContentItem }) {
  const queryClient = useQueryClient();
  const [scheduledAt, setScheduledAt] = useState(() =>
    toInputDateTime(contentItem.scheduledAt),
  );
  const connectionsQuery = useQuery({
    queryKey: ['social-connections', contentItem.clientId],
    queryFn: () => getSocialConnections(contentItem.clientId),
  });
  const connectionById = new Map(
    (connectionsQuery.data ?? []).map((connection) => [
      connection.id,
      connection,
    ]),
  );
  const refreshContent = async (updatedContentItem: ContentItem) => {
    queryClient.setQueryData(['content', contentItem.id], updatedContentItem);
    await queryClient.invalidateQueries({ queryKey: ['content'] });
  };
  const scheduleMutation = useMutation({
    mutationFn: () =>
      scheduleContentItem(
        contentItem.id,
        new Date(scheduledAt).toISOString(),
      ),
    onSuccess: refreshContent,
  });
  const publishMutation = useMutation({
    mutationFn: () => publishContentItem(contentItem.id),
    onSuccess: refreshContent,
  });
  const formattedSchedule = useMemo(
    () => formatDate(contentItem.scheduledAt),
    [contentItem.scheduledAt],
  );
  const formattedPublished = useMemo(
    () => formatDate(contentItem.publishedAt),
    [contentItem.publishedAt],
  );
  const targets = contentItem.socialTargets ?? [];
  const hasMissingConnection = targets.some(
    (target) => !connectionById.get(target.connectionId),
  );
  const needsInstagramMedia =
    targets.some((target) => target.platform === 'INSTAGRAM') &&
    !contentItem.mediaUrl;

  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    scheduleMutation.mutate();
  }

  const error =
    scheduleMutation.error ?? publishMutation.error ?? connectionsQuery.error;
  const isBusy = scheduleMutation.isPending || publishMutation.isPending;
  const canPublish =
    !isBusy &&
    contentItem.status !== 'PUBLISHED' &&
    targets.length > 0 &&
    !hasMissingConnection &&
    !needsInstagramMedia;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <CalendarClock className="size-5 text-primary" />
          Publishing
        </CardTitle>
        <CardDescription>
          Publish this content to {targets.length} exact destination
          {targets.length === 1 ? '' : 's'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {getApiErrorMessage(error, 'Publishing failed.')}
          </div>
        ) : null}
        {scheduleMutation.isSuccess ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Content scheduled.
          </div>
        ) : null}
        {publishMutation.isSuccess ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Published successfully to every selected destination.
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <StatusCard label="Scheduled" value={formattedSchedule} />
          <StatusCard label="Published" value={formattedPublished} />
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-semibold">Destinations</div>
          {targets.length === 0 ? (
            <Warning>
              Edit this content and select one or more connected Pages before
              publishing.
            </Warning>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {targets.map((target) => {
                const resultKey = `${target.connectionId}:${target.platform}`;

                return (
                  <DestinationStatus
                    connection={connectionById.get(target.connectionId)}
                    key={resultKey}
                    result={contentItem.publishResults?.[resultKey]}
                    target={target}
                  />
                );
              })}
            </div>
          )}
        </div>

        {hasMissingConnection ? (
          <Warning>
            One or more selected Pages were disconnected. Update the content
            destinations before publishing.
          </Warning>
        ) : null}
        {needsInstagramMedia ? (
          <Warning>Instagram destinations require a public media URL.</Warning>
        ) : null}

        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={submitSchedule}
        >
          <div className="grid gap-2">
            <Label htmlFor="publishing-scheduled-at">
              Schedule date and time
            </Label>
            <Input
              id="publishing-scheduled-at"
              onChange={(event) => setScheduledAt(event.target.value)}
              required
              type="datetime-local"
              value={scheduledAt}
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isBusy || !scheduledAt}
              type="submit"
              variant="outline"
            >
              {scheduleMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CalendarClock />
              )}
              {scheduleMutation.isPending ? 'Scheduling' : 'Schedule'}
            </Button>
          </div>
        </form>

        <div className="flex justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={!canPublish}
            onClick={() => publishMutation.mutate()}
            size="lg"
            type="button"
          >
            {publishMutation.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Send />
            )}
            {publishMutation.isPending ? 'Publishing' : 'Publish now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DestinationStatus({
  connection,
  result,
  target,
}: {
  connection?: SocialConnection;
  result?: SocialPublishResult;
  target: SocialTarget;
}) {
  const Icon = target.platform === 'FACEBOOK_PAGE' ? PanelsTopLeft : Camera;
  const destination =
    target.platform === 'FACEBOOK_PAGE'
      ? connection?.facebookPageName
      : `@${connection?.instagramUsername ?? connection?.instagramAccountId ?? 'Unavailable'}`;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-primary" />
        <div>
          <div className="font-semibold">{destination ?? 'Disconnected Page'}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {target.platform === 'FACEBOOK_PAGE' ? 'Facebook Page' : 'Instagram'}
            {result?.remoteId ? ` / Post ${result.remoteId}` : ''}
          </div>
        </div>
      </div>
      {result?.status === 'SUCCEEDED' ? (
        <Badge
          className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          variant="outline"
        >
          <CheckCircle2 />
          Sent
        </Badge>
      ) : result?.status === 'FAILED' ? (
        <Badge variant="destructive">
          <XCircle />
          Failed
        </Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      )}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      {children}
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Date(value).toLocaleString();
}

function toInputDateTime(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
}
