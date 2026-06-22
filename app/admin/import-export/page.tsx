'use client';

import { useMutation } from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { exportCsv, importClients, importLeads } from '@/lib/api';

const exportEntities = ['clients', 'leads', 'content', 'analytics', 'audit', 'billing'];

export default function ImportExportPage() {
  const [entity, setEntity] = useState('clients');
  const [importType, setImportType] = useState<'clients' | 'leads'>('clients');
  const [csv, setCsv] = useState('');
  const exportMutation = useMutation({ mutationFn: exportCsv });
  const importMutation = useMutation({ mutationFn: () => importType === 'clients' ? importClients(parseCsv(csv)) : importLeads(parseCsv(csv)) });

  async function download() {
    const data = await exportMutation.mutateAsync(entity);
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entity}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    importMutation.mutate();
  }

  return (
    <>
      <section><h1 className="text-2xl font-black">Import / Export</h1><p className="mt-1 text-sm text-muted-foreground">Move operational data in and out of the system.</p></section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel grid content-start gap-4 p-5"><h2 className="font-black">Export CSV</h2><select className="select" onChange={(event) => setEntity(event.target.value)} value={entity}>{exportEntities.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="button button-primary" onClick={download} type="button"><Download className="h-4 w-4" />Download CSV</button></div>
        <form className="panel grid gap-4 p-5" onSubmit={submit}><h2 className="font-black">Import CSV</h2><select className="select" onChange={(event) => setImportType(event.target.value as 'clients' | 'leads')} value={importType}><option value="clients">Clients</option><option value="leads">Leads</option></select><textarea className="textarea min-h-52" onChange={(event) => setCsv(event.target.value)} placeholder="businessName,email,contactPerson" value={csv} /><button className="button button-primary" disabled={importMutation.isPending} type="submit"><Upload className="h-4 w-4" />Import</button>{importMutation.data ? <p className="text-sm font-bold text-emerald-700">Imported {importMutation.data.imported} rows.</p> : null}</form>
      </section>
    </>
  );
}

function parseCsv(value: string) {
  const [headerLine, ...lines] = value.trim().split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map((item) => item.trim());
  return lines.map((line) => Object.fromEntries(line.split(',').map((item, index) => [headers[index], item.trim()])));
}
