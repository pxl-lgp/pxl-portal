'use client';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { registerUser } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { RegisterPayload, UserRole } from '@/lib/types';

const initialValues: RegisterPayload = {
  email: '',
  name: '',
  password: '',
  role: 'CLIENT',
};

export default function AdminUsersPage() {
  const [values, setValues] = useState<RegisterPayload>(initialValues);
  const mutation = useMutation({
    mutationFn: () =>
      registerUser({
        ...values,
        email: values.email.trim().toLowerCase(),
        name: values.name.trim(),
      }),
    onSuccess: () => {
      setValues(initialValues);
    },
  });

  function updateValue<Key extends keyof RegisterPayload>(key: Key, value: RegisterPayload[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <>
      <section>
        <h1 className="text-2xl font-black">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create admin, team, and client login accounts</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form className="panel grid gap-5 p-5" onSubmit={submit}>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create user account</h2>
          </div>

          {mutation.isSuccess ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              User account created.
            </div>
          ) : null}

          {mutation.isError ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getApiErrorMessage(mutation.error, 'Unable to create user account.')}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                className="input"
                id="name"
                minLength={2}
                onChange={(event) => updateValue('name', event.target.value)}
                required
                value={values.name}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                autoComplete="email"
                className="input"
                id="email"
                onChange={(event) => updateValue('email', event.target.value)}
                required
                type="email"
                value={values.email}
              />
            </div>

            <div className="field">
              <label htmlFor="role">Role</label>
              <select
                className="select"
                id="role"
                onChange={(event) => updateValue('role', event.target.value as UserRole)}
                value={values.role}
              >
                <option value="CLIENT">Client</option>
                <option value="TEAM">Team</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="password">Temporary password</label>
              <input
                autoComplete="new-password"
                className="input"
                id="password"
                minLength={8}
                onChange={(event) => updateValue('password', event.target.value)}
                required
                type="password"
                value={values.password}
              />
            </div>
          </div>

          {values.role === 'CLIENT' ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              Client login is linked by email. Use the exact same email saved on the client profile.
            </div>
          ) : null}

          <div className="flex justify-end">
            <button className="button button-primary" disabled={mutation.isPending} type="submit">
              <UserCog className="h-4 w-4" />
              {mutation.isPending ? 'Creating account' : 'Create account'}
            </button>
          </div>
        </form>

        <aside className="panel grid content-start gap-4 p-5">
          <h2 className="font-black">Login rules</h2>
          <div className="grid gap-3 text-sm leading-6 text-foreground/80">
            <p>
              <strong>Admin</strong> users manage all operations and can create more accounts.
            </p>
            <p>
              <strong>Team</strong> users can use the internal operations screens but cannot create users.
            </p>
            <p>
              <strong>Client</strong> users are redirected to their client dashboard after login.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
