import axios from 'axios';
import { getAccessToken } from './auth';
import {
  AutomationLog,
  AutomationSummary,
  AuditLog,
  Asset,
  AssetPayload,
  Approval,
  ApprovalComment,
  ApprovalCommentPayload,
  ApprovalDecisionPayload,
  ApprovalPayload,
  AuthResponse,
  AnalyticsPayload,
  AnalyticsRecord,
  AnalyzePerformancePayload,
  AiGenerationPayload,
  AiGenerationResponse,
  AssistResponse,
  BestTimeResult,
  Campaign,
  CampaignPayload,
  ChangePasswordPayload,
  Client,
  ClientHealth,
  ClientPortalOverview,
  ClientPayload,
  ContentItem,
  ContentPayload,
  ContentPillar,
  ContentPillarPayload,
  ContentTemplate,
  ContentTemplatePayload,
  DriveFolderListing,
  DriveItem,
  InviteUserPayload,
  Lead,
  LeadPayload,
  LeadUpdatePayload,
  OnboardingTask,
  OnboardingTaskStatus,
  NotificationSetting,
  Organization,
  OrganizationFeature,
  Permission,
  RegisterPayload,
  Report,
  ReportPayload,
  SearchResult,
  HealthStatus,
  SocialConnection,
  MetaOauthUrlResponse,
  User,
  UpdateProfilePayload,
  UpdateUserPayload,
  WorkspaceBoard,
  WorkspaceChannel,
  WorkspaceMessage,
  WorkspacePage,
  WorkspaceTask,
  WorkspaceTaskComment,
  WorkspaceTaskPriority,
  WorkspaceTaskStatus,
} from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });

  return response.data;
}

export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password });
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<User>('/auth/register', payload);

  return response.data;
}

export async function inviteUser(payload: InviteUserPayload) {
  const response = await api.post<User>('/auth/invite', payload);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<User>('/auth/me');

  return response.data;
}

export async function updateCurrentUser(payload: UpdateProfilePayload) {
  const response = await api.patch<User>('/auth/me', payload);

  return response.data;
}

export async function changeCurrentUserPassword(payload: ChangePasswordPayload) {
  await api.patch('/auth/me/password', payload);
}

export async function getUsers() {
  const response = await api.get<User[]>('/users');

  return response.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const response = await api.patch<User>(`/users/${id}`, payload);

  return response.data;
}

export async function sendUserPasswordReset(id: string) {
  await api.post(`/auth/users/${id}/password-reset`);
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function getClients() {
  const response = await api.get<Client[]>('/clients');

  return response.data;
}

export async function getClient(id: string) {
  const response = await api.get<Client>(`/clients/${id}`);

  return response.data;
}

export async function createClient(payload: ClientPayload) {
  const response = await api.post<Client>('/clients', payload);

  return response.data;
}

export async function submitOnboarding(payload: ClientPayload) {
  const response = await api.post<Client>('/onboarding', payload);

  return response.data;
}

export async function updateClient(id: string, payload: Partial<ClientPayload>) {
  const response = await api.patch<Client>(`/clients/${id}`, payload);

  return response.data;
}

export type CampaignFilters = {
  clientId?: string;
  status?: string;
  q?: string;
};

export async function getCampaigns(filters: CampaignFilters = {}) {
  const response = await api.get<Campaign[]>('/campaigns', { params: cleanParams(filters) });

  return response.data;
}

export async function getCampaign(id: string) {
  const response = await api.get<Campaign>(`/campaigns/${id}`);

  return response.data;
}

export async function createCampaign(payload: CampaignPayload) {
  const response = await api.post<Campaign>('/campaigns', payload);

  return response.data;
}

export async function updateCampaign(id: string, payload: Partial<CampaignPayload>) {
  const response = await api.patch<Campaign>(`/campaigns/${id}`, payload);

  return response.data;
}

export async function getSocialConnections(clientId: string) {
  const response = await api.get<SocialConnection[]>(
    `/clients/${clientId}/social-connections`,
  );

  return response.data;
}

export async function createMetaOauthUrl(clientId: string) {
  const response = await api.post<MetaOauthUrlResponse>(
    `/clients/${clientId}/social-connections/meta/oauth-url`,
  );

  return response.data;
}

export async function syncMetaAuthorization(clientId: string, authorizationId: string) {
  const response = await api.post<SocialConnection[]>(
    `/clients/${clientId}/social-connections/meta-authorizations/${authorizationId}/sync`,
  );

  return response.data;
}

export async function disconnectSocialConnection(clientId: string, connectionId: string) {
  const response = await api.delete<SocialConnection>(
    `/clients/${clientId}/social-connections/${connectionId}`,
  );

  return response.data;
}

export async function getAutomationLogs(status?: AutomationLog['status']) {
  const response = await api.get<AutomationLog[]>('/automation/logs', {
    params: status ? { status } : undefined,
  });

  return response.data;
}

export async function retryAutomationLog(id: string) {
  const response = await api.post<{ retried: boolean; eventName: string; entityId: string | null }>(
    `/automation/logs/${id}/retry`,
  );

  return response.data;
}

function cleanParams(filters: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null && value !== ''),
  );
}

