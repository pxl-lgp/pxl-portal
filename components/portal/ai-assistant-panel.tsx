'use client';

import { useMutation } from '@tanstack/react-query';
import { Bot, Clipboard, Hash, MessageSquareText, ScrollText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  generateBrief,
  generateCaption,
  generateHashtags,
  generateReelScript,
} from '@/lib/api';
import { Client, ContentItem } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

type AiTask = 'caption' | 'hashtags' | 'reel-script' | 'brief';

const tasks: Array<{
  id: AiTask;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'caption', label: 'Caption', icon: MessageSquareText },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'reel-script', label: 'Reel script', icon: ScrollText },
  { id: 'brief', label: 'Brief', icon: Clipboard },
];

export function AiAssistantPanel({
  client,
  contentItem,
  onApplyCaption,
  onApplyHashtags,
}: {
  client?: Client;
  contentItem: ContentItem;
  onApplyCaption: (caption: string) => void;
  onApplyHashtags: (hashtags: string[]) => void;
}) {
  const [task, setTask] = useState<AiTask>('caption');
  const [output, setOutput] = useState('');
  const [meta, setMeta] = useState('');
  const mutation = useMutation({
    mutationFn: async (selectedTask: AiTask) => {
      const payload = {
        clientName: client?.businessName ?? 'Unknown client',
        industry: client?.industry ?? undefined,
        contentTitle: contentItem.title,
        contentType: contentItem.contentType,
        platform: contentItem.platform ?? undefined,
        goals: client?.goals ?? undefined,
        brandNotes: client?.brandNotes ?? undefined,
        context: contentItem.caption ?? undefined,
        tone: 'clear, practical, brand-safe',
        hashtags: contentItem.hashtags,
      };

      if (selectedTask === 'caption') {
        return generateCaption(payload);
      }

      if (selectedTask === 'hashtags') {
        return generateHashtags(payload);
      }

      if (selectedTask === 'reel-script') {
        return generateReelScript(payload);
      }

      return generateBrief(payload);
    },
    onSuccess: (data, selectedTask) => {
      setTask(selectedTask);
      setOutput(data.output);
      setMeta(`${data.provider} / ${data.model}`);
    },
  });

  function applyOutput() {
    if (!output) {
      return;
    }

    if (task === 'caption') {
      onApplyCaption(output);
    }

    if (task === 'hashtags') {
      onApplyHashtags(parseHashtags(output));
    }
  }

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-[var(--brand)]" />
        <h2 className="font-black">AI assistant</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tasks.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="button button-secondary"
              disabled={mutation.isPending}
              key={item.id}
              onClick={() => mutation.mutate(item.id)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {mutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {getApiErrorMessage(mutation.error, 'AI generation failed.')}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="ai-output">Draft output {meta ? `(${meta})` : ''}</label>
        <textarea
          className="textarea min-h-48"
          id="ai-output"
          onChange={(event) => setOutput(event.target.value)}
          placeholder="Generated drafts will appear here."
          value={output}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          className="button button-secondary"
          disabled={!output || !['caption', 'hashtags'].includes(task)}
          onClick={applyOutput}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          Apply draft
        </button>
      </div>
    </section>
  );
}

function parseHashtags(output: string) {
  return output
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);
}
