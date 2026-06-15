import { ContentStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<ContentStatus, string> = {
  IDEA: 'border-slate-400/30 bg-slate-400/15 text-slate-300',
  DRAFTING: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
  DESIGNING: 'border-indigo-400/30 bg-indigo-400/15 text-indigo-300',
  INTERNAL_REVIEW: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
  CLIENT_APPROVAL: 'border-violet-400/30 bg-violet-400/15 text-violet-300',
  APPROVED: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  REVISION_REQUESTED: 'border-red-400/30 bg-red-400/15 text-red-300',
  SCHEDULED: 'border-cyan-400/30 bg-cyan-400/15 text-cyan-300',
  PUBLISHED: 'border-teal-400/30 bg-teal-400/15 text-teal-300',
  REPORTED: 'border-zinc-400/30 bg-zinc-400/15 text-zinc-300',
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant="outline" className={statusStyles[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
