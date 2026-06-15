import { ApprovalStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<ApprovalStatus, string> = {
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  APPROVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  REVISION_REQUESTED: 'border-red-500/30 bg-red-500/10 text-red-400',
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return <Badge variant="outline" className={statusStyles[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
