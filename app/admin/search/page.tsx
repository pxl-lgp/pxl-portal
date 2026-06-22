'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { globalSearch } from '@/lib/api';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);
  const query = useQuery({ queryKey: ['global-search', deferredQ], queryFn: () => globalSearch(deferredQ), enabled: deferredQ.trim().length > 1 });
  const results = query.data ?? [];

  return (
    <>
      <section><h1 className="text-2xl font-black">Global search</h1><p className="mt-1 text-sm text-muted-foreground">Search clients, leads, content, assets, and reports.</p></section>
      <section className="panel grid gap-4 p-5">
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input className="input pl-9" onChange={(event) => setQ(event.target.value)} placeholder="Search anything" value={q} /></div>
        {results.length === 0 ? <p className="text-sm text-muted-foreground">Enter at least 2 characters.</p> : results.map((result) => (
          <Link className="rounded-lg border p-3 hover:bg-muted/40" href={result.href} key={`${result.type}-${result.id}`}><span className="badge bg-slate-100 text-slate-800">{result.type}</span><span className="ml-3 font-bold">{result.title}</span></Link>
        ))}
      </section>
    </>
  );
}
