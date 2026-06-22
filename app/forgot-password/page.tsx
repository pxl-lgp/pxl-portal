'use client';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { forgotPassword } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: () => forgotPassword(email.trim().toLowerCase()) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form className="panel grid w-full max-w-md gap-5 p-6" onSubmit={submit}>
        <div>
          <h1 className="text-2xl font-black">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your account email and we will send a reset link.</p>
        </div>

        {mutation.isSuccess ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            If an active account exists, a reset email has been sent.
          </div>
        ) : null}

        {mutation.isError ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {getApiErrorMessage(mutation.error, 'Unable to request a password reset.')}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </div>

        <button className="button button-primary justify-center" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Sending reset link' : 'Send reset link'}
        </button>
        <Link className="text-center text-sm text-primary underline-offset-4 hover:underline" href="/login">
          Back to login
        </Link>
      </form>
    </main>
  );
}
