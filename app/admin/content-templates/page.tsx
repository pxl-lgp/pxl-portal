'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Copy, LayoutTemplate, RefreshCw, Save, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import {
  createContentTemplate,
  deleteContentTemplate,
  getClients,
  getContentTemplates,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { ContentTemplatePayload } from '@/lib/types';

type TemplateFormValues = {
  clientId: string;
  name: string;
  contentType: string;
  platform: string;
  body: string;
};

const emptyValues: TemplateFormValues = {
  clientId: '',
  name: '',
  contentType: 'post',
  platform: '',
  body: '',
};

export default function ContentTemplatesPage() {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState('');
  const templatesQuery = useQuery({
    queryKey: ['content-templates', scope || 'all'],
    queryFn: () => getContentTemplates(scope || undefined),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const templates = useMemo(() => templatesQuery.data ?? [], [templatesQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const [values, setValues] = useState<TemplateFormValues>(emptyValues);
  const [copiedId, setCopiedId] = useState('');

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ['content-templates'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: ContentTemplatePayload) => createContentTemplate(payload),
    onSuccess: async () => {
      setValues((current) => ({ ...emptyValues, clientId: current.clientId }));
      await invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContentTemplate(id),
    onSuccess: invalidate,
  });

  function updateValue<K extends keyof TemplateFormValues>(key: K, value: TemplateFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.body.trim()) {
      return;
    }

    createMutation.mutate({
      clientId: values.clientId || undefined,
      name: values.name.trim(),
      contentType: values.contentType.trim(),
      platform: values.platform.trim() || undefined,
      body: values.body,
    });
  }

  async function copyBody(id: string, body: string) {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); ignore silently.
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Content templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable caption and brief structures, shared across clients or scoped to one
          </p>
        </div>
        <button className="button button-secondary" onClick={() => templatesQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
            <LayoutTemplate className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Template library</h2>
          </div>
          <div className="border-b border-[var(--border)] p-4">
            <select className="select sm:w-72" onChange={(event) => setScope(event.target.value)} value={scope}>
              <option value="">Shared + all clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.businessName}
                </option>
              ))}
            </select>
          </div>
          {templatesQuery.isError ? (
            <ErrorPanel message="Unable to load templates." />
          ) : templates.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No templates yet.
            </div>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2">
              {templates.map((template) => (
                <article
                  className="grid content-start gap-3 rounded-2xl border border-[var(--border)] bg-background p-4 shadow-sm"
                  key={template.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{template.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {template.clientId ? clientById.get(template.clientId)?.businessName ?? 'Client' : 'Shared'}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="badge bg-sky-100 text-sky-800">{template.contentType}</span>
                      {template.platform ? (
                        <span className="badge bg-[var(--panel-muted)] text-foreground/80">{template.platform}</span>
                      ) : null}
                    </div>
                  </div>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 font-sans text-sm">
                    {template.body}
                  </pre>
                  <div className="flex flex-wrap gap-2">
                    <button className="button button-secondary" onClick={() => copyBody(template.id, template.body)} type="button">
                      <Copy className="h-4 w-4" />
                      {copiedId === template.id ? 'Copied' : 'Copy body'}
                    </button>
                    <button
                      className="button button-secondary"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(template.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">New template</h2>
          </div>
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Template creation failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Template saved.
            </div>
          ) : null}
          <form className="panel grid gap-4 p-5" onSubmit={submit}>
            <div className="field">
              <label htmlFor="clientId">Scope</label>
              <select
                className="select"
                id="clientId"
                onChange={(event) => updateValue('clientId', event.target.value)}
                value={values.clientId}
              >
                <option value="">Shared (all clients)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.businessName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                className="input"
                id="name"
                onChange={(event) => updateValue('name', event.target.value)}
                required
                value={values.name}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="contentType">Content type</label>
                <input
                  className="input"
                  id="contentType"
                  onChange={(event) => updateValue('contentType', event.target.value)}
                  required
                  value={values.contentType}
                />
              </div>
              <div className="field">
                <label htmlFor="platform">Platform</label>
                <input
                  className="input"
                  id="platform"
                  onChange={(event) => updateValue('platform', event.target.value)}
                  placeholder="Optional"
                  value={values.platform}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="body">Body</label>
              <textarea
                className="textarea min-h-40"
                id="body"
                onChange={(event) => updateValue('body', event.target.value)}
                placeholder="Use {{placeholders}} the team can fill in."
                required
                value={values.body}
              />
            </div>
            <button
              className="button button-primary"
              disabled={createMutation.isPending || !values.name.trim() || !values.body.trim()}
              type="submit"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving' : 'Save template'}
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
