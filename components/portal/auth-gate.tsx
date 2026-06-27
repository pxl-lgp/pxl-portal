'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/api';
import { AUTH_TOKEN_CHANGED_EVENT, clearAccessToken, getAccessToken } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export function AuthGate({
  allowedRoles,
  children,
  redirectTo = '/login',
}: {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()));
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
  });

  useEffect(() => {
    function syncToken() {
      setHasToken(Boolean(getAccessToken()));
    }

    window.addEventListener('storage', syncToken);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);

    return () => {
      window.removeEventListener('storage', syncToken);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
    };
  }, []);

  useEffect(() => {
    if (!hasToken) {
      router.replace('/login');
    }
  }, [hasToken, router]);

  useEffect(() => {
    if (query.isError) {
      clearAccessToken();
      router.replace('/login');
    }
  }, [query.isError, router]);

  useEffect(() => {
    if (query.data && allowedRoles && !allowedRoles.includes(query.data.role)) {
      router.replace(query.data.role === 'CLIENT' ? '/client/dashboard' : redirectTo);
    }
  }, [allowedRoles, query.data, redirectTo, router]);

  if (!hasToken || query.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
      </main>
    );
  }

  if (!query.data || (allowedRoles && !allowedRoles.includes(query.data.role))) {
    return null;
  }

  return <>{children}</>;
}
