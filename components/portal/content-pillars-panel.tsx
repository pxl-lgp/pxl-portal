'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Columns3, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  createContentPillar,
  deleteContentPillar,
  getContentPillars,
  updateContentPillar,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { ContentPillarPayload } from '@/lib/types';

export function ContentPillarsPanel({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const pillarsQuery = useQuery({
    queryKey: ['content-pillars', clientId],
    queryFn: () => getContentPillars(clientId),
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cadence, setCadence] = useState('4');

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ['content-pillars', clientId] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: ContentPillarPayload) => createContentPillar(payload),
    onSuccess: async () => {
      setName('');
      setDescription('');
      setCadence('4');
      await invalidate();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, cadencePerMonth }: { id: string; cadencePerMonth: number }) =>
      updateContentPillar(id, { cadencePerMonth }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContentPillar(id),
    onSuccess: invalidate,
  });

  const pillars = pillarsQuery.data ?? [];
  const totalCadence = pillars.reduce((sum, pillar) => sum + pillar.cadencePerMonth, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createMutation.mutate({
      clientId,
      name: name.trim(),
      description: description.trim() || undefined,
      cadencePerMonth: Number(cadence) || 0,
    });
  }

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Columns3 className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Content pillars</h2>
        </div>
        <p className="text-sm text-muted-foreground">{totalCadence} planned posts / month</p>
      </div>

      {createMutation.isError ? (
        <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Could not add pillar.')} />
      ) : null}
      {deleteMutation.isError ? (
        <ErrorPanel message={getApiErrorMessage(deleteMutation.error, 'Could not remove pillar.')} />
      ) : null}

      {pillarsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading content pillars.</p>
      ) : pillarsQuery.isError ? (
        <ErrorPanel message="Unable to load content pillars." />
      ) : pillars.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content pillars yet. Add the themes this brand posts about.</p>
      ) : (
        <div className="grid gap-2">
          {pillars.map((pillar) => (
            <article
              className="grid gap-3 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              key={pillar.id}
            >
              <div>
                <div className="font-semibold">{pillar.name}</div>
                {pillar.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor={`cadence-${pillar.id}`}>
                  /mo
                </label>
                <input
                  className="input w-20"
                  defaultValue={pillar.cadencePerMonth}
                  disabled={updateMutation.isPending}
                  id={`cadence-${pillar.id}`}
                  min="0"
                  onBlur={(event) => {
                    const next = Number(event.target.value) || 0;

                    if (next !== pillar.cadencePerMonth) {
                      updateMutation.mutate({ id: pillar.id, cadencePerMonth: next });
                    }
                  }}
                  type="number"
                />
                <button
                  aria-label={`Remove ${pillar.name}`}
                  className="button button-secondary"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(pillar.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <form className="grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
        <div className="field">
          <label htmlFor="pillar-name">Pillar name</label>
          <input
            className="input"
            id="pillar-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Behind the scenes"
            value={name}
          />
        </div>
        <div className="field">
          <label htmlFor="pillar-description">Description</label>
          <input
            className="input"
            id="pillar-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional"
            value={description}
          />
        </div>
        <div className="field">
          <label htmlFor="pillar-cadence">Posts / mo</label>
          <input
            className="input w-24"
            id="pillar-cadence"
            min="0"
            onChange={(event) => setCadence(event.target.value)}
            type="number"
            value={cadence}
          />
        </div>
        <button
          className="button button-primary sm:col-span-3"
          disabled={createMutation.isPending || !name.trim()}
          type="submit"
        >
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? 'Adding' : 'Add pillar'}
        </button>
      </form>
    </section>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</div>
  );
}
