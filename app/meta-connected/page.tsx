'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetaConnectedPage() {
  return (
    <Suspense>
      <MetaConnectedResult />
    </Suspense>
  );
}

function MetaConnectedResult() {
  const searchParams = useSearchParams();
  const succeeded = searchParams.get('status') === 'success';
  const pages = searchParams.get('pages') ?? '0';
  const message = searchParams.get('message') ?? 'Meta authorization was not completed.';

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            {succeeded ? (
              <CheckCircle2 className="size-6 text-emerald-600" />
            ) : (
              <XCircle className="size-6 text-destructive" />
            )}
            {succeeded ? 'Meta account connected' : 'Connection not completed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <p className="text-sm text-muted-foreground">
            {succeeded
              ? `${pages} Facebook Page${pages === '1' ? '' : 's'} authorized. You can close this window and tell your agency the connection is ready.`
              : message}
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Return to portal</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
