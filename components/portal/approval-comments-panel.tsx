'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/errors';
import { ApprovalComment } from '@/lib/types';

type ApprovalCommentsPanelProps = {
  approvalId: string;
  createComment: (approvalId: string, body: string) => Promise<ApprovalComment>;
  queryKeyPrefix: string;
  title?: string;
  getComments: (approvalId: string) => Promise<ApprovalComment[]>;
};

export function ApprovalCommentsPanel({
  approvalId,
  createComment,
  getComments,
  queryKeyPrefix,
  title = 'Comments',
}: ApprovalCommentsPanelProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const commentsQuery = useQuery({
    queryKey: [queryKeyPrefix, 'approval-comments', approvalId],
    queryFn: () => getComments(approvalId),
  });
  const createMutation = useMutation({
    mutationFn: () => createComment(approvalId, body.trim()),
    onSuccess: async () => {
      setBody('');
      await queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, 'approval-comments', approvalId] });
    },
  });
  const comments = commentsQuery.data ?? [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    createMutation.mutate();
  }

  return (
    <section className="grid gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="size-4 text-primary" />
        {title}
      </div>
      {commentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments.</p>
      ) : commentsQuery.isError ? (
        <p className="text-sm text-destructive">Unable to load comments.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="grid gap-2">
          {comments.map((comment) => (
            <article className="rounded-lg border bg-background p-3" key={comment.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{comment.authorName}</div>
                <div className="text-xs text-muted-foreground">
                  {comment.authorRole} / {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{comment.body}</p>
            </article>
          ))}
        </div>
      )}
      {createMutation.isError ? (
        <p className="text-sm text-destructive">{getApiErrorMessage(createMutation.error, 'Comment failed.')}</p>
      ) : null}
      <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
        <textarea
          className="textarea min-h-20"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a comment or revision note"
          value={body}
        />
        <Button className="sm:self-end" disabled={createMutation.isPending || !body.trim()} type="submit">
          <Send className="size-4" />
          {createMutation.isPending ? 'Sending' : 'Send'}
        </Button>
      </form>
    </section>
  );
}
