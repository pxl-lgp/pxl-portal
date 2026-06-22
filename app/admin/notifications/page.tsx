'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Save } from 'lucide-react';
import { useState } from 'react';
import { getNotificationSettings, updateNotificationSetting } from '@/lib/api';
import { NotificationSetting } from '@/lib/types';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ['notification-settings'], queryFn: getNotificationSettings });
  const mutation = useMutation({
    mutationFn: ({ eventKey, payload }: { eventKey: string; payload: Partial<NotificationSetting> }) => updateNotificationSetting(eventKey, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
  const settings = query.data ?? [];

  function save(setting: NotificationSetting, enabled: boolean) {
    const recipients = (drafts[setting.eventKey] ?? setting.recipients.join(', '))
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    mutation.mutate({ eventKey: setting.eventKey, payload: { enabled, recipients } });
  }

  return (
    <>
      <section>
        <h1 className="text-2xl font-black">Notification settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control who receives operational email alerts.</p>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b p-5">
          <Bell className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Email events</h2>
        </div>
        {query.isError ? <div className="p-5 text-sm text-red-700">Unable to load notification settings.</div> : null}
        <div className="grid">
          {settings.map((setting) => {
            const recipients = drafts[setting.eventKey] ?? setting.recipients.join(', ');

            return (
              <article className="grid gap-3 border-t p-5 first:border-t-0 lg:grid-cols-[220px_1fr_auto] lg:items-end" key={setting.eventKey}>
                <div>
                  <div className="font-black">{setting.eventKey.replaceAll('-', ' ')}</div>
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input checked={setting.enabled} onChange={(event) => save(setting, event.target.checked)} type="checkbox" />
                    Enabled
                  </label>
                </div>
                <div className="field">
                  <label htmlFor={setting.eventKey}>Recipients</label>
                  <input
                    className="input"
                    id={setting.eventKey}
                    onChange={(event) => setDrafts((current) => ({ ...current, [setting.eventKey]: event.target.value }))}
                    placeholder="ops@example.com, owner@example.com"
                    value={recipients}
                  />
                </div>
                <button className="button button-primary" disabled={mutation.isPending} onClick={() => save(setting, setting.enabled)} type="button">
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