export type ContentFilters = {
  clientId?: string;
  campaignId?: string;
  status?: string;
  contentType?: string;
  q?: string;
};

export async function getContentItems(filters: ContentFilters = {}) {
  const response = await api.get<ContentItem[]>('/content', { params: cleanParams(filters) });

  return response.data;
}

export async function getContentItem(id: string) {
  const response = await api.get<ContentItem>(`/content/${id}`);

  return response.data;
}

export async function createContentItem(payload: ContentPayload) {
  const response = await api.post<ContentItem>('/content', payload);

  return response.data;
}

export async function updateContentItem(id: string, payload: Partial<ContentPayload>) {
  const response = await api.patch<ContentItem>(`/content/${id}`, payload);

  return response.data;
}

export async function scheduleContentItem(id: string, scheduledAt: string) {
  const response = await api.patch<ContentItem>(`/content/${id}/schedule`, { scheduledAt });

  return response.data;
}

export async function publishContentItem(id: string) {
  const response = await api.patch<ContentItem>(`/content/${id}/publish`);

  return response.data;
}

export async function getApprovals() {
  const response = await api.get<Approval[]>('/approvals');

  return response.data;
}

export async function createApproval(payload: ApprovalPayload) {
  const response = await api.post<Approval>('/approvals', payload);

  return response.data;
}

export async function updateApproval(id: string, payload: ApprovalDecisionPayload) {
  const response = await api.patch<Approval>(`/approvals/${id}`, payload);

  return response.data;
}

export async function exportCsv(entity: string) {
  const response = await api.get<string>(`/exports/${entity}`, { responseType: 'text' });

  return response.data;
}

export async function importClients(rows: Array<Record<string, string>>) {
  const response = await api.post<{ imported: number }>('/imports/clients', { rows });

  return response.data;
}

export async function importLeads(rows: Array<Record<string, string>>) {
  const response = await api.post<{ imported: number }>('/imports/leads', { rows });

  return response.data;
}

export async function getClientHealth() {
  const response = await api.get<ClientHealth[]>('/client-health');

  return response.data;
}

export async function globalSearch(q: string) {
  const response = await api.get<SearchResult[]>('/search', { params: { q } });

  return response.data;
}

export async function getApiHealth() {
  const baseUrl = api.defaults.baseURL?.replace(/\/api$/, '') ?? '';
  const response = await axios.get<HealthStatus>(`${baseUrl}/health`);

  return response.data;
}

export async function getApiReadiness() {
  const baseUrl = api.defaults.baseURL?.replace(/\/api$/, '') ?? '';
  const response = await axios.get<HealthStatus>(`${baseUrl}/health/ready`);

  return response.data;
}

export async function getAutomationSummary() {
  const response = await api.get<AutomationSummary>('/automation/summary');

  return response.data;
}

export async function getAuditLogs(filters: { action?: string; entityType?: string } = {}) {
  const response = await api.get<AuditLog[]>('/audit', { params: cleanParams(filters) });

  return response.data;
}

export async function getNotificationSettings() {
  const response = await api.get<NotificationSetting[]>('/settings/notifications');

  return response.data;
}

