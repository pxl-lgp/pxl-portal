'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpenText, CheckSquare, Hash, Loader2, Plus, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  createWorkspaceBoard,
  createWorkspaceChannel,
  createWorkspaceMessage,
  createWorkspacePage,
  createWorkspaceTaskComment,
  createWorkspaceTask,
  getClients,
  getWorkspaceBoards,
  getWorkspaceChannels,
  getWorkspaceMessages,
  getWorkspacePages,
  getWorkspaceTaskComments,
  getWorkspaceTasks,
  updateWorkspacePage,
  updateWorkspaceTask,
} from '@/lib/api';
import { WorkspaceTask, WorkspaceTaskPriority, WorkspaceTaskStatus } from '@/lib/types';

const taskStatuses: WorkspaceTaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];

export default function WorkspacePage() {
  const [tab, setTab] = useState<'channels' | 'tasks' | 'docs'>('channels');
  const searchParams = useSearchParams();
  const linkedClientId = searchParams.get('clientId') ?? undefined;

  return (
    <>
      <section>
        <p className="text-sm font-semibold text-primary">Workspace OS</p>
        <h1 className="text-2xl font-black">Team Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Channels, tasks, and docs for internal delivery work.</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'channels' ? 'default' : 'outline'} onClick={() => setTab('channels')}>
          <Hash className="h-4 w-4" /> Channels
        </Button>
        <Button variant={tab === 'tasks' ? 'default' : 'outline'} onClick={() => setTab('tasks')}>
          <CheckSquare className="h-4 w-4" /> Tasks
        </Button>
        <Button variant={tab === 'docs' ? 'default' : 'outline'} onClick={() => setTab('docs')}>
          <BookOpenText className="h-4 w-4" /> Docs
        </Button>
      </div>

      {tab === 'channels' ? <ChannelsTab initialClientId={linkedClientId} /> : null}
      {tab === 'tasks' ? <TasksTab initialClientId={linkedClientId} /> : null}
      {tab === 'docs' ? <DocsTab initialClientId={linkedClientId} /> : null}
    </>
  );
}

function ChannelsTab({ initialClientId }: { initialClientId?: string }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState('');
  const [clientId, setClientId] = useState(initialClientId ?? 'none');
  const [message, setMessage] = useState('');
  const channelsQuery = useQuery({ queryKey: ['workspace', 'channels'], queryFn: getWorkspaceChannels });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const channels = channelsQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.businessName]));
  const activeChannelId = selectedId ?? channels[0]?.id ?? null;
  const messagesQuery = useQuery({
    queryKey: ['workspace', 'channels', activeChannelId, 'messages'],
    queryFn: () => getWorkspaceMessages(activeChannelId!),
    enabled: Boolean(activeChannelId),
    refetchInterval: 15000,
  });
  const createChannelMutation = useMutation({
    mutationFn: createWorkspaceChannel,
    onSuccess: async (channel) => {
      setChannelName('');
      setClientId(initialClientId ?? 'none');
      setSelectedId(channel.id);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'channels'] });
    },
    onError: () => toast.error('Unable to create channel.'),
  });
  const sendMessageMutation = useMutation({
    mutationFn: () => createWorkspaceMessage(activeChannelId!, message),
    onSuccess: async () => {
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'channels', activeChannelId, 'messages'] });
    },
    onError: () => toast.error('Unable to send message.'),
  });

  return (
    <section className="grid min-h-[620px] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="panel overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-black">Channels</h2>
          <form
            className="mt-3 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              createChannelMutation.mutate({
                name: channelName,
                clientId: clientId === 'none' ? undefined : clientId,
                type: clientId === 'none' ? 'GENERAL' : 'CLIENT',
              });
            }}
          >
            <Input onChange={(event) => setChannelName(event.target.value)} placeholder="new-channel" value={channelName} />
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Link client" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked client</SelectItem>
                {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.businessName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button disabled={!channelName.trim() || createChannelMutation.isPending} type="submit">
              <Plus className="h-4 w-4" /> Create channel
            </Button>
          </form>
        </div>
        <div>
          {channels.length > 0 ? (
            <Table>
              <TableHeader className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                <TableRow>
                  <TableHead className="px-3 py-2">Channel</TableHead>
                  <TableHead className="px-3 py-2">Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow
                    className={`cursor-pointer ${activeChannelId === channel.id ? 'bg-primary/10 text-primary' : ''}`}
                    key={channel.id}
                    onClick={() => setSelectedId(channel.id)}
                  >
                    <TableCell className="px-3 py-2 font-semibold"># {channel.name}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                      {channel.clientId ? clientNameById.get(channel.clientId) ?? 'Linked client' : 'None'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
          {channelsQuery.isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading channels...</p> : null}
        </div>
      </aside>
      <main className="panel flex min-h-[620px] flex-col overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-black">#{channels.find((channel) => channel.id === activeChannelId)?.name ?? 'Select a channel'}</h2>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messagesQuery.data?.map((item) => (
            <article
              className={`rounded-xl border p-3 ${item.metadata.system ? 'border-primary/20 bg-primary/5' : ''}`}
              key={item.id}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{item.metadata.system ? 'System activity' : item.authorName ?? 'System'}</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p>
              {typeof item.metadata.href === 'string' ? (
                <Link className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline" href={item.metadata.href}>
                  Open related record
                </Link>
              ) : null}
            </article>
          ))}
          {messagesQuery.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
        </div>
        <form
          className="flex gap-2 border-t p-4"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessageMutation.mutate();
          }}
        >
          <Input disabled={!activeChannelId} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." value={message} />
          <Button disabled={!message.trim() || !activeChannelId || sendMessageMutation.isPending} type="submit">
            <Send className="h-4 w-4" /> Send
          </Button>
        </form>
      </main>
    </section>
  );
}

