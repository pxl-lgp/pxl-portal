'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, CheckSquare, RefreshCw, RotateCcw } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { ApprovalStatusBadge } from '@/components/portal/approval-status-badge';
import { ContentStatusBadge } from '@/components/portal/content-status-badge';
import {
  createApproval,
  getApprovals,
  getClients,
  getContentItems,
  updateApproval,
} from '@/lib/api';
import { ApprovalDecisionPayload } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const approvalsQuery = useQuery({
    queryKey: ['approvals'],
    queryFn: getApprovals,
  });
  const contentQuery = useQuery({
    queryKey: ['content'],
    queryFn: getContentItems,
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const createMutation = useMutation({
    mutationFn: createApproval,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['approvals'] }),
        queryClient.invalidateQueries({ queryKey: ['content'] }),
      ]);
    },
  });
  const decisionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalDecisionPayload }) =>
      updateApproval(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['approvals'] }),
        queryClient.invalidateQueries({ queryKey: ['content'] }),
      ]);
    },
  });
  const approvals = useMemo(() => approvalsQuery.data ?? [], [approvalsQuery.data]);
  const contentItems = useMemo(() => contentQuery.data ?? [], [contentQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const contentById = new Map(contentItems.map((item) => [item.id, item]));
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const sendableContent = useMemo(
    () => {
      const approvalContentIds = new Set(approvals.map((approval) => approval.contentItemId));

      return contentItems.filter(
        (item) =>
          !approvalContentIds.has(item.id) &&
          !['APPROVED', 'PUBLISHED', 'REPORTED'].includes(item.status),
      );
    },
    [approvals, contentItems],
  );
  const [selectedContentItemId, setSelectedContentItemId] = useState('');
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const selectedValue = selectedContentItemId || sendableContent[0]?.id || '';

  function submitApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedValue) {
      return;
    }

    createMutation.mutate({ contentItemId: selectedValue });
  }

  function decide(id: string, payload: ApprovalDecisionPayload) {
    decisionMutation.mutate({ id, payload });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Send content for approval and track decisions</p>
        </div>
        <button className="button button-secondary" onClick={() => approvalsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="font-black">Approval list</h2>
          </div>
          {approvalsQuery.isError ? (
            <ErrorPanel message="Unable to load approvals." />
          ) : approvals.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No approvals yet.
            </div>
          ) : (
            <div className="grid gap-0">
              {approvals.map((approval) => {
                const contentItem = contentById.get(approval.contentItemId);
                const client = clientById.get(approval.clientId);
                const feedback = feedbackById[approval.id] ?? '';

                return (
                  <article className="grid gap-4 border-t border-[var(--border)] p-5" key={approval.id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-black">{contentItem?.title ?? 'Unknown content item'}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client?.businessName ?? 'Unknown client'}
                          {contentItem ? ` / ${contentItem.contentType}` : ''}
                          {contentItem?.platform ? ` / ${contentItem.platform}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ApprovalStatusBadge status={approval.status} />
                        {contentItem ? <ContentStatusBadge status={contentItem.status} /> : null}
                      </div>
                    </div>

                    {approval.feedback ? (
                      <div className="rounded-lg bg-[var(--panel-muted)] p-3 text-sm text-foreground/80">
                        {approval.feedback}
                      </div>
                    ) : null}

                    {approval.status === 'PENDING' ? (
                      <div className="grid gap-3">
                        <textarea
                          className="textarea"
                          onChange={(event) =>
                            setFeedbackById((current) => ({
                              ...current,
                              [approval.id]: event.target.value,
                            }))
                          }
                          placeholder="Revision feedback"
                          value={feedback}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="button button-primary"
                            disabled={decisionMutation.isPending}
                            onClick={() => decide(approval.id, { status: 'APPROVED' })}
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            className="button button-secondary"
                            disabled={decisionMutation.isPending}
                            onClick={() =>
                              decide(approval.id, {
                                status: 'REVISION_REQUESTED',
                                feedback: feedback || 'Revision requested.',
                              })
                            }
                            type="button"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Request revision
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Send for approval</h2>
          </div>
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Approval creation failed.')} />
          ) : null}
          {decisionMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(decisionMutation.error, 'Approval update failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Content sent for approval.
            </div>
          ) : null}
          <form className="panel grid gap-4 p-5" onSubmit={submitApproval}>
            <div className="field">
              <label htmlFor="contentItemId">Content item</label>
              <select
                className="select"
                disabled={sendableContent.length === 0}
                id="contentItemId"
                onChange={(event) => setSelectedContentItemId(event.target.value)}
                value={selectedValue}
              >
                {sendableContent.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            {sendableContent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No content items are ready to send.</p>
            ) : null}
            <button className="button button-primary" disabled={createMutation.isPending || !selectedValue} type="submit">
              <CheckSquare className="h-4 w-4" />
              Send
            </button>
          </form>
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
