'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Save, Trash2, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { deleteUser, getCurrentUser, getUsers, inviteUser, registerUser, sendUserPasswordReset, updateUser } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { InviteUserPayload, RegisterPayload, UpdateUserPayload, User, UserRole, UserStatus } from '@/lib/types';

const initialValues: RegisterPayload = {
  email: '',
  name: '',
  password: '',
  role: 'CLIENT',
};

const initialInviteValues: InviteUserPayload = {
  email: '',
  name: '',
  role: 'CLIENT',
};

type EditableUser = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<RegisterPayload>(initialValues);
  const [inviteValues, setInviteValues] = useState<InviteUserPayload>(initialInviteValues);
  const [editValues, setEditValues] = useState<Record<string, EditableUser>>({});
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const currentUserQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: getCurrentUser });
  const users = usersQuery.data ?? [];
  const currentUser = currentUserQuery.data;

  const createMutation = useMutation({
    mutationFn: () =>
      registerUser({
        ...values,
        email: values.email.trim().toLowerCase(),
        name: values.name.trim(),
      }),
    onSuccess: async () => {
      setValues(initialValues);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteUser({
        ...inviteValues,
        email: inviteValues.email.trim().toLowerCase(),
        name: inviteValues.name.trim(),
      }),
    onSuccess: async () => {
      setInviteValues(initialInviteValues);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: async (user) => {
      setEditValues((current) => ({ ...current, [user.id]: toEditableUser(user) }));
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetMutation = useMutation({ mutationFn: sendUserPasswordReset });

  function updateValue<Key extends keyof RegisterPayload>(key: Key, value: RegisterPayload[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateInviteValue<Key extends keyof InviteUserPayload>(key: Key, value: InviteUserPayload[Key]) {
    setInviteValues((current) => ({ ...current, [key]: value }));
  }

  function updateEditValue<Key extends keyof EditableUser>(id: string, key: Key, value: EditableUser[Key]) {
    setEditValues((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? toEditableUser(users.find((user) => user.id === id)!)),
        [key]: value,
      },
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    inviteMutation.mutate();
  }

  function saveUser(user: User) {
    const editableUser = editValues[user.id];

    if (!editableUser) {
      return;
    }

    const payload: UpdateUserPayload = {
      email: editableUser.email.trim().toLowerCase(),
      name: editableUser.name.trim(),
      role: editableUser.role,
      status: editableUser.status,
    };

    if (editableUser.password.trim()) {
      payload.password = editableUser.password;
    }

    updateMutation.mutate({ id: user.id, payload });
  }

  function removeUser(user: User) {
    if (window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) {
      deleteMutation.mutate(user.id);
    }
  }

  const managementError = usersQuery.error ?? updateMutation.error ?? deleteMutation.error;

  return (
    <>
      <section>
        <h1 className="text-2xl font-black">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, edit, reset, and remove login accounts</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="panel grid gap-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="font-black">Manage accounts</h2>
            </div>
            <button className="button button-secondary" onClick={() => usersQuery.refetch()} type="button">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {managementError ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getApiErrorMessage(managementError, 'Unable to manage user accounts.')}
            </div>
          ) : null}

          {updateMutation.isSuccess ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              User account updated.
            </div>
          ) : null}

          {deleteMutation.isSuccess || resetMutation.isSuccess ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {resetMutation.isSuccess ? 'Password reset email sent.' : 'User account deleted.'}
            </div>
          ) : null}

          {usersQuery.isLoading ? (
            <div className="grid place-items-center rounded-lg border border-dashed p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3">
              {users.map((user) => {
                const editableUser = editValues[user.id] ?? toEditableUser(user);
                const isCurrentUser = user.id === currentUser?.id;
                const isSaving = updateMutation.isPending && updateMutation.variables?.id === user.id;
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === user.id;

                return (
                  <article className="rounded-xl border bg-background p-4" key={user.id}>
                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_140px_140px_1fr_auto] lg:items-end">
                      <div className="field">
                        <label htmlFor={`name-${user.id}`}>Name</label>
                        <input
                          className="input"
                          id={`name-${user.id}`}
                          minLength={2}
                          onChange={(event) => updateEditValue(user.id, 'name', event.target.value)}
                          value={editableUser.name}
                        />
                      </div>

                      <div className="field">
                        <label htmlFor={`email-${user.id}`}>Email</label>
                        <input
                          className="input"
                          id={`email-${user.id}`}
                          onChange={(event) => updateEditValue(user.id, 'email', event.target.value)}
                          type="email"
                          value={editableUser.email}
                        />
                      </div>

                      <div className="field">
                        <label htmlFor={`role-${user.id}`}>Role</label>
                        <select
                          className="select"
                          disabled={isCurrentUser}
                          id={`role-${user.id}`}
                          onChange={(event) => updateEditValue(user.id, 'role', event.target.value as UserRole)}
                          value={editableUser.role}
                        >
                          <option value="CLIENT">Client</option>
                          <option value="TEAM">Team</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor={`status-${user.id}`}>Status</label>
                        <select
                          className="select"
                          disabled={isCurrentUser}
                          id={`status-${user.id}`}
                          onChange={(event) => updateEditValue(user.id, 'status', event.target.value as UserStatus)}
                          value={editableUser.status}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="DISABLED">Disabled</option>
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor={`password-${user.id}`}>New password</label>
                        <input
                          autoComplete="new-password"
                          className="input"
                          id={`password-${user.id}`}
                          minLength={8}
                          onChange={(event) => updateEditValue(user.id, 'password', event.target.value)}
                          placeholder="Leave unchanged"
                          type="password"
                          value={editableUser.password}
                        />
                      </div>

                      <div className="flex gap-2 lg:justify-end">
                        <button
                          className="button button-primary"
                          disabled={isSaving || isDeleting}
                          onClick={() => saveUser(user)}
                          type="button"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving' : 'Save'}
                        </button>
                        <button
                          className="button button-secondary text-red-700"
                          disabled={isCurrentUser || isSaving || isDeleting}
                          onClick={() => removeUser(user)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? 'Deleting' : 'Delete'}
                        </button>
                        <button
                          className="button button-secondary"
                          disabled={resetMutation.isPending && resetMutation.variables === user.id}
                          onClick={() => resetMutation.mutate(user.id)}
                          type="button"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created {formatDate(user.createdAt)} {isCurrentUser ? '· Current account' : ''}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid content-start gap-6">
        <form className="panel grid content-start gap-5 p-5" onSubmit={submitInvite}>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Invite user by email</h2>
          </div>

          {inviteMutation.isSuccess ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Invite email sent.
            </div>
          ) : null}

          {inviteMutation.isError ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getApiErrorMessage(inviteMutation.error, 'Unable to invite user.')}
            </div>
          ) : null}

          <div className="grid gap-4">
            <div className="field">
              <label htmlFor="invite-name">Name</label>
              <input
                className="input"
                id="invite-name"
                minLength={2}
                onChange={(event) => updateInviteValue('name', event.target.value)}
                required
                value={inviteValues.name}
              />
            </div>

            <div className="field">
              <label htmlFor="invite-email">Email</label>
              <input
                autoComplete="email"
                className="input"
                id="invite-email"
                onChange={(event) => updateInviteValue('email', event.target.value)}
                required
                type="email"
                value={inviteValues.email}
              />
            </div>

            <div className="field">
              <label htmlFor="invite-role">Role</label>
              <select
                className="select"
                id="invite-role"
                onChange={(event) => updateInviteValue('role', event.target.value as UserRole)}
                value={inviteValues.role}
              >
                <option value="CLIENT">Client</option>
                <option value="TEAM">Team</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <button className="button button-primary justify-center" disabled={inviteMutation.isPending} type="submit">
            <UserCog className="h-4 w-4" />
            {inviteMutation.isPending ? 'Sending invite' : 'Send invite'}
          </button>
        </form>

        <form className="panel grid content-start gap-5 p-5" onSubmit={submit}>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Create user account</h2>
          </div>

          {createMutation.isSuccess ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              User account created.
            </div>
          ) : null}

          {createMutation.isError ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {getApiErrorMessage(createMutation.error, 'Unable to create user account.')}
            </div>
          ) : null}

          <div className="grid gap-4">
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

          <button className="button button-primary justify-center" disabled={createMutation.isPending} type="submit">
            <UserCog className="h-4 w-4" />
            {createMutation.isPending ? 'Creating account' : 'Create account'}
          </button>
        </form>
        </div>
      </section>
    </>
  );
}

function toEditableUser(user: User): EditableUser {
  return {
    email: user.email,
    name: user.name,
    password: '',
    role: user.role,
    status: user.status,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