function TasksTab({ initialClientId }: { initialClientId?: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [boardName, setBoardName] = useState('');
  const [clientId, setClientId] = useState(initialClientId ?? 'none');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const boardsQuery = useQuery({ queryKey: ['workspace', 'boards'], queryFn: getWorkspaceBoards });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const tasksQuery = useQuery({ queryKey: ['workspace', 'tasks'], queryFn: getWorkspaceTasks });
  const clients = clientsQuery.data ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.businessName]));
  const defaultBoardId = boardsQuery.data?.[0]?.id;
  const createBoardMutation = useMutation({
    mutationFn: createWorkspaceBoard,
    onSuccess: async () => {
      setBoardName('');
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'boards'] });
    },
  });
  const createTaskMutation = useMutation({
    mutationFn: () => createWorkspaceTask({ title, boardId: defaultBoardId, clientId: clientId === 'none' ? undefined : clientId }),
    onSuccess: async () => {
      setTitle('');
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] });
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkspaceTaskStatus }) => updateWorkspaceTask(id, { status }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] }),
  });
  const tasks = tasksQuery.data ?? [];
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <section className="grid gap-4">
      <div className="panel grid gap-3 p-4 md:grid-cols-2">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); createBoardMutation.mutate({ name: boardName }); }}>
          <Input onChange={(event) => setBoardName(event.target.value)} placeholder="Create board" value={boardName} />
          <Button disabled={!boardName.trim()} type="submit"><Plus className="h-4 w-4" /> Board</Button>
        </form>
        <form className="grid gap-2 md:grid-cols-[1fr_220px_auto]" onSubmit={(event) => { event.preventDefault(); createTaskMutation.mutate(); }}>
          <Input onChange={(event) => setTitle(event.target.value)} placeholder="Create task" value={title} />
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Link client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked client</SelectItem>
              {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.businessName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={!title.trim()} type="submit"><Plus className="h-4 w-4" /> Task</Button>
        </form>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="panel overflow-hidden">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
              <TableRow>
                <TableHead className="px-4 py-3">Task</TableHead>
                <TableHead className="px-4 py-3">Client</TableHead>
                <TableHead className="px-4 py-3">Priority</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  className={`cursor-pointer ${selectedTaskId === task.id ? 'bg-primary/10' : ''}`}
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <TableCell className="px-4 py-3 font-semibold">{task.title}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {task.clientId ? clientNameById.get(task.clientId) ?? 'Linked client' : 'None'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="badge bg-[var(--panel-muted)] text-foreground">{task.priority}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <Select value={task.status} onValueChange={(value) => updateTaskMutation.mutate({ id: task.id, status: value as WorkspaceTaskStatus })}>
                      <SelectTrigger className="h-8 min-w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>{taskStatuses.map((item) => <SelectItem key={item} value={item}>{item.replaceAll('_', ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>No tasks yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <TaskDetailPanel task={selectedTask} />
      </div>
    </section>
  );
}

