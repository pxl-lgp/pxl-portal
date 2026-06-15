'use client';

import { useQuery } from '@tanstack/react-query';
import { Camera, PanelsTopLeft, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getSocialConnections } from '@/lib/api';
import {
  Client,
  ContentItem,
  ContentPayload,
  ContentStatus,
  SocialPlatform,
  SocialTarget,
} from '@/lib/types';

const statuses: ContentStatus[] = [
  'IDEA',
  'DRAFTING',
  'DESIGNING',
  'INTERNAL_REVIEW',
  'CLIENT_APPROVAL',
  'APPROVED',
  'REVISION_REQUESTED',
  'SCHEDULED',
  'PUBLISHED',
  'REPORTED',
];

type ContentFormValues = {
  clientId: string;
  title: string;
  contentType: string;
  socialTargets: SocialTarget[];
  status: ContentStatus;
  caption: string;
  hashtags: string;
  mediaUrl: string;
  scheduledAt: string;
  publishedAt: string;
};

export function ContentForm({
  clients,
  contentItem,
  isSaving,
  onSubmit,
}: {
  clients: Client[];
  contentItem?: ContentItem;
  isSaving: boolean;
  onSubmit: (payload: ContentPayload) => void;
}) {
  const initialValues = useMemo<ContentFormValues>(
    () => ({
      clientId: contentItem?.clientId ?? clients[0]?.id ?? '',
      title: contentItem?.title ?? '',
      contentType: contentItem?.contentType ?? 'post',
      socialTargets: contentItem?.socialTargets ?? [],
      status: contentItem?.status ?? 'IDEA',
      caption: contentItem?.caption ?? '',
      hashtags: contentItem?.hashtags.join(', ') ?? '',
      mediaUrl: contentItem?.mediaUrl ?? '',
      scheduledAt: toInputDateTime(contentItem?.scheduledAt),
      publishedAt: toInputDateTime(contentItem?.publishedAt),
    }),
    [clients, contentItem],
  );
  const [values, setValues] = useState(initialValues);
  const selectedClientId = values.clientId || clients[0]?.id || '';
  const connectionsQuery = useQuery({
    queryKey: ['social-connections', selectedClientId],
    queryFn: () => getSocialConnections(selectedClientId),
    enabled: Boolean(selectedClientId),
  });
  const connections = (connectionsQuery.data ?? []).filter(
    (connection) => connection.status === 'CONNECTED',
  );
  const targetsInstagram = values.socialTargets.some(
    (target) => target.platform === 'INSTAGRAM',
  );

  function updateValue<K extends keyof ContentFormValues>(
    key: K,
    value: ContentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function changeClient(clientId: string) {
    setValues((current) => ({
      ...current,
      clientId,
      socialTargets:
        clientId === contentItem?.clientId ? contentItem.socialTargets : [],
    }));
  }

  function toggleTarget(
    connectionId: string,
    platform: SocialPlatform,
    checked: boolean,
  ) {
    const targetKey = `${connectionId}:${platform}`;

    setValues((current) => ({
      ...current,
      socialTargets: checked
        ? [...current.socialTargets, { connectionId, platform }].filter(
            (target, index, targets) =>
              targets.findIndex(
                (item) =>
                  `${item.connectionId}:${item.platform}` ===
                  `${target.connectionId}:${target.platform}`,
              ) === index,
          )
        : current.socialTargets.filter(
            (target) =>
              `${target.connectionId}:${target.platform}` !== targetKey,
          ),
    }));
  }

  function isTargetSelected(connectionId: string, platform: SocialPlatform) {
    return values.socialTargets.some(
      (target) =>
        target.connectionId === connectionId && target.platform === platform,
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hashtags = values.hashtags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      clientId: selectedClientId,
      title: values.title.trim(),
      contentType: values.contentType.trim(),
      socialTargets: values.socialTargets,
      status: values.status,
      caption: values.caption.trim() || undefined,
      hashtags,
      mediaUrl: values.mediaUrl.trim() || undefined,
      scheduledAt: values.scheduledAt
        ? new Date(values.scheduledAt).toISOString()
        : undefined,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : undefined,
    });
  }

  return (
    <Card>
      <CardContent>
        <form className="grid gap-6" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Client">
              <Select
                onValueChange={changeClient}
                required
                value={selectedClientId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <TextField
              label="Title"
              onChange={(value) => updateValue('title', value)}
              required
              value={values.title}
            />
            <TextField
              label="Content type"
              onChange={(value) => updateValue('contentType', value)}
              required
              value={values.contentType}
            />
            <Field label="Status">
              <Select
                onValueChange={(value) =>
                  updateValue('status', value as ContentStatus)
                }
                value={values.status}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <fieldset className="grid gap-3">
            <div>
              <legend className="text-sm font-semibold">Publishing destinations</legend>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose any number of authorized Pages and Instagram accounts for
                this client.
              </p>
            </div>

            {connectionsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading connected Pages.
              </div>
            ) : connections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                No active Meta Pages are connected to this client. Save the draft,
                then connect Page owners from the client record.
              </div>
            ) : (
              <div className="grid gap-3">
                {connections.map((connection) => (
                  <div
                    className="grid gap-3 rounded-xl border border-border p-4"
                    key={connection.id}
                  >
                    <div>
                      <div className="font-semibold">
                        {connection.facebookPageName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Page ID {connection.facebookPageId}
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <DestinationOption
                        checked={isTargetSelected(
                          connection.id,
                          'FACEBOOK_PAGE',
                        )}
                        description="Publish to this Facebook Page."
                        id={`${connection.id}-facebook`}
                        label="Facebook Page"
                        onCheckedChange={(checked) =>
                          toggleTarget(
                            connection.id,
                            'FACEBOOK_PAGE',
                            checked,
                          )
                        }
                        platform="FACEBOOK_PAGE"
                      />
                      {connection.instagramAccountId ? (
                        <DestinationOption
                          checked={isTargetSelected(
                            connection.id,
                            'INSTAGRAM',
                          )}
                          description={`@${
                            connection.instagramUsername ??
                            connection.instagramAccountId
                          }`}
                          id={`${connection.id}-instagram`}
                          label="Instagram"
                          onCheckedChange={(checked) =>
                            toggleTarget(
                              connection.id,
                              'INSTAGRAM',
                              checked,
                            )
                          }
                          platform="INSTAGRAM"
                        />
                      ) : (
                        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                          No Instagram professional account linked to this Page.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Hashtags"
              onChange={(value) => updateValue('hashtags', value)}
              placeholder="campaign, launch, local"
              value={values.hashtags}
            />
            <TextField
              label="Public media URL"
              onChange={(value) => updateValue('mediaUrl', value)}
              placeholder="https://cdn.example.com/post.jpg"
              required={targetsInstagram}
              type="url"
              value={values.mediaUrl}
            />
            <TextField
              label="Scheduled at"
              onChange={(value) => updateValue('scheduledAt', value)}
              type="datetime-local"
              value={values.scheduledAt}
            />
            <TextField
              label="Published at"
              onChange={(value) => updateValue('publishedAt', value)}
              type="datetime-local"
              value={values.publishedAt}
            />
          </div>

          <Field label="Caption">
            <Textarea
              className="min-h-32"
              id="caption"
              onChange={(event) => updateValue('caption', event.target.value)}
              value={values.caption}
            />
          </Field>

          <div className="flex justify-end">
            <Button
              disabled={isSaving || clients.length === 0}
              size="lg"
              type="submit"
            >
              <Save />
              {isSaving ? 'Saving' : 'Save content'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DestinationOption({
  checked,
  description,
  id,
  label,
  onCheckedChange,
  platform,
}: {
  checked: boolean;
  description: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  platform: SocialPlatform;
}) {
  const Icon = platform === 'FACEBOOK_PAGE' ? PanelsTopLeft : Camera;

  return (
    <Label
      className="cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
      htmlFor={id}
    >
      <Checkbox
        checked={checked}
        id={id}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <Icon className="mt-0.5 size-4 text-primary" />
      <span className="grid gap-1">
        <span className="font-semibold">{label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </Label>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  const id = label.toLowerCase().replaceAll(' ', '-');

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  required,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const id = label.toLowerCase().replaceAll(' ', '-');

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {label === 'Public media URL' ? (
        <p className="text-xs text-muted-foreground">
          Instagram requires a direct, publicly reachable image or video URL.
        </p>
      ) : null}
    </div>
  );
}

function toInputDateTime(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
}
