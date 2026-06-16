'use client';

import { Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Client, ClientPayload, ClientStatus } from '@/lib/types';

const statuses: ClientStatus[] = ['LEAD', 'ONBOARDING', 'ACTIVE', 'PAUSED', 'ARCHIVED'];

type ClientFormValues = {
  businessName: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  facebook: string;
  instagram: string;
  website: string;
  goals: string;
  brandNotes: string;
  servicesNeeded: string;
  status: ClientStatus;
  driveFolderUrl: string;
};

export function ClientForm({
  client,
  isSaving,
  onSubmit,
}: {
  client?: Client;
  isSaving: boolean;
  onSubmit: (payload: ClientPayload) => void;
}) {
  const initialValues = useMemo<ClientFormValues>(
    () => ({
      businessName: client?.businessName ?? '',
      industry: client?.industry ?? '',
      contactPerson: client?.contactPerson ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      facebook: client?.socialLinks.facebook ?? '',
      instagram: client?.socialLinks.instagram ?? '',
      website: client?.socialLinks.website ?? '',
      goals: client?.goals ?? '',
      brandNotes: client?.brandNotes ?? '',
      servicesNeeded: client?.servicesNeeded.join(', ') ?? '',
      status: client?.status ?? 'ONBOARDING',
      driveFolderUrl: client?.driveFolderUrl ?? '',
    }),
    [client],
  );
  const [values, setValues] = useState(initialValues);

  function updateValue<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const socialLinks = Object.fromEntries(
      Object.entries({
        facebook: values.facebook.trim(),
        instagram: values.instagram.trim(),
        website: values.website.trim(),
      }).filter(([, value]) => value.length > 0),
    );
    const servicesNeeded = values.servicesNeeded
      .split(',')
      .map((service) => service.trim())
      .filter(Boolean);

    onSubmit({
      businessName: values.businessName.trim(),
      industry: values.industry.trim() || undefined,
      contactPerson: values.contactPerson.trim() || undefined,
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      socialLinks,
      goals: values.goals.trim() || undefined,
      brandNotes: values.brandNotes.trim() || undefined,
      servicesNeeded,
      status: values.status,
      driveFolderUrl: values.driveFolderUrl.trim() || undefined,
    });
  }

  return (
    <form className="panel grid gap-5 p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Business name"
          onChange={(value) => updateValue('businessName', value)}
          required
          value={values.businessName}
        />
        <TextField
          label="Industry"
          onChange={(value) => updateValue('industry', value)}
          value={values.industry}
        />
        <TextField
          label="Contact person"
          onChange={(value) => updateValue('contactPerson', value)}
          value={values.contactPerson}
        />
        <TextField
          label="Email"
          onChange={(value) => updateValue('email', value)}
          type="email"
          value={values.email}
        />
        <TextField label="Phone" onChange={(value) => updateValue('phone', value)} value={values.phone} />
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            className="select"
            id="status"
            onChange={(event) => updateValue('status', event.target.value as ClientStatus)}
            value={values.status}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Facebook"
          onChange={(value) => updateValue('facebook', value)}
          value={values.facebook}
        />
        <TextField
          label="Instagram"
          onChange={(value) => updateValue('instagram', value)}
          value={values.instagram}
        />
        <TextField label="Website" onChange={(value) => updateValue('website', value)} value={values.website} />
        {client ? (
          <div className="field">
            <label htmlFor="drive-folder">Drive folder URL (manual fallback)</label>
            <input
              className="input"
              id="drive-folder"
              onChange={(event) => updateValue('driveFolderUrl', event.target.value)}
              value={values.driveFolderUrl}
            />
            <p className="text-xs text-muted-foreground">
              Normally filled automatically when the client is created.
            </p>
          </div>
        ) : null}
      </div>

      <TextField
        label="Services needed"
        onChange={(value) => updateValue('servicesNeeded', value)}
        value={values.servicesNeeded}
      />

      <TextArea label="Goals" onChange={(value) => updateValue('goals', value)} value={values.goals} />
      <TextArea
        label="Brand notes"
        onChange={(value) => updateValue('brandNotes', value)}
        value={values.brandNotes}
      />

      <div className="flex justify-end">
        <Button disabled={isSaving} size="lg" type="submit">
          <Save />
          {isSaving ? 'Saving' : 'Save client'}
        </Button>
      </div>
    </form>
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
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.toLowerCase().replaceAll(' ', '-');

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </div>
  );
}
