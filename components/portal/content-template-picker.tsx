'use client';

import { useQuery } from '@tanstack/react-query';
import { LayoutTemplate, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { getContentTemplates } from '@/lib/api';

export function ContentTemplatePicker({
  clientId,
  onApply,
}: {
  clientId: string;
  // Applies the template body to the content item's caption.
  onApply: (body: string) => void;
}) {
  const templatesQuery = useQuery({
    queryKey: ['content-templates', clientId || 'all'],
    queryFn: () => getContentTemplates(clientId || undefined),
  });
  const templates = templatesQuery.data ?? [];
  const [selectedId, setSelectedId] = useState('');
  const selected = templates.find((template) => template.id === selectedId);

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex items-center gap-2">
        <LayoutTemplate className="h-5 w-5 text-[var(--brand)]" />
        <h2 className="font-black">Use a template</h2>
      </div>

      {templatesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading templates.</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No templates available for this client yet. Create some in Content templates.
        </p>
      ) : (
        <>
          <div className="field">
            <label htmlFor="template-picker">Template</label>
            <select
              className="select"
              id="template-picker"
              onChange={(event) => setSelectedId(event.target.value)}
              value={selectedId}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.clientId ? 'client' : 'shared'} · {template.contentType})
                </option>
              ))}
            </select>
          </div>

          {selected ? (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3 font-sans text-sm">
              {selected.body}
            </pre>
          ) : null}

          <div className="flex justify-end">
            <button
              className="button button-primary"
              disabled={!selected}
              onClick={() => selected && onApply(selected.body)}
              type="button"
            >
              <Wand2 className="h-4 w-4" />
              Apply as caption
            </button>
          </div>
        </>
      )}
    </section>
  );
}
