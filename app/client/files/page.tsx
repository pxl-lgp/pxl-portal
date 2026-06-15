'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { DriveBrowser } from '@/components/portal/drive-browser';
import { getClientPortalOverview } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

export default function ClientFilesPage() {
  const overviewQuery = useQuery({
    queryKey: ['client-portal', 'overview'],
    queryFn: getClientPortalOverview,
  });

  if (overviewQuery.isLoading) {
    return <div className="panel p-5 text-sm text-muted-foreground">Loading file workspace...</div>;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div className="panel flex items-start gap-2 p-5 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {getApiErrorMessage(overviewQuery.error, 'Unable to load the client workspace.')}
      </div>
    );
  }

  return (
    <>
      <section>
        <h1 className="text-2xl font-black">Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and upload files for {overviewQuery.data.client.businessName}.
        </p>
      </section>
      <DriveBrowser clientMode driveUrl={overviewQuery.data.client.driveFolderUrl} />
    </>
  );
}
