'use client';

import { AlertTriangle, Camera, CheckCircle2, ImageIcon, PanelsTopLeft, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContentItem, SocialPlatform } from '@/lib/types';

type PreviewTarget = {
  key: string;
  platform: SocialPlatform;
  label: string;
};

export function PlatformPreviewPanel({ contentItem }: { contentItem: ContentItem }) {
  const targets = getPreviewTargets(contentItem);
  const warnings = getValidationWarnings(contentItem, targets.map((target) => target.platform));

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <Smartphone className="size-5 text-primary" />
              Platform Previews
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Approximate previews and readiness checks before scheduling or publishing.
            </p>
          </div>
          <Badge variant={warnings.length === 0 ? 'secondary' : 'destructive'}>
            {warnings.length === 0 ? <CheckCircle2 /> : <AlertTriangle />}
            {warnings.length === 0 ? 'Ready' : `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`}
          </Badge>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="grid gap-2 border-b p-4">
          {warnings.map((warning) => (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200" key={warning}>
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      ) : null}

      {targets.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Select Facebook or Instagram publishing destinations to see platform-specific previews.
        </div>
      ) : (
        <div className="grid gap-4 p-4 xl:grid-cols-2">
          {targets.map((target) => (
            <PreviewCard contentItem={contentItem} key={target.key} target={target} />
          ))}
        </div>
      )}
    </section>
  );
}

function PreviewCard({ contentItem, target }: { contentItem: ContentItem; target: PreviewTarget }) {
  const isInstagram = target.platform === 'INSTAGRAM';
  const Icon = isInstagram ? Camera : PanelsTopLeft;
  const caption = buildCaption(contentItem);
  const imageLabel = isVideo(contentItem) ? 'Video / Reel media' : 'Image media';

  return (
    <article className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <div className="font-semibold">{target.label}</div>
            <div className="text-xs text-muted-foreground">{isInstagram ? 'Instagram preview' : 'Facebook Page preview'}</div>
          </div>
        </div>
        <Badge variant="outline">{contentItem.contentType}</Badge>
      </div>

      <div className={isInstagram ? 'mx-auto max-w-sm' : ''}>
        <div className="aspect-square bg-muted">
          {contentItem.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={contentItem.title} className="h-full w-full object-cover" src={contentItem.mediaUrl} />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
              <div>
                <ImageIcon className="mx-auto mb-3 size-10" />
                {imageLabel} will appear here after a public media URL is added.
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-3 p-4">
          <div>
            <div className="text-sm font-semibold">{contentItem.title}</div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
              {caption || 'No caption yet.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{caption.length.toLocaleString()} characters</span>
            <span>{contentItem.hashtags.length} hashtags</span>
            {contentItem.scheduledAt ? <span>Scheduled {new Date(contentItem.scheduledAt).toLocaleString()}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function getPreviewTargets(contentItem: ContentItem): PreviewTarget[] {
  if (contentItem.socialTargets.length > 0) {
    return contentItem.socialTargets.map((target) => ({
      key: `${target.connectionId}:${target.platform}`,
      platform: target.platform,
      label: target.platform === 'INSTAGRAM' ? 'Instagram' : 'Facebook Page',
    }));
  }

  return contentItem.platforms.map((platform) => ({
    key: platform,
    platform,
    label: platform === 'INSTAGRAM' ? 'Instagram' : 'Facebook Page',
  }));
}

function getValidationWarnings(contentItem: ContentItem, platforms: SocialPlatform[]) {
  const caption = buildCaption(contentItem);
  const warnings: string[] = [];

  if (platforms.length === 0) {
    warnings.push('No publishing destination is selected.');
  }

  if (!caption.trim()) {
    warnings.push('Caption is empty. Facebook text posts need a caption, and Instagram posts should include one.');
  }

  if (platforms.includes('INSTAGRAM') && !contentItem.mediaUrl) {
    warnings.push('Instagram publishing requires a public image or video URL.');
  }

  if (platforms.includes('INSTAGRAM') && caption.length > 2200) {
    warnings.push('Instagram captions should stay under 2,200 characters.');
  }

  if (platforms.includes('INSTAGRAM') && contentItem.hashtags.length > 30) {
    warnings.push('Instagram allows up to 30 hashtags.');
  }

  if (contentItem.mediaUrl && !/^https?:\/\//i.test(contentItem.mediaUrl)) {
    warnings.push('Media URL should be a fully qualified public URL.');
  }

  return warnings;
}

function buildCaption(contentItem: ContentItem) {
  return [
    contentItem.caption?.trim(),
    contentItem.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' '),
  ]
    .filter(Boolean)
    .join('\n\n');
}

function isVideo(contentItem: ContentItem) {
  const normalized = `${contentItem.contentType} ${contentItem.mediaUrl ?? ''}`.toLowerCase();

  return normalized.includes('video') || normalized.includes('reel') || /\.(mp4|mov|m4v|webm)(?:$|\?)/.test(normalized);
}
