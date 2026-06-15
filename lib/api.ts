import axios from 'axios';
import { getAccessToken } from './auth';
import {
  AutomationLog,
  Asset,
  AssetPayload,
  Approval,
  ApprovalDecisionPayload,
  ApprovalPayload,
  AuthResponse,
  AnalyticsPayload,
  AnalyticsRecord,
  AiGenerationPayload,
  AiGenerationResponse,
  Client,
  ClientPortalOverview,
  ClientPayload,
  ContentItem,
  ContentPayload,
  DriveFolderListing,
  DriveItem,
  Lead,
  LeadPayload,
  LeadUpdatePayload,
  RegisterPayload,
  Report,
  ReportPayload,
  SocialConnection,
  MetaOauthUrlResponse,
  User,
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

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<User>('/auth/register', payload);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<User>('/auth/me');

  return response.data;
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

export async function getAutomationLogs() {
  const response = await api.get<AutomationLog[]>('/automation/logs');

  return response.data;
}

function cleanParams(filters: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null && value !== ''),
  );
}

export type ContentFilters = {
  clientId?: string;
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
