'use client';

import { useMutation } from '@tanstack/react-query';
import {
  Bot,
  Clapperboard,
  Clipboard,
  Hash,
  Layers,
  LayoutTemplate,
  MessageSquareText,
  ScrollText,
  Sparkles,
  Tags,
} from 'lucide-react';
import { useState } from 'react';
import {
  generateBrief,
  generateBroll,
  generateCaption,
  generateHashtags,
  generateOverlay,
  generateReelScript,
  generateTags,
  generateTemplate,
} from '@/lib/api';
import { AiGenerationPayload, Client, ContentItem } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/errors';

type AiTask =
  | 'caption'
  | 'hashtags'
  | 'reel-script'
  | 'brief'
  | 'broll'
  | 'overlay'
  | 'tags'
  | 'template';

const tasks: Array<{
  id: AiTask;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  generate: (payload: AiGenerationPayload) => ReturnType<typeof generateCaption>;
}> = [
  { id: 'caption', label: 'Caption', icon: MessageSquareText, generate: generateCaption },
  { id: 'hashtags', label: 'Hashtags', icon: Hash, generate: generateHashtags },
  { id: 'reel-script', label: 'Reel script', icon: ScrollText, generate: generateReelScript },
  { id: 'brief', label: 'Brief', icon: Clipboard, generate: generateBrief },
  { id: 'broll', label: 'B-roll', icon: Clapperboard, generate: generateBroll },
  { id: 'overlay', label: 'Overlay', icon: Layers, generate: generateOverlay },
  { id: 'tags', label: 'Tags', icon: Tags, generate: generateTags },
  { id: 'template', label: 'Template', icon: LayoutTemplate, generate: generateTemplate },
];

// Outputs that can be pushed back onto the content item as hashtags.
const hashtagTasks: AiTask[] = ['hashtags', 'tags'];

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
  const [taglish, setTaglish] = useState(false);
  const [seo, setSeo] = useState(false);
  const mutation = useMutation({
    mutationFn: async (selectedTask: AiTask) => {
      const payload: AiGenerationPayload = {
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
        language: taglish ? 'TAGLISH' : 'EN',
        seo,
      };

      const handler = tasks.find((item) => item.id === selectedTask) ?? tasks[0];

      return handler.generate(payload);
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

    if (hashtagTasks.includes(task)) {
      onApplyHashtags(parseHashtags(output));
    }
  }

  const canApply = output !== '' && (task === 'caption' || hashtagTasks.includes(task));

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">AI assistant</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Toggle
            active={taglish}
            label="Taglish"
            onToggle={() => setTaglish((current) => !current)}
            title="Generate in conversational Taglish instead of English"
          />
          <Toggle
            active={seo}
            label="SEO"
            onToggle={() => setSeo((current) => !current)}
            title="Bias output toward keyword-rich, search-friendly phrasing"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tasks.map((item) => {
          const Icon = item.icon;
          const isRunning = mutation.isPending && mutation.variables === item.id;

          return (
            <button
              className="button button-secondary"
              disabled={mutation.isPending}
              key={item.id}
              onClick={() => mutation.mutate(item.id)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {isRunning ? 'Working' : item.label}
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
          disabled={!canApply}
          onClick={applyOutput}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          {task === 'caption' ? 'Apply as caption' : 'Apply as hashtags'}
        </button>
      </div>
    </section>
  );
}

function Toggle({
  active,
  label,
  onToggle,
  title,
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
  title: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={`badge cursor-pointer border transition-colors ${
        active
          ? 'border-transparent bg-[var(--brand)] text-white'
          : 'border-[var(--border)] bg-[var(--panel-muted)] text-foreground/70'
      }`}
      onClick={onToggle}
      title={title}
      type="button"
    >
      {label}
    </button>
  );
}

function parseHashtags(output: string) {
  return output
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);
}
