'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Archive, ExternalLink, RefreshCw, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createAsset, getAssets, getClients, getContentItems } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { AssetPayload } from '@/lib/types';

type AssetFormValues = {
  clientId: string;
  contentItemId: string;
  name: string;
  assetType: string;
  driveUrl: string;
  version: string;
  tags: string;
};

const emptyValues: AssetFormValues = {
  clientId: '',
  contentItemId: '',
  name: '',
  assetType: 'graphic',
  driveUrl: '',
  version: '1',
  tags: '',
};

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ clientId: '', assetType: '', q: '' });
  const assetsQuery = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => getAssets(filters),
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const contentQuery = useQuery({
    queryKey: ['content'],
    queryFn: () => getContentItems(),
  });
  const assets = useMemo(() => assetsQuery.data ?? [], [assetsQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const contentItems = useMemo(() => contentQuery.data ?? [], [contentQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const contentById = new Map(contentItems.map((item) => [item.id, item]));
  const [values, setValues] = useState<AssetFormValues>({
    ...emptyValues,
    clientId: clients[0]?.id ?? '',
  });
  const filteredContent = contentItems.filter((item) => item.clientId === (values.clientId || clients[0]?.id));
  const createMutation = useMutation({
    mutationFn: (payload: AssetPayload) => createAsset(payload),
    onSuccess: async () => {
      setValues((current) => ({
        ...emptyValues,
        clientId: current.clientId,
      }));
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
  const selectedClientId = values.clientId || clients[0]?.id || '';

  function updateValue<K extends keyof AssetFormValues>(key: K, value: AssetFormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'clientId' ? { contentItemId: '' } : {}),
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClientId) {
      return;
    }

    createMutation.mutate({
      clientId: selectedClientId,
      contentItemId: values.contentItemId || undefined,
      name: values.name.trim(),
      assetType: values.assetType.trim(),
      driveUrl: values.driveUrl.trim(),
      version: Number(values.version) || 1,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Assets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drive links, versions, and production file references</p>
        </div>
        <button className="button button-secondary" onClick={() => assetsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
            <Archive className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Asset list</h2>
          </div>
          <div className="grid gap-3 border-b border-[var(--border)] p-4 sm:grid-cols-3">
            <select
              className="select"
              onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))}
              value={filters.clientId}
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.businessName}
                </option>
              ))}
            </select>
            <input
              className="input"
              onChange={(event) => setFilters((current) => ({ ...current, assetType: event.target.value }))}
              placeholder="Filter by type"
              value={filters.assetType}
            />
            <input
              className="input"
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Search name"
              value={filters.q}
            />
          </div>
          {assetsQuery.isError ? (
            <ErrorPanel message="Unable to load assets." />
          ) : assets.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No asset records yet.
            </div>
          ) : (
            <div className="grid">
              {assets.map((asset) => {
                const client = clientById.get(asset.clientId);
                const contentItem = asset.contentItemId ? contentById.get(asset.contentItemId) : undefined;

                return (
                  <article className="grid gap-3 border-t border-[var(--border)] p-5" key={asset.id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-black">{asset.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client?.businessName ?? 'Unknown client'}
                          {contentItem ? ` / ${contentItem.title}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge bg-sky-100 text-sky-800">{asset.assetType}</span>
                        <span className="badge bg-[var(--panel-muted)] text-foreground/80">v{asset.version}</span>
                      </div>
                    </div>
                    {asset.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {asset.tags.map((tag) => (
                          <span className="badge bg-emerald-100 text-emerald-800" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <a className="button button-secondary w-fit" href={asset.driveUrl}>
                      <ExternalLink className="h-4 w-4" />
                      Open Drive link
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Add asset</h2>
          </div>
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Asset creation failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Asset saved.
            </div>
          ) : null}
          <form className="panel grid gap-4 p-5" onSubmit={submit}>
            <div className="field">
              <label htmlFor="clientId">Client</label>
              <select
                className="select"
                disabled={clients.length === 0}
                id="clientId"
                onChange={(event) => updateValue('clientId', event.target.value)}
                value={selectedClientId}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.businessName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="contentItemId">Content item</label>
              <select
                className="select"
                id="contentItemId"
                onChange={(event) => updateValue('contentItemId', event.target.value)}
                value={values.contentItemId}
              >
                <option value="">No linked content</option>
                {filteredContent.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <TextField label="Name" onChange={(value) => updateValue('name', value)} required value={values.name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Asset type"
                onChange={(value) => updateValue('assetType', value)}
                required
                value={values.assetType}
              />
              <TextField
                label="Version"
                min="1"
                onChange={(value) => updateValue('version', value)}
                required
                type="number"
                value={values.version}
              />
            </div>
            <TextField
              label="Drive URL"
              onChange={(value) => updateValue('driveUrl', value)}
              required
              type="url"
              value={values.driveUrl}
            />
            <TextField label="Tags" onChange={(value) => updateValue('tags', value)} value={values.tags} />
            <button className="button button-primary" disabled={createMutation.isPending || !selectedClientId} type="submit">
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving' : 'Save asset'}
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}

function TextField({
  label,
  min,
  onChange,
  required,
  type = 'text',
  value,
}: {
  label: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const id = label.toLowerCase().replaceAll(' ', '-');

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="input"
        id={id}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
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
