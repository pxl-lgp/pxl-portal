'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Save, ScrollText } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createReport, getClients, getReports } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { ReportPayload } from '@/lib/types';

type ReportFormValues = {
  clientId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  driveUrl: string;
};

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
  });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const [values, setValues] = useState<ReportFormValues>({
    clientId: clients[0]?.id ?? '',
    title: '',
    periodStart: toInputDate(new Date()),
    periodEnd: toInputDate(new Date()),
    summary: '',
    driveUrl: '',
  });
  const createMutation = useMutation({
    mutationFn: (payload: ReportPayload) => createReport(payload),
    onSuccess: async () => {
      setValues((current) => ({
        ...current,
        title: '',
        summary: '',
        driveUrl: '',
      }));
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
  const selectedClientId = values.clientId || clients[0]?.id || '';

  function updateValue<K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClientId) {
      return;
    }

    createMutation.mutate({
      clientId: selectedClientId,
      title: values.title.trim(),
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: new Date(values.periodEnd).toISOString(),
      summary: values.summary.trim() || undefined,
      driveUrl: values.driveUrl.trim() || undefined,
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Prepare performance summaries and report handoff records</p>
        </div>
        <button className="button button-secondary" onClick={() => reportsQuery.refetch()} type="button">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border)] p-5">
            <ScrollText className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Report list</h2>
          </div>
          {reportsQuery.isError ? (
            <ErrorPanel message="Unable to load reports." />
          ) : reports.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
              No reports yet.
            </div>
          ) : (
            <div className="grid">
              {reports.map((report) => (
                <article className="grid gap-3 border-t border-[var(--border)] p-5" key={report.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-black">{report.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {clientById.get(report.clientId)?.businessName ?? 'Unknown client'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(report.periodStart).toLocaleDateString()} -{' '}
                      {new Date(report.periodEnd).toLocaleDateString()}
                    </div>
                  </div>
                  {report.summary ? <p className="text-sm text-foreground/80">{report.summary}</p> : null}
                  {report.driveUrl ? (
                    <a className="text-sm font-bold text-[var(--brand-dark)]" href={report.driveUrl}>
                      Drive report
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create report</h2>
          </div>
          {createMutation.isError ? (
            <ErrorPanel message={getApiErrorMessage(createMutation.error, 'Report creation failed.')} />
          ) : null}
          {createMutation.isSuccess ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Report saved.
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
            <TextField label="Title" onChange={(value) => updateValue('title', value)} required value={values.title} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Period start"
                onChange={(value) => updateValue('periodStart', value)}
                required
                type="date"
                value={values.periodStart}
              />
              <TextField
                label="Period end"
                onChange={(value) => updateValue('periodEnd', value)}
                required
                type="date"
                value={values.periodEnd}
              />
            </div>
            <TextField label="Drive URL" onChange={(value) => updateValue('driveUrl', value)} value={values.driveUrl} />
            <div className="field">
              <label htmlFor="summary">Summary</label>
              <textarea
                className="textarea"
                id="summary"
                onChange={(event) => updateValue('summary', event.target.value)}
                value={values.summary}
              />
            </div>
            <button className="button button-primary" disabled={createMutation.isPending || !selectedClientId} type="submit">
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving' : 'Save report'}
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}

function TextField({
  label,
  onChange,
  required,
  type = 'text',
  value,
}: {
  label: string;
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

function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