export async function updateNotificationSetting(eventKey: string, payload: Partial<NotificationSetting>) {
  const response = await api.patch<NotificationSetting>(`/settings/notifications/${eventKey}`, payload);

  return response.data;
}

export async function getPermissions() {
  const response = await api.get<Permission[]>('/permissions');

  return response.data;
}

export async function getOrganizations() {
  const response = await api.get<Organization[]>('/organizations');

  return response.data;
}

export async function createOrganization(payload: { name: string; slug: string }) {
  const response = await api.post<Organization>('/organizations', payload);

  return response.data;
}

export async function getOrganizationFeatures(organizationId: string) {
  const response = await api.get<OrganizationFeature[]>(`/organizations/${organizationId}/features`);

  return response.data;
}

export async function updateOrganizationFeature(organizationId: string, featureKey: string, enabled: boolean) {
  const response = await api.patch(`/organizations/${organizationId}/features/${featureKey}`, { enabled });

  return response.data;
}

export async function getWorkspaceChannels() {
  const response = await api.get<WorkspaceChannel[]>('/workspace/channels');
  return response.data;
}

export async function createWorkspaceChannel(payload: {
  name: string;
  description?: string;
  type?: WorkspaceChannel['type'];
  visibility?: WorkspaceChannel['visibility'];
  clientId?: string;
}) {
  const response = await api.post<WorkspaceChannel>('/workspace/channels', payload);
  return response.data;
}

export async function getWorkspaceMessages(channelId: string) {
  const response = await api.get<WorkspaceMessage[]>(`/workspace/channels/${channelId}/messages`);
  return response.data;
}

export async function createWorkspaceMessage(channelId: string, body: string) {
  const response = await api.post<WorkspaceMessage>(`/workspace/channels/${channelId}/messages`, { body });
  return response.data;
}

export async function getWorkspaceBoards() {
  const response = await api.get<WorkspaceBoard[]>('/workspace/boards');
  return response.data;
}

export async function createWorkspaceBoard(payload: { name: string; description?: string; clientId?: string }) {
  const response = await api.post<WorkspaceBoard>('/workspace/boards', payload);
  return response.data;
}

export async function getWorkspaceTasks() {
  const response = await api.get<WorkspaceTask[]>('/workspace/tasks');
  return response.data;
}

export async function createWorkspaceTask(payload: {
  title: string;
  description?: string;
  boardId?: string;
  clientId?: string;
  status?: WorkspaceTaskStatus;
  priority?: WorkspaceTaskPriority;
  assigneeUserId?: string;
}) {
  const response = await api.post<WorkspaceTask>('/workspace/tasks', payload);
  return response.data;
}

export async function updateWorkspaceTask(id: string, payload: Partial<Pick<WorkspaceTask, 'title' | 'description' | 'status' | 'priority' | 'assigneeUserId'>>) {
  const response = await api.patch<WorkspaceTask>(`/workspace/tasks/${id}`, payload);
  return response.data;
}

export async function getWorkspaceTaskComments(taskId: string) {
  const response = await api.get<WorkspaceTaskComment[]>(`/workspace/tasks/${taskId}/comments`);
  return response.data;
}

export async function createWorkspaceTaskComment(taskId: string, body: string) {
  const response = await api.post<WorkspaceTaskComment>(`/workspace/tasks/${taskId}/comments`, { body });
  return response.data;
}

export async function getWorkspacePages() {
  const response = await api.get<WorkspacePage[]>('/workspace/pages');
  return response.data;
}

export async function createWorkspacePage(payload: { title: string; text?: string; clientId?: string }) {
  const response = await api.post<WorkspacePage>('/workspace/pages', payload);
  return response.data;
}

export async function updateWorkspacePage(id: string, payload: { title?: string; text?: string }) {
  const response = await api.patch<WorkspacePage>(`/workspace/pages/${id}`, payload);
  return response.data;
}

export async function getApprovalComments(id: string) {
  const response = await api.get<ApprovalComment[]>(`/approvals/${id}/comments`);

  return response.data;
}

