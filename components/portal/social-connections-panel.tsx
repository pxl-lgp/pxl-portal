'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  LoaderCircle,
  PanelsTopLeft,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  createMetaOauthUrl,
  disconnectSocialConnection,
  getSocialConnections,
  syncMetaAuthorization,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

export function SocialConnectionsPanel({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const connectionsQuery = useQuery({
    queryKey: ['social-connections', clientId],
    queryFn: () => getSocialConnections(clientId),
  });
  const connectMutation = useMutation({
    mutationFn: createMetaOauthUrl,
  });
  const syncMutation = useMutation({
    mutationFn: async () => {
      const authorizationIds = [
        ...new Set((connectionsQuery.data ?? []).map((item) => item.authorizationId)),
      ];

      await Promise.all(
        authorizationIds.map((authorizationId) =>
          syncMetaAuthorization(clientId, authorizationId),
        ),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['social-connections', clientId],
      });
    },
  });
  const disconnectMutation = useMutation({
    mutationFn: (connectionId: string) =>
      disconnectSocialConnection(clientId, connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['social-connections', clientId],
      });
    },
  });
  const connections = connectionsQuery.data ?? [];
  const error =
    connectionsQuery.error ??
    connectMutation.error ??
    syncMutation.error ??
    disconnectMutation.error;

  async function connectNow() {
    const result = await connectMutation.mutateAsync(clientId);
    window.location.assign(result.url);
  }

  async function copyOwnerLink() {
    const result = await connectMutation.mutateAsync(clientId);
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 3000);
  }

  function disconnect(connectionId: string, pageName: string) {
    if (!window.confirm(`Disconnect ${pageName} from this client?`)) {
      return;
    }

    disconnectMutation.mutate(connectionId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <PanelsTopLeft className="size-5 text-primary" />
          Connected social accounts
        </CardTitle>
        <CardDescription>
          Each owner authorizes their own Meta account. All Pages they approve are
          stored separately for this client.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {getApiErrorMessage(error, 'Unable to update Meta connections.')}
          </div>
        ) : null}
        {copied ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            One-time owner authorization link copied. It expires in 30 minutes.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={connectMutation.isPending}
            onClick={connectNow}
            type="button"
          >
            {connectMutation.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ExternalLink />
            )}
            Connect Meta account
          </Button>
          <Button
            disabled={connectMutation.isPending}
            onClick={copyOwnerLink}
            type="button"
            variant="outline"
          >
            <Clipboard />
            Copy owner link
          </Button>
          <Button
            disabled={syncMutation.isPending || connections.length === 0}
            onClick={() => syncMutation.mutate()}
            type="button"
            variant="outline"
          >
            <RefreshCw className={syncMutation.isPending ? 'animate-spin' : ''} />
            Refresh Pages
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Page owners sign in directly with Meta and choose what your agency may
          manage. Their password is never shared with this portal.
        </p>

        {connectionsQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading connected Pages.</div>
        ) : connections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <div className="font-semibold">No Meta Pages connected</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect now or send the owner a one-time authorization link.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {connections.map((connection) => (
              <div
                className="grid gap-4 rounded-xl border border-border p-4"
                key={connection.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <PanelsTopLeft className="mt-0.5 size-5 text-primary" />
                    <div>
                      <div className="font-semibold">{connection.facebookPageName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Page ID {connection.facebookPageId}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      connection.status === 'CONNECTED'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : undefined
                    }
                    variant={connection.status === 'CONNECTED' ? 'outline' : 'destructive'}
                  >
                    {connection.status === 'CONNECTED' ? <CheckCircle2 /> : null}
                    {connection.status}
                  </Badge>
                </div>

                {connection.instagramAccountId ? (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                    <Camera className="size-4 text-primary" />
                    <div>
                      <div className="text-sm font-semibold">Instagram</div>
                      <div className="text-xs text-muted-foreground">
                        @{connection.instagramUsername ?? connection.instagramAccountId}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No Instagram professional account is linked to this Page.
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Verified {new Date(connection.lastVerifiedAt).toLocaleString()}
                  </span>
                  <Button
                    disabled={disconnectMutation.isPending}
                    onClick={() => disconnect(connection.id, connection.facebookPageName)}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 />
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
