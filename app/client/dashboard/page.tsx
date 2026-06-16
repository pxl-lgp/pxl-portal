'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, ExternalLink, FileCheck2, FolderOpen, RefreshCw, Send, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApprovalStatusBadge } from '@/components/portal/approval-status-badge';
import { ApprovalCommentsPanel } from '@/components/portal/approval-comments-panel';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import { StatusBadge } from '@/components/portal/status-badge';
import {
  createClientPortalApprovalComment,
  getClientPortalApprovalComments,
  getClientPortalOverview,
  updateClientPortalApproval,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { Approval, ApprovalDecisionPayload } from '@/lib/types';

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Date(value).toLocaleString();
}

export default function ClientDashboardPage() {
  const queryClient = useQueryClient();
  const [feedbackByApprovalId, setFeedbackByApprovalId] = useState<Record<string, string>>({});
  const overviewQuery = useQuery({
    queryKey: ['client-portal', 'overview'],
    queryFn: getClientPortalOverview,
  });
  const decisionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalDecisionPayload }) =>
      updateClientPortalApproval(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['client-portal', 'overview'] });
    },
  });
  const overview = overviewQuery.data;
  const contentById = useMemo(
    () => new Map((overview?.contentItems ?? []).map((item) => [item.id, item])),
    [overview?.contentItems],
  );
  const pendingApprovals = overview?.approvals.filter((approval) => approval.status === 'PENDING').length ?? 0;
  const publishedContent = overview?.contentItems.filter((item) => ['PUBLISHED', 'REPORTED'].includes(item.status)).length ?? 0;

  function decideApproval(approval: Approval, payload: ApprovalDecisionPayload) {
    decisionMutation.mutate({ id: approval.id, payload });
  }

  function requestRevision(event: FormEvent<HTMLFormElement>, approval: Approval) {
    event.preventDefault();
    const feedback = feedbackByApprovalId[approval.id]?.trim();

    decideApproval(approval, {
      status: 'REVISION_REQUESTED',
      ...(feedback ? { feedback } : {}),
    });
  }

  if (overviewQuery.isLoading) {
    return <div className="panel p-5 text-sm text-muted-foreground">Loading client workspace.</div>;
  }

  if (overviewQuery.isError || !overview) {
    return (
      <div className="panel flex items-start gap-3 p-5 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {getApiErrorMessage(overviewQuery.error, 'Unable to load client workspace.')}
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{overview.client.businessName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Client workspace, approvals, assets, and reports</p>
        </div>
        <Button variant="outline" onClick={() => overviewQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Status" value={<StatusBadge status={overview.client.status} />} />
        <Metric label="Content items" value={overview.contentItems.length} />
        <Metric label="Pending approvals" value={pendingApprovals} />
        <Metric label="Published" value={publishedContent} />
      </section>

      <section className="panel grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-black">Workspace Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {overview.client.industry ?? 'No industry'} / {overview.client.contactPerson ?? 'No contact person'}
            </p>
          </div>
          {overview.client.driveFolderUrl ? (
            <a className="button button-secondary" href={overview.client.driveFolderUrl} rel="noreferrer" target="_blank">
              <FolderOpen className="h-4 w-4" />
              Drive folder
            </a>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Email" value={overview.client.email ?? 'Not set'} />
          <Info label="Phone" value={overview.client.phone ?? 'Not set'} />
          <Info label="Services" value={overview.client.servicesNeeded.join(', ') || 'Not set'} />
        </div>
      </section>

      <section className="panel grid gap-4 p-5" id="approvals">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Approvals</h2>
        </div>
        {overview.approvals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approvals yet.</p>
        ) : (
          <div className="grid gap-3">
            {overview.approvals.map((approval) => {
              const contentItem = contentById.get(approval.contentItemId);

              return (
                <article className="grid gap-3 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0" key={approval.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{contentItem?.title ?? 'Unknown content item'}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {contentItem?.platform ?? 'No platform'} / Updated {formatDate(approval.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ApprovalStatusBadge status={approval.status} />
                      {contentItem ? <ContentStatusBadge status={contentItem.status} /> : null}
                    </div>
                  </div>
                  {contentItem?.caption ? (
                    <p className="whitespace-pre-wrap rounded-lg bg-[var(--panel-muted)] p-3 text-sm leading-6 text-foreground/80">
                      {contentItem.caption}
                    </p>
                  ) : null}
                  {approval.feedback ? <p className="text-sm text-muted-foreground">Feedback: {approval.feedback}</p> : null}
                  {approval.status === 'PENDING' ? (
                    <div className="grid gap-3 md:grid-cols-[auto_1fr]">
                      <button
                        className="button button-primary"
                        disabled={decisionMutation.isPending}
                        onClick={() => decideApproval(approval, { status: 'APPROVED' })}
                        type="button"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => requestRevision(event, approval)}>
                        <input
                          className="input"
                          onChange={(event) =>
                            setFeedbackByApprovalId((current) => ({ ...current, [approval.id]: event.target.value }))
                          }
                          placeholder="Revision note"
                          value={feedbackByApprovalId[approval.id] ?? ''}
                        />
                        <button className="button button-secondary" disabled={decisionMutation.isPending} type="submit">
                          <X className="h-4 w-4" />
                          Request revision
                        </button>
                      </form>
                    </div>
                  ) : null}
                  <ApprovalCommentsPanel
                    approvalId={approval.id}
                    createComment={(approvalId, body) => createClientPortalApprovalComment(approvalId, { body })}
                    getComments={getClientPortalApprovalComments}
                    queryKeyPrefix="client"
                  />
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel grid content-start gap-4 p-5" id="assets">
          <h2 className="font-black">Assets</h2>
          {overview.assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assets yet.</p>
          ) : (
            <div className="grid gap-3">
              {overview.assets.map((asset) => (
                <a className="rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--panel-muted)]" href={asset.driveUrl} key={asset.id} rel="noreferrer" target="_blank">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.assetType} / v{asset.version}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[var(--brand)]" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="panel grid content-start gap-4 p-5" id="reports">
          <h2 className="font-black">Reports</h2>
          {overview.reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <div className="grid gap-3">
              {overview.reports.map((report) => (
                <article className="rounded-lg border border-[var(--border)] p-3" key={report.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{report.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                      </p>
                    </div>
                    {report.driveUrl ? (
                      <a className="button button-secondary" href={report.driveUrl} rel="noreferrer" target="_blank">
                        <Send className="h-4 w-4" />
                        Open
                      </a>
                    ) : null}
                  </div>
                  {report.summary ? <p className="mt-3 text-sm leading-6 text-foreground/80">{report.summary}</p> : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--panel-muted)] p-3">
      <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-bold">{value}</div>
    </div>
  );
}