export async function createApprovalComment(id: string, payload: ApprovalCommentPayload) {
  const response = await api.post<ApprovalComment>(`/approvals/${id}/comments`, payload);

  return response.data;
}

export async function generateCaption(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-caption', payload);

  return response.data;
}

export async function generateHashtags(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-hashtags', payload);

  return response.data;
}

export async function generateReelScript(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-reel-script', payload);

  return response.data;
}

export async function generateBrief(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-brief', payload);

  return response.data;
}

export async function analyzePerformance(payload: AnalyzePerformancePayload) {
  const response = await api.post<AiGenerationResponse>('/ai/analyze-performance', payload);

  return response.data;
}

export async function generateBroll(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-broll', payload);

  return response.data;
}

export async function generateOverlay(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-overlay', payload);

  return response.data;
}

export async function generateTags(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-tags', payload);

  return response.data;
}

export async function generateTemplate(payload: AiGenerationPayload) {
  const response = await api.post<AiGenerationResponse>('/ai/generate-template', payload);

  return response.data;
}

export async function askAssistant(message: string, clientName?: string) {
  const response = await api.post<AssistResponse>('/assistant/chat', { message, clientName });

  return response.data;
}

export async function getAnalyticsRecords() {
  const response = await api.get<AnalyticsRecord[]>('/analytics');

  return response.data;
}

export async function getContentAnalytics(contentItemId: string) {
  const response = await api.get<AnalyticsRecord[]>(`/analytics/content/${contentItemId}`);

  return response.data;
}

export async function createAnalyticsRecord(payload: AnalyticsPayload) {
  const response = await api.post<AnalyticsRecord>('/analytics', payload);

  return response.data;
}

export async function updateAnalyticsRecord(id: string, payload: Partial<AnalyticsPayload>) {
  const response = await api.patch<AnalyticsRecord>(`/analytics/${id}`, payload);

  return response.data;
}

export async function getReports() {
  const response = await api.get<Report[]>('/reports');

  return response.data;
}

export async function createReport(payload: ReportPayload) {
  const response = await api.post<Report>('/reports', payload);

  return response.data;
}

export async function updateReport(id: string, payload: Partial<ReportPayload>) {
  const response = await api.patch<Report>(`/reports/${id}`, payload);

  return response.data;
}

export async function markReportReady(id: string) {
  const response = await api.patch<Report>(`/reports/${id}/ready`);

  return response.data;
}

export async function sendReport(id: string) {
  const response = await api.patch<Report>(`/reports/${id}/send`);

  return response.data;
}

export async function createLead(payload: LeadPayload) {
  const response = await api.post<Lead>('/leads', payload);

  return response.data;
}

export async function getLeads() {
  const response = await api.get<Lead[]>('/leads');

  return response.data;
}

export async function updateLead(id: string, payload: LeadUpdatePayload) {
  const response = await api.patch<Lead>(`/leads/${id}`, payload);

  return response.data;
}

export async function convertLead(id: string) {
  const response = await api.post<Lead>(`/leads/${id}/convert`);

  return response.data;
}

export type AssetFilters = {
  clientId?: string;
  contentItemId?: string;
  assetType?: string;
  q?: string;
};

export async function getAssets(filters: AssetFilters = {}) {
  const response = await api.get<Asset[]>('/assets', { params: cleanParams(filters) });

  return response.data;
}

export async function createAsset(payload: AssetPayload) {
  const response = await api.post<Asset>('/assets', payload);

  return response.data;
}

export async function updateAsset(id: string, payload: Partial<AssetPayload>) {
  const response = await api.patch<Asset>(`/assets/${id}`, payload);

  return response.data;
}

export async function getClientPortalOverview() {
  const response = await api.get<ClientPortalOverview>('/client-portal/overview');

  return response.data;
}

export async function updateClientPortalApproval(id: string, payload: ApprovalDecisionPayload) {
  const response = await api.patch<Approval>(`/client-portal/approvals/${id}`, payload);

  return response.data;
}

export async function getClientPortalApprovalComments(id: string) {
  const response = await api.get<ApprovalComment[]>(`/client-portal/approvals/${id}/comments`);

  return response.data;
}

