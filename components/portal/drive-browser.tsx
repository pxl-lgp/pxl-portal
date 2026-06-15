'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  ExternalLink,
  File,
  Folder,
  FolderPlus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import {
  createClientDriveFolder,
  deleteClientDriveItem,
  downloadClientDriveFile,
  downloadMyDriveFile,
  getClientDriveItems,
  getMyDriveItems,
  uploadClientDriveFile,
  uploadMyDriveFile,
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { DriveItem } from '@/lib/types';

type FolderHistoryItem = { id: string; name: string };

export function DriveBrowser({
  clientId,
  clientMode = false,
  driveUrl,
}: {
  clientId?: string;
  clientMode?: boolean;
  driveUrl?: string | null;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folderId, setFolderId] = useState<string>();
  const [history, setHistory] = useState<FolderHistoryItem[]>([]);
  const [folderName, setFolderName] = useState('');
  const queryKey = clientMode
    ? ['client-drive', folderId ?? 'root']
    : ['admin-drive', clientId, folderId ?? 'root'];
  const listingQuery = useQuery({
    queryKey,
    queryFn: () =>
      clientMode
        ? getMyDriveItems(folderId)
        : getClientDriveItems(clientId as string, folderId),
    enabled: clientMode || Boolean(clientId),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: globalThis.File) =>
      clientMode
        ? uploadMyDriveFile(file, listingQuery.data?.currentFolder.id)
        : uploadClientDriveFile(clientId as string, file, listingQuery.data?.currentFolder.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createClientDriveFolder(
        clientId as string,
        name,
        listingQuery.data?.currentFolder.id,
      ),
    onSuccess: async () => {
      setFolderName('');
      await queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteClientDriveItem(clientId as string, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const downloadMutation = useMutation({
    mutationFn: async (item: DriveItem) => ({
      item,
      blob: clientMode
        ? await downloadMyDriveFile(item.id)
        : await downloadClientDriveFile(clientId as string, item.id),
    }),
    onSuccess: ({ blob, item }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      link.click();
      URL.revokeObjectURL(url);
    },
  });

  function openFolder(item: DriveItem) {
    const current = listingQuery.data?.currentFolder;

    if (current) {
      setHistory((items) => [...items, { id: current.id, name: current.name }]);
    }

    setFolderId(item.id);
  }

  function goBack() {
    const previous = history.at(-1);
    setHistory((items) => items.slice(0, -1));
    setFolderId(previous?.id);
  }

  function createFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = folderName.trim();

    if (name) {
      createFolderMutation.mutate(name);
    }
  }

  function remove(item: DriveItem) {
    if (window.confirm(`Delete "${item.name}" from Google Drive?`)) {
      deleteMutation.mutate(item.id);
    }
  }

  const mutationError =
    uploadMutation.error ??
    createFolderMutation.error ??
    deleteMutation.error ??
    downloadMutation.error;

  return (
    <section className="panel grid gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">Google Drive workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and transfer files without leaving the portal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {driveUrl ? (
            <a className="button button-secondary" href={driveUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="h-4 w-4" />
              Open in Drive
            </a>
          ) : null}
          <button
            className="button button-secondary"
            onClick={() => listingQuery.refetch()}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {listingQuery.isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(
            listingQuery.error,
            'Unable to load Google Drive. Check the API credentials and folder sharing.',
          )}
        </div>
      ) : null}

      {mutationError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(mutationError, 'The Google Drive action failed.')}
        </div>
      ) : null}

      {listingQuery.data ? (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--panel-muted)] p-3">
            {history.length > 0 ? (
              <button className="button button-secondary" onClick={goBack} type="button">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}
            <Folder className="h-5 w-5 text-[var(--brand)]" />
            <span className="font-bold">{listingQuery.data.currentFolder.name}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              accept="*/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  uploadMutation.mutate(file);
                  event.target.value = '';
                }
              }}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="button button-primary"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading' : 'Upload file'}
            </button>
            {!clientMode ? (
              <form className="flex min-w-0 flex-1 gap-2 sm:max-w-md" onSubmit={createFolder}>
                <input
                  className="input min-w-0"
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="New folder name"
                  value={folderName}
                />
                <button
                  className="button button-secondary shrink-0"
                  disabled={createFolderMutation.isPending}
                  title="Create folder"
                  type="submit"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create
                </button>
              </form>
            ) : null}
          </div>

          {listingQuery.data.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-muted-foreground">
              This folder is empty.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead className="bg-[var(--panel-muted)] text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Modified</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listingQuery.data.items.map((item) => (
                    <tr className="border-t border-[var(--border)]" key={item.id}>
                      <td className="px-4 py-3">
                        <button
                          className="flex items-center gap-3 text-left font-bold hover:text-[var(--brand-dark)]"
                          onClick={() =>
                            item.isFolder
                              ? openFolder(item)
                              : item.webViewLink && window.open(item.webViewLink, '_blank', 'noopener')
                          }
                          type="button"
                        >
                          {item.isFolder ? (
                            <Folder className="h-5 w-5 text-amber-600" />
                          ) : (
                            <File className="h-5 w-5 text-slate-500" />
                          )}
                          <span className="max-w-[360px] truncate">{item.name}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.isFolder ? 'Folder' : item.mimeType}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.isFolder ? '-' : formatFileSize(item.size)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.modifiedTime ? new Date(item.modifiedTime).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {!item.isFolder && !item.mimeType.startsWith('application/vnd.google-apps.') ? (
                            <button
                              className="button button-secondary"
                              disabled={downloadMutation.isPending}
                              onClick={() => downloadMutation.mutate(item)}
                              title="Download"
                              type="button"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          ) : null}
                          {item.webViewLink ? (
                            <a
                              className="button button-secondary"
                              href={item.webViewLink}
                              rel="noreferrer"
                              target="_blank"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                          {!clientMode ? (
                            <button
                              className="button button-secondary text-red-700"
                              disabled={deleteMutation.isPending}
                              onClick={() => remove(item)}
                              title="Delete"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : listingQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading Google Drive workspace...</p>
      ) : null}
    </section>
  );
}

function formatFileSize(size: number | null) {
  if (size === null) {
    return '-';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
