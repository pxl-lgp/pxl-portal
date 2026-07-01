'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpenText, CheckSquare, Hash, Loader2, MoreHorizontal, Plus, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  deleteWorkspaceBoard,
  deleteWorkspaceChannel,
  deleteWorkspaceMessage,
  deleteWorkspacePage,
  deleteWorkspaceTask,
  deleteWorkspaceTaskComment,
  getClients,
  getWorkspaceBoards,
  getWorkspaceChannels,
  getWorkspaceMessages,
  getWorkspacePages,
  getWorkspaceTaskComments,
  getWorkspaceTasks,
  updateWorkspaceBoard,
  updateWorkspaceChannel,
  updateWorkspacePage,
  updateWorkspaceTask,
} from '@/lib/api';
import { WorkspaceBoard, WorkspaceTask, WorkspaceTaskPriority, WorkspaceTaskStatus } from '@/lib/types';

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
  const [messagePage, setMessagePage] = useState(1);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const preserveScrollFromBottomRef = useRef<number | null>(null);
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
      setMessagePage(1);
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
  const updateChannelMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateWorkspaceChannel(id, { name }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'channels'] }),
    onError: () => toast.error('Unable to update channel.'),
  });
  const deleteChannelMutation = useMutation({
    mutationFn: deleteWorkspaceChannel,
    onSuccess: async (_result, deletedId) => {
      if (selectedId === deletedId) setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'channels'] });
    },
    onError: () => toast.error('Unable to delete channel.'),
  });
  const deleteMessageMutation = useMutation({
    mutationFn: deleteWorkspaceMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'channels', activeChannelId, 'messages'] });
    },
    onError: () => toast.error('Unable to delete message.'),
  });
  const messages = messagesQuery.data ?? [];
  const messagesPerPage = 8;
  const totalMessagePages = Math.max(1, Math.ceil(messages.length / messagesPerPage));
  const loadedMessagePages = Math.min(messagePage, totalMessagePages);
  const firstVisibleMessageIndex = Math.max(0, messages.length - loadedMessagePages * messagesPerPage);
  const visibleMessages = messages.slice(firstVisibleMessageIndex);
  const firstVisibleMessage = messages.length === 0 ? 0 : firstVisibleMessageIndex + 1;
  const lastVisibleMessage = messages.length;

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    if (preserveScrollFromBottomRef.current !== null) {
      list.scrollTop = list.scrollHeight - preserveScrollFromBottomRef.current;
      preserveScrollFromBottomRef.current = null;
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [activeChannelId, messages.length, visibleMessages.length]);

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
                  <TableHead className="px-3 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow
                    className={`cursor-pointer ${activeChannelId === channel.id ? 'bg-primary/10 text-primary' : ''}`}
                    key={channel.id}
                    onClick={() => {
                      setSelectedId(channel.id);
                      setMessagePage(1);
                    }}
                  >
                    <TableCell className="px-3 py-2 font-semibold"># {channel.name}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                      {channel.clientId ? clientNameById.get(channel.clientId) ?? 'Linked client' : 'None'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon-sm" type="button" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Channel actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => {
                              const name = window.prompt('Channel name', channel.name)?.trim();
                              if (name && name !== channel.name) updateChannelMutation.mutate({ id: channel.id, name });
                            }}
                          >
                            Edit name
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={channel.type === 'SYSTEM' || deleteChannelMutation.variables === channel.id}
                            onClick={() => {
                              if (window.confirm(`Delete channel "${channel.name}"? Messages in it will also be deleted.`)) {
                                deleteChannelMutation.mutate(channel.id);
                              }
                            }}
                            variant="destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
          {channelsQuery.isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading channels...</p> : null}
        </div>
      </aside>
      <main className="panel flex h-[720px] max-h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-black">#{channels.find((channel) => channel.id === activeChannelId)?.name ?? 'Select a channel'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {messages.length > 0 ? `Showing ${firstVisibleMessage}-${lastVisibleMessage} of ${messages.length} messages` : 'No messages yet'}
            </p>
          </div>
          {loadedMessagePages < totalMessagePages ? (
            <p className="text-xs font-semibold text-muted-foreground">Scroll up for older messages</p>
          ) : null}
        </div>
        <div
          ref={messageListRef}
          className="flex-1 space-y-3 overflow-y-auto p-4"
          onScroll={(event) => {
            const target = event.currentTarget;
            if (target.scrollTop <= 120) {
              preserveScrollFromBottomRef.current = target.scrollHeight - target.scrollTop;
              setMessagePage((page) => Math.min(totalMessagePages, page + 1));
            }
          }}
        >
          {loadedMessagePages < totalMessagePages ? (
            <p className="py-3 text-center text-xs font-semibold text-muted-foreground">Older messages load as you scroll up.</p>
          ) : null}
          {visibleMessages.map((item) => (
            <article
              className={`rounded-xl border p-3 ${item.metadata.system ? 'border-primary/20 bg-primary/5' : ''}`}
              key={item.id}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{item.metadata.system ? 'System activity' : item.authorName ?? 'System'}</span>
                <div className="flex items-center gap-2">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <Button
                    disabled={deleteMessageMutation.variables === item.id}
                    onClick={() => {
                      if (window.confirm('Delete this message?')) deleteMessageMutation.mutate(item.id);
                    }}
                    size="icon-xs"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const boardsQuery = useQuery({ queryKey: ['workspace', 'boards'], queryFn: getWorkspaceBoards });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const tasksQuery = useQuery({ queryKey: ['workspace', 'tasks'], queryFn: getWorkspaceTasks });
  const clients = clientsQuery.data ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.businessName]));
  const boards = boardsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const activeBoardId = selectedBoardId ?? boards[0]?.id ?? 'unassigned';
  const activeBoard = boards.find((board) => board.id === activeBoardId) ?? null;
  const visibleTasks = tasks.filter((task) => activeBoard ? task.boardId === activeBoard.id : !task.boardId);
  const unassignedTaskCount = tasks.filter((task) => !task.boardId).length;
  const taskCountByBoardId = new Map<string, number>();
  for (const task of tasks) {
    if (task.boardId) taskCountByBoardId.set(task.boardId, (taskCountByBoardId.get(task.boardId) ?? 0) + 1);
  }
  const createBoardMutation = useMutation({
    mutationFn: createWorkspaceBoard,
    onSuccess: async (board) => {
      setBoardName('');
      setSelectedBoardId(board.id);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'boards'] });
    },
  });
  const updateBoardMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateWorkspaceBoard(id, { name }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'boards'] }),
  });
  const deleteBoardMutation = useMutation({
    mutationFn: deleteWorkspaceBoard,
    onSuccess: async (_result, deletedId) => {
      if (selectedBoardId === deletedId) setSelectedBoardId(null);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'boards'] });
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] });
    },
  });
  const createTaskMutation = useMutation({
    mutationFn: () => createWorkspaceTask({ title, boardId: activeBoard?.id, clientId: clientId === 'none' ? undefined : clientId }),
    onSuccess: async () => {
      setTitle('');
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] });
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkspaceTaskStatus }) => updateWorkspaceTask(id, { status }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] }),
  });
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <aside className="panel overflow-hidden">
          <div className="border-b p-4">
            <p className="text-xs font-semibold uppercase text-primary">Layer 1</p>
            <h2 className="font-black">Boards</h2>
            <p className="mt-1 text-xs text-muted-foreground">Boards group tasks. Select one to see only its tasks.</p>
            <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); createBoardMutation.mutate({ name: boardName }); }}>
              <Input onChange={(event) => setBoardName(event.target.value)} placeholder="Create board" value={boardName} />
              <Button disabled={!boardName.trim()} type="submit"><Plus className="h-4 w-4" /></Button>
            </form>
          </div>
          <BoardList
            activeBoardId={activeBoardId}
            boards={boards}
            deletingBoardId={deleteBoardMutation.variables}
            onDelete={(board) => {
              if (window.confirm(`Delete board "${board.name}"? Tasks will stay in the workspace without a board.`)) {
                deleteBoardMutation.mutate(board.id);
              }
            }}
            onRename={(board, name) => updateBoardMutation.mutate({ id: board.id, name })}
            onSelect={(boardId) => setSelectedBoardId(boardId)}
            taskCountByBoardId={taskCountByBoardId}
            unassignedTaskCount={unassignedTaskCount}
          />
        </aside>

        <main className="panel overflow-hidden">
          <div className="border-b p-4">
            <p className="text-xs font-semibold uppercase text-primary">Layer 2</p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-black">{activeBoard?.name ?? 'Unassigned'} tasks</h2>
                <p className="mt-1 text-xs text-muted-foreground">{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'} in this board.</p>
              </div>
              <form className="grid w-full gap-2 md:w-auto md:grid-cols-[minmax(260px,1fr)_220px_auto]" onSubmit={(event) => { event.preventDefault(); createTaskMutation.mutate(); }}>
                <Input onChange={(event) => setTitle(event.target.value)} placeholder={`Create task in ${activeBoard?.name ?? 'Unassigned'}`} value={title} />
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
          </div>
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
              {visibleTasks.map((task) => (
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
              {visibleTasks.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>No tasks in this board yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </main>
      </div>
      <TaskDetailPanel onDeleted={() => setSelectedTaskId(null)} onOpenChange={(open) => { if (!open) setSelectedTaskId(null); }} task={selectedTask} />
    </section>
  );
}

function BoardList({
  activeBoardId,
  boards,
  deletingBoardId,
  onDelete,
  onRename,
  onSelect,
  taskCountByBoardId,
  unassignedTaskCount,
}: {
  activeBoardId: string;
  boards: WorkspaceBoard[];
  deletingBoardId?: string;
  onDelete: (board: WorkspaceBoard) => void;
  onRename: (board: WorkspaceBoard, name: string) => void;
  onSelect: (boardId: string) => void;
  taskCountByBoardId: Map<string, number>;
  unassignedTaskCount: number;
}) {
  return (
    <div className="grid gap-2 p-3">
      {boards.map((board) => {
        const isActive = activeBoardId === board.id;

        return (
          <article
            className={`rounded-xl border p-3 transition ${isActive ? 'border-primary bg-primary/10' : 'bg-background/40 hover:bg-background/70'}`}
            key={board.id}
          >
            <div className="flex items-start justify-between gap-3">
              <button className="min-w-0 flex-1 text-left" onClick={() => onSelect(board.id)} type="button">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Board</span>
                <p className="mt-2 truncate text-base font-black">{board.name}</p>
              </button>
              <div className="flex items-center gap-2">
                <span className="badge bg-[var(--panel-muted)] text-foreground">{taskCountByBoardId.get(board.id) ?? 0} tasks</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" type="button" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Board actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => {
                        const name = window.prompt('Board name', board.name)?.trim();
                        if (name && name !== board.name) onRename(board, name);
                      }}
                    >
                      Edit name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={deletingBoardId === board.id}
                      onClick={() => onDelete(board)}
                      variant="destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </article>
        );
      })}
      <button
        className={`rounded-xl border p-3 text-left transition ${activeBoardId === 'unassigned' ? 'border-primary bg-primary/10' : 'bg-background/40 hover:bg-background/70'}`}
        onClick={() => onSelect('unassigned')}
        type="button"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Fallback</p>
            <p className="mt-1 font-black">Unassigned</p>
          </div>
          <span className="badge bg-[var(--panel-muted)] text-foreground">{unassignedTaskCount} tasks</span>
        </div>
      </button>
    </div>
  );
}

function TaskDetailPanel({
  onDeleted,
  onOpenChange,
  task,
}: {
  onDeleted: () => void;
  onOpenChange: (open: boolean) => void;
  task: WorkspaceTask | null;
}) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const open = Boolean(task);
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
  const deleteCommentMutation = useMutation({
    mutationFn: deleteWorkspaceTaskComment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', task?.id, 'comments'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspaceTask(task!.id),
    onSuccess: async () => {
      onDeleted();
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks'] });
    },
  });

  if (!task) {
    return null;
  }

  return (
    <div aria-hidden={!open} className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <aside className="grid max-h-[90vh] w-full max-w-2xl gap-4 overflow-y-auto rounded-2xl border bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Layer 3</p>
            <h2 className="font-black">Task details</h2>
            <p className="text-xs text-muted-foreground">Edit, comment, or remove this workspace task.</p>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) deleteMutation.mutate();
              }}
              size="sm"
              type="button"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={() => onOpenChange(false)} size="sm" type="button" variant="outline">Close</Button>
          </div>
        </div>
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
        <div className="rounded-xl border bg-[var(--panel-muted)] p-3 text-xs text-muted-foreground">
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
                  <div className="flex items-center gap-2">
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <Button
                      disabled={deleteCommentMutation.variables === item.id}
                      onClick={() => {
                        if (window.confirm('Delete this comment?')) deleteCommentMutation.mutate(item.id);
                      }}
                      size="icon-xs"
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
    </div>
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
  const activePage = (selectedId ? pages.find((page) => page.id === selectedId) : undefined) ?? pages[0] ?? null;
  const [draft, setDraft] = useState<{ pageId: string; text: string } | null>(null);
  const editorText = draft && activePage && draft.pageId === activePage.id ? draft.text : activePage?.content?.text ?? '';
  const createPageMutation = useMutation({
    mutationFn: () => createWorkspacePage({ title, text: '', clientId: clientId === 'none' ? undefined : clientId }),
    onSuccess: async (page) => {
      setTitle('');
      setClientId(initialClientId ?? 'none');
      setSelectedId(page.id);
      setDraft({ pageId: page.id, text: page.content?.text ?? '' });
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] });
    },
  });
  const savePageMutation = useMutation({
    mutationFn: () => updateWorkspacePage(activePage!.id, { text: editorText }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] }),
  });
  const renamePageMutation = useMutation({
    mutationFn: ({ id, title: nextTitle }: { id: string; title: string }) => updateWorkspacePage(id, { title: nextTitle }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] }),
  });
  const deletePageMutation = useMutation({
    mutationFn: deleteWorkspacePage,
    onSuccess: async (_result, deletedId) => {
      if (selectedId === deletedId) setSelectedId(null);
      setDraft(null);
      await queryClient.invalidateQueries({ queryKey: ['workspace', 'pages'] });
    },
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
                    setDraft({ pageId: page.id, text: page.content?.text ?? '' });
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
              <Label>Doc title</Label>
              <Input
                defaultValue={activePage.title}
                onBlur={(event) => {
                  const nextTitle = event.target.value.trim();
                  if (nextTitle && nextTitle !== activePage.title) {
                    renamePageMutation.mutate({ id: activePage.id, title: nextTitle });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Markdown notes MVP</p>
            </div>
            <Textarea
              className="min-h-[430px] font-mono"
              onChange={(event) => {
                if (!selectedId) setSelectedId(activePage.id);
                setDraft({ pageId: activePage.id, text: event.target.value });
              }}
              value={editorText}
            />
            <div className="flex flex-wrap gap-2">
              <Button disabled={savePageMutation.isPending} onClick={() => savePageMutation.mutate()}>
                Save doc
              </Button>
              <Button
                disabled={deletePageMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Delete doc "${activePage.title}"?`)) deletePageMutation.mutate(activePage.id);
                }}
                type="button"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete doc
              </Button>
            </div>
          </>
        ) : <p className="text-sm text-muted-foreground">Create a doc to start writing.</p>}
      </main>
    </section>
  );
}