export async function createClientPortalApprovalComment(id: string, payload: ApprovalCommentPayload) {
  const response = await api.post<ApprovalComment>(`/client-portal/approvals/${id}/comments`, payload);

  return response.data;
}

export async function getClientDriveItems(clientId: string, folderId?: string) {
  const response = await api.get<DriveFolderListing>(`/drive/clients/${clientId}/items`, {
    params: folderId ? { folderId } : undefined,
  });

  return response.data;
}

export async function createClientDriveFolder(
  clientId: string,
  name: string,
  parentFolderId?: string,
) {
  const response = await api.post<DriveItem>(
    `/drive/clients/${clientId}/folders`,
    { name },
    { params: parentFolderId ? { parentFolderId } : undefined },
  );

  return response.data;
}

export async function uploadClientDriveFile(
  clientId: string,
  file: File,
  parentFolderId?: string,
) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<DriveItem>(`/drive/clients/${clientId}/files`, formData, {
    params: parentFolderId ? { parentFolderId } : undefined,
  });

  return response.data;
}

export async function downloadClientDriveFile(clientId: string, fileId: string) {
  const response = await api.get<Blob>(`/drive/clients/${clientId}/files/${fileId}/download`, {
    responseType: 'blob',
  });

  return response.data;
}

export async function deleteClientDriveItem(clientId: string, fileId: string) {
  await api.delete(`/drive/clients/${clientId}/items/${fileId}`);
}

export async function getMyDriveItems(folderId?: string) {
  const response = await api.get<DriveFolderListing>('/client-portal/drive/items', {
    params: folderId ? { folderId } : undefined,
  });

  return response.data;
}

export async function uploadMyDriveFile(file: File, parentFolderId?: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<DriveItem>('/client-portal/drive/files', formData, {
    params: parentFolderId ? { parentFolderId } : undefined,
  });

  return response.data;
}

export async function downloadMyDriveFile(fileId: string) {
  const response = await api.get<Blob>(`/client-portal/drive/files/${fileId}/download`, {
    responseType: 'blob',
  });

  return response.data;
}

export async function getBestTimes(clientId?: string) {
  const response = await api.get<BestTimeResult>('/analytics/best-times', {
    params: clientId ? { clientId } : undefined,
  });

  return response.data;
}

export async function autoTagAsset(id: string) {
  const response = await api.post<Asset>(`/assets/${id}/auto-tag`);

  return response.data;
}

export async function getOnboardingTasks(clientId: string) {
  const response = await api.get<OnboardingTask[]>('/onboarding-tasks', { params: { clientId } });

  return response.data;
}

export async function updateOnboardingTask(
  id: string,
  payload: { status?: OnboardingTaskStatus; title?: string; description?: string },
) {
  const response = await api.patch<OnboardingTask>(`/onboarding-tasks/${id}`, payload);

  return response.data;
}

export async function getContentPillars(clientId: string) {
  const response = await api.get<ContentPillar[]>('/content-pillars', { params: { clientId } });

  return response.data;
}

export async function createContentPillar(payload: ContentPillarPayload) {
  const response = await api.post<ContentPillar>('/content-pillars', payload);

  return response.data;
}

export async function updateContentPillar(id: string, payload: Partial<ContentPillarPayload>) {
  const response = await api.patch<ContentPillar>(`/content-pillars/${id}`, payload);

  return response.data;
}

export async function deleteContentPillar(id: string) {
  await api.delete(`/content-pillars/${id}`);
}

export async function getContentTemplates(clientId?: string) {
  const response = await api.get<ContentTemplate[]>('/content-templates', {
    params: clientId ? { clientId } : undefined,
  });

  return response.data;
}

export async function createContentTemplate(payload: ContentTemplatePayload) {
  const response = await api.post<ContentTemplate>('/content-templates', payload);

  return response.data;
}

export async function updateContentTemplate(id: string, payload: Partial<ContentTemplatePayload>) {
  const response = await api.patch<ContentTemplate>(`/content-templates/${id}`, payload);

  return response.data;
}

export async function deleteContentTemplate(id: string) {
  await api.delete(`/content-templates/${id}`);
}
