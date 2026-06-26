'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, KeyRound, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthGate } from '@/components/portal/auth-gate';
import { PortalShell } from '@/components/portal/portal-shell';
import { changeCurrentUserPassword, getCurrentUser, updateCurrentUser } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { User } from '@/lib/types';

export default function AccountPage() {
  return (
    <AuthGate>
      <AccountShell />
    </AuthGate>
  );
}

function AccountShell() {
  const userQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: getCurrentUser });
  const user = userQuery.data;

  if (userQuery.isLoading || !user) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading account.</div>;
  }

  return (
    <PortalShell mode={user.role === 'CLIENT' ? 'client' : 'admin'}>
      <AccountSettings user={user} />
    </PortalShell>
  );
}

function AccountSettings({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const profileMutation = useMutation({
    mutationFn: () =>
      updateCurrentUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['auth', 'me'], updatedUser);
    },
  });
  const passwordMutation = useMutation({
    mutationFn: () => changeCurrentUserPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
    },
  });

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    profileMutation.mutate();
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    passwordMutation.mutate();
  }

  return (
    <>
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">Account settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your profile and password.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
      <form className="panel grid content-start gap-5 p-5" onSubmit={submitProfile}>
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Profile</h2>
        </div>
        {profileMutation.isSuccess ? <SuccessMessage message="Profile updated." /> : null}
        {profileMutation.isError ? <ErrorMessage error={profileMutation.error} fallback="Unable to update profile." /> : null}
        <div className="grid gap-4">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input className="input" id="name" minLength={2} onChange={(event) => setName(event.target.value)} required value={name} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </div>
        </div>
        <button className="button button-primary justify-self-end" disabled={profileMutation.isPending} type="submit">
          {profileMutation.isPending ? 'Saving' : 'Save profile'}
        </button>
      </form>

      <form className="panel grid content-start gap-5 p-5" onSubmit={submitPassword}>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Password</h2>
        </div>
        {passwordMutation.isSuccess ? <SuccessMessage message="Password changed." /> : null}
        {passwordMutation.isError ? <ErrorMessage error={passwordMutation.error} fallback="Unable to change password." /> : null}
        <div className="grid gap-4">
          <div className="field">
            <label htmlFor="current-password">Current password</label>
            <input className="input" id="current-password" onChange={(event) => setCurrentPassword(event.target.value)} required type="password" value={currentPassword} />
          </div>
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input className="input" id="new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
          </div>
        </div>
        <button className="button button-primary justify-self-end" disabled={passwordMutation.isPending} type="submit">
          {passwordMutation.isPending ? 'Changing' : 'Change password'}
        </button>
      </form>
      </section>
    </>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function ErrorMessage({ error, fallback }: { error: unknown; fallback: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {getApiErrorMessage(error, fallback)}
    </div>
  );
}
