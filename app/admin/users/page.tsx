'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Save, Trash2, UserCog, UserPlus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { deleteUser, getCurrentUser, getUsers, inviteUser, registerUser, sendUserPasswordReset, updateUser } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { InviteUserPayload, RegisterPayload, UpdateUserPayload, User, UserRole, UserStatus } from '@/lib/types';

const initialValues: RegisterPayload = {
  email: '',
  name: '',
  password: '',
  role: 'TEAM',
};

const initialInviteValues: InviteUserPayload = {
  email: '',
  name: '',
  role: 'TEAM',
};

type EditableUser = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

type UserModal = 'invite' | 'create' | null;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<RegisterPayload>(initialValues);
  const [inviteValues, setInviteValues] = useState<InviteUserPayload>(initialInviteValues);
  const [editValues, setEditValues] = useState<Record<string, EditableUser>>({});
  const [activeModal, setActiveModal] = useState<UserModal>(null);
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
      setActiveModal(null);
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
      setActiveModal(null);
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
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, reset, and remove login accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button button-secondary" onClick={() => setActiveModal('invite')} type="button">
            <UserPlus className="h-4 w-4" />
            Invite user
          </button>
          <button className="button button-primary" onClick={() => setActiveModal('create')} type="button">
            <UserCog className="h-4 w-4" />
            Create user
          </button>
          <button className="button button-secondary" onClick={() => usersQuery.refetch()} type="button">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      <section className="panel grid gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">Manage accounts</h2>
          </div>
          <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>

        {managementError ? <ErrorMessage message={getApiErrorMessage(managementError, 'Unable to manage user accounts.')} /> : null}
        {updateMutation.isSuccess ? <SuccessMessage message="User account updated." /> : null}
        {deleteMutation.isSuccess || resetMutation.isSuccess ? (
          <SuccessMessage message={resetMutation.isSuccess ? 'Password reset email sent.' : 'User account deleted.'} />
        ) : null}

        {usersQuery.isLoading ? (
          <div className="grid place-items-center rounded-lg border border-dashed p-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
            No users yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">New password</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const editableUser = editValues[user.id] ?? toEditableUser(user);
                  const isCurrentUser = user.id === currentUser?.id;
                  const isSaving = updateMutation.isPending && updateMutation.variables?.id === user.id;
                  const isDeleting = deleteMutation.isPending && deleteMutation.variables === user.id;

                  return (
                    <tr className="border-t border-[var(--border)] align-top" key={user.id}>
                      <td className="px-4 py-3">
                        <input
                          className="input min-w-40"
                          minLength={2}
                          onChange={(event) => updateEditValue(user.id, 'name', event.target.value)}
                          value={editableUser.name}
                        />
                        {isCurrentUser ? <div className="mt-1 text-xs text-muted-foreground">Current account</div> : null}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input min-w-52"
                          onChange={(event) => updateEditValue(user.id, 'email', event.target.value)}
                          type="email"
                          value={editableUser.email}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="select min-w-32"
                          disabled={isCurrentUser}
                          onChange={(event) => updateEditValue(user.id, 'role', event.target.value as UserRole)}
                          value={editableUser.role}
                        >
                          {editableUser.role === 'CLIENT' ? <option value="CLIENT">Client</option> : null}
                          <option value="TEAM">Team</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="select min-w-32"
                          disabled={isCurrentUser}
                          onChange={(event) => updateEditValue(user.id, 'status', event.target.value as UserStatus)}
                          value={editableUser.status}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="DISABLED">Disabled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          autoComplete="new-password"
                          className="input min-w-40"
                          minLength={8}
                          onChange={(event) => updateEditValue(user.id, 'password', event.target.value)}
                          placeholder="Leave unchanged"
                          type="password"
                          value={editableUser.password}
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="button button-primary" disabled={isSaving || isDeleting} onClick={() => saveUser(user)} type="button">
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving' : 'Save'}
                          </button>
                          <button
                            className="button button-secondary"
                            disabled={resetMutation.isPending && resetMutation.variables === user.id}
                            onClick={() => resetMutation.mutate(user.id)}
                            type="button"
                          >
                            Reset
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <UserFormModal onClose={() => setActiveModal(null)} open={activeModal === 'invite'} title="Invite user by email">
        <form className="grid gap-5" onSubmit={submitInvite}>
          <p className="text-sm text-muted-foreground">
            Client portal accounts are created from the Clients page so they are linked to a client profile.
          </p>
          {inviteMutation.isError ? <ErrorMessage message={getApiErrorMessage(inviteMutation.error, 'Unable to invite user.')} /> : null}
          <UserFields
            email={inviteValues.email}
            name={inviteValues.name}
            role={inviteValues.role}
            setEmail={(value) => updateInviteValue('email', value)}
            setName={(value) => updateInviteValue('name', value)}
            setRole={(value) => updateInviteValue('role', value)}
          />
          <button className="button button-primary justify-center" disabled={inviteMutation.isPending} type="submit">
            <UserPlus className="h-4 w-4" />
            {inviteMutation.isPending ? 'Sending invite' : 'Send invite'}
          </button>
        </form>
      </UserFormModal>

      <UserFormModal onClose={() => setActiveModal(null)} open={activeModal === 'create'} title="Create user account">
        <form className="grid gap-5" onSubmit={submit}>
          <p className="text-sm text-muted-foreground">
            Use Clients to create linked client portal accounts. This form is for team and admin accounts.
          </p>
          {createMutation.isError ? <ErrorMessage message={getApiErrorMessage(createMutation.error, 'Unable to create user account.')} /> : null}
          <UserFields
            email={values.email}
            name={values.name}
            role={values.role}
            setEmail={(value) => updateValue('email', value)}
            setName={(value) => updateValue('name', value)}
            setRole={(value) => updateValue('role', value)}
          />
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
          <button className="button button-primary justify-center" disabled={createMutation.isPending} type="submit">
            <UserCog className="h-4 w-4" />
            {createMutation.isPending ? 'Creating account' : 'Create account'}
          </button>
        </form>
      </UserFormModal>
    </>
  );
}

function UserFields({
  email,
  name,
  role,
  setEmail,
  setName,
  setRole,
}: {
  email: string;
  name: string;
  role: UserRole;
  setEmail: (value: string) => void;
  setName: (value: string) => void;
  setRole: (value: UserRole) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="field">
        <label htmlFor="modal-name">Name</label>
        <input className="input" id="modal-name" minLength={2} onChange={(event) => setName(event.target.value)} required value={name} />
      </div>
      <div className="field">
        <label htmlFor="modal-email">Email</label>
        <input autoComplete="email" className="input" id="modal-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </div>
      <div className="field">
        <label htmlFor="modal-role">Role</label>
        <select className="select" id="modal-role" onChange={(event) => setRole(event.target.value as UserRole)} value={role}>
          <option value="TEAM">Team</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
    </div>
  );
}

function UserFormModal({ children, onClose, open, title }: { children: React.ReactNode; onClose: () => void; open: boolean; title: string }) {
  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="font-black">{title}</h2>
          </div>
          <button aria-label="Close modal" className="button button-secondary p-2" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
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
