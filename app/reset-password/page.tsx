'use client';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { resetPassword } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="grid min-h-dvh place-items-center p-6">Loading reset form...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const mutation = useMutation({ mutationFn: () => resetPassword(token, password) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form className="panel grid w-full max-w-md gap-5 p-6" onSubmit={submit}>
        <div>
          <h1 className="text-2xl font-black">Set your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your invite or reset link to choose a new password.</p>
        </div>

        {mutation.isSuccess ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Password updated. You can now log in.
          </div>
        ) : null}

        {mutation.isError ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {getApiErrorMessage(mutation.error, 'Unable to update password.')}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="password">New password</label>
          <input className="input" id="password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </div>

        <button className="button button-primary justify-center" disabled={mutation.isPending || !token} type="submit">
          {mutation.isPending ? 'Saving password' : 'Save password'}
        </button>
        <Link className="text-center text-sm text-primary underline-offset-4 hover:underline" href="/login">
          Back to login
        </Link>
      </form>
    </main>
  );
}
