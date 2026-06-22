'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock3, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getOnboardingTasks, updateOnboardingTask } from '@/lib/api';
import { Client, OnboardingTask, OnboardingTaskStatus } from '@/lib/types';

const statusOptions: OnboardingTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];

export function ClientOnboardingPanel({ client }: { client: Client }) {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ['onboarding-tasks', client.id],
    queryFn: () => getOnboardingTasks(client.id),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OnboardingTaskStatus }) => updateOnboardingTask(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['onboarding-tasks', client.id] });
    },
  });
  const tasks = tasksQuery.data ?? [];
  const done = tasks.filter((task) => task.status === 'DONE').length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const missingInfo = getMissingInfo(client);
  const isReady = missingInfo.length === 0 && progress === 100;

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-black">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Onboarding Workspace
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track setup tasks, missing brand details, and readiness before production starts.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3 text-right">
            <div className="text-2xl font-black">{progress}%</div>
            <div className="text-xs text-muted-foreground">{done} of {tasks.length} tasks done</div>
          </div>
        </div>
        <Progress className="mt-4 h-2" value={progress} />
        <div className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${isReady ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          {isReady
            ? 'Ready to activate: all onboarding tasks and core setup details are complete.'
            : 'Not ready to activate: finish the checklist and resolve missing setup details first.'}
        </div>
      </div>

      {missingInfo.length > 0 ? (
        <div className="grid gap-2 border-b p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Missing setup info
          </div>
          <div className="flex flex-wrap gap-2">
            {missingInfo.map((item) => (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b p-5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Core workspace details are complete.
        </div>
      )}

      <div className="grid gap-3 p-5 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="mb-3 font-semibold">Checklist</h3>
          {tasksQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading onboarding tasks.</p>
          ) : tasksQuery.isError ? (
            <p className="text-sm text-destructive">Unable to load onboarding tasks.</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No onboarding tasks have been generated yet.</p>
          ) : (
            <div className="grid gap-2">
              {tasks.map((task) => (
                <TaskRow
                  isSaving={updateMutation.isPending && updateMutation.variables?.id === task.id}
                  key={task.id}
                  onStatusChange={(status) => updateMutation.mutate({ id: task.id, status })}
                  task={task}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-3 rounded-xl border bg-muted/20 p-4">
          <h3 className="font-semibold">Brand Kit Snapshot</h3>
          <Info label="Industry" value={client.industry ?? 'Missing'} />
          <Info label="Contact" value={client.contactPerson ?? 'Missing'} />
          <Info label="Email" value={client.email ?? 'Missing'} />
          <Info label="Phone" value={client.phone ?? 'Missing'} />
          <Info label="Goals" value={client.goals ?? 'Missing'} />
          <Info label="Brand notes" value={client.brandNotes ?? 'Missing'} />
          <Info label="Services" value={client.servicesNeeded.join(', ') || 'Missing'} />
          <Info label="Drive" value={client.driveFolderUrl ? 'Connected' : 'Missing'} />
        </aside>
      </div>
    </section>
  );
}

function TaskRow({
  isSaving,
  onStatusChange,
  task,
}: {
  isSaving: boolean;
  onStatusChange: (status: OnboardingTaskStatus) => void;
  task: OnboardingTask;
}) {
  const Icon = task.status === 'DONE' ? CheckCircle2 : task.status === 'IN_PROGRESS' ? PlayCircle : Clock3;

  return (
    <article className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <div className="font-semibold">{task.title}</div>
          {task.description ? <p className="mt-1 text-sm text-muted-foreground">{task.description}</p> : null}
          {task.completedAt ? <p className="mt-1 text-xs text-muted-foreground">Completed {new Date(task.completedAt).toLocaleString()}</p> : null}
        </div>
      </div>
      <select
        className="select min-w-36"
        disabled={isSaving}
        onChange={(event) => onStatusChange(event.target.value as OnboardingTaskStatus)}
        value={task.status}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
        ))}
      </select>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background p-3 text-sm">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 font-medium ${value === 'Missing' ? 'text-amber-700 dark:text-amber-300' : ''}`}>{value}</div>
    </div>
  );
}

function getMissingInfo(client: Client) {
  return [
    !client.industry ? 'Industry' : null,
    !client.contactPerson ? 'Contact person' : null,
    !client.email ? 'Email' : null,
    !client.goals ? 'Goals' : null,
    !client.brandNotes ? 'Brand notes' : null,
    client.servicesNeeded.length === 0 ? 'Services needed' : null,
    !client.driveFolderUrl ? 'Drive folder' : null,
  ].filter((item): item is string => Boolean(item));
}