function TaskDetailPanel({ task }: { task: WorkspaceTask | null }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const commentsQuery = useQuery({
    queryKey: ['workspace', 'tasks', task?.id, 'comments'],
    queryFn: () => getWorkspaceTaskComments(task!.id),
    enabled: Boolean(task),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Pick<WorkspaceTask, 'title' | 'description' | 'status' | 'priority'>>) => updateWorkspaceTask(task!.id, payload),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] }),
  });
  const commentMutation = useMutation({
    mutationFn: () => createWorkspaceTaskComment(task!.id, comment),
    onSuccess: async () => {
      setComment('');
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', task?.id, 'comments'] });
    },
  });

  if (!task) {
    return <aside className="panel p-4 text-sm text-muted-foreground">Select a task to view details and comments.</aside>;
  }

  return (
    <aside className="panel grid gap-4 p-4">
      <div>
        <Label>Title</Label>
        <Input defaultValue={task.title} onBlur={(event) => event.target.value !== task.title ? updateMutation.mutate({ title: event.target.value }) : undefined} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Status</Label>
          <Select value={task.status} onValueChange={(value) => updateMutation.mutate({ status: value as WorkspaceTaskStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{taskStatuses.map((item) => <SelectItem key={item} value={item}>{item.replaceAll('_', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={task.priority} onValueChange={(value) => updateMutation.mutate({ priority: value as WorkspaceTaskPriority })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea defaultValue={task.description ?? ''} onBlur={(event) => event.target.value !== (task.description ?? '') ? updateMutation.mutate({ description: event.target.value }) : undefined} />
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Created {new Date(task.createdAt).toLocaleString()}</p>
        <p>Updated {new Date(task.updatedAt).toLocaleString()}</p>
      </div>
      <div className="border-t pt-4">
        <h3 className="font-black">Comments</h3>
        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
          {commentsQuery.data?.map((item) => (
            <article className="rounded-lg border p-3 text-sm" key={item.id}>
              <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{item.authorName ?? 'Unknown'}</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{item.body}</p>
            </article>
          ))}
        </div>
        <form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); commentMutation.mutate(); }}>
          <Textarea onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." value={comment} />
          <Button disabled={!comment.trim() || commentMutation.isPending} type="submit">Add comment</Button>
        </form>
      </div>
    </aside>
  );
}

function DocsTab({ initialClientId }: { initialClientId?: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(initialClientId ?? 'none');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const pagesQuery = useQuery({ queryKey: ['workspace', 'pages'], queryFn: getWorkspacePages });
  const clients = clientsQuery.data ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.businessName]));
  const pages = pagesQuery.data ?? [];
  const activePage = pages.find((page) => page.id === selectedId) ?? pages[0];
  const [draft, setDraft] = useState('');
  const createPageMutation = useMutation({
    mutationFn: () => createWorkspacePage({ title, text: '', clientId: clientId === 'none' ? undefined : clientId }),
    onSuccess: async (page) => {
      setTitle('');
      setClientId(initialClientId ?? 'none');
      setSelectedId(page.id);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] });
    },
  });
  const editorText = selectedId ? draft : activePage?.content.text ?? '';
  const savePageMutation = useMutation({
    mutationFn: () => updateWorkspacePage(activePage.id, { text: editorText }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] }),
  });

  return (
    <section className="grid min-h-[620px] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="panel overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-black">Docs</h2>
          <form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); createPageMutation.mutate(); }}>
            <Input onChange={(event) => setTitle(event.target.value)} placeholder="New doc" value={title} />
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Link client" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked client</SelectItem>
                {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.businessName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button disabled={!title.trim()} type="submit"><Plus className="h-4 w-4" /> Create doc</Button>
          </form>
        </div>
        <div>
          <Table>
            <TableHeader className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
              <TableRow>
                <TableHead className="px-3 py-2">Doc</TableHead>
                <TableHead className="px-3 py-2">Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow
                  className={`cursor-pointer ${activePage?.id === page.id ? 'bg-primary/10 text-primary' : ''}`}
                  key={page.id}
                  onClick={() => {
                    setSelectedId(page.id);
                    setDraft(page.content.text);
                  }}
                >
                  <TableCell className="px-3 py-2 font-semibold">{page.title}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                    {page.clientId ? clientNameById.get(page.clientId) ?? 'Linked client' : 'None'}
                  </TableCell>
                </TableRow>
              ))}
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell className="px-3 py-8 text-center text-muted-foreground" colSpan={2}>No docs yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </aside>
      <main className="panel grid gap-4 p-4">
        {activePage ? (
          <>
            <div>
              <Label>{activePage.title}</Label>
              <p className="text-xs text-muted-foreground">Markdown notes MVP</p>
            </div>
            <Textarea
              className="min-h-[430px] font-mono"
              onChange={(event) => {
                if (!selectedId) setSelectedId(activePage.id);
                setDraft(event.target.value);
              }}
              value={editorText}
            />
            <Button disabled={savePageMutation.isPending} onClick={() => savePageMutation.mutate()}>
              Save doc
            </Button>
          </>
        ) : <p className="text-sm text-muted-foreground">Create a doc to start writing.</p>}
      </main>
    </section>
  );
}
