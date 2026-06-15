import { ClientStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<ClientStatus, string> = {
  LEAD: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
  ONBOARDING: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
  ACTIVE: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  PAUSED: 'border-slate-400/30 bg-slate-400/15 text-slate-300',
  ARCHIVED: 'border-zinc-400/30 bg-zinc-400/15 text-zinc-300',
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return <Badge variant="outline" className={statusStyles[status]}>{status.replace('_', ' ')}</Badge>;
}
