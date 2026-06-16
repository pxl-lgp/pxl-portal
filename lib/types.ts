export type UserRole = 'ADMIN' | 'TEAM' | 'CLIENT';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

export type ClientStatus = 'LEAD' | 'ONBOARDING' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type Client = {
  id: string;
  businessName: string;
  industry: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: Record<string, string>;
  goals: string | null;
  brandNotes: string | null;
  servicesNeeded: string[];
  status: ClientStatus;
  driveFolderUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientPayload = {
  businessName: string;
  industry?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
  goals?: string;
  brandNotes?: string;
  servicesNeeded?: string[];
  status?: ClientStatus;
  driveFolderUrl?: string;
};

export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  status: CampaignStatus;
  goal: string | null;
  budget: string | null;
  audience: string | null;
  offer: string | null;
  notes: string | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CampaignPayload = {
  clientId: string;
  name: string;
  status?: CampaignStatus;
  goal?: string;
  budget?: string;
  audience?: string;
  offer?: string;
  notes?: string;
  startsAt?: string;
  endsAt?: string;
};

export type AutomationStatus = 'PENDING' | 'SENT' | 'SUCCEEDED' | 'FAILED';

export type AutomationLog = {
  id: string;
  eventName: string;
  status: AutomationStatus;
  entityType: string;
  entityId: string | null;
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentStatus =
  | 'IDEA'
  | 'DRAFTING'
  | 'DESIGNING'
  | 'INTERNAL_REVIEW'
  | 'CLIENT_APPROVAL'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REPORTED';

export type SocialPlatform = 'FACEBOOK_PAGE' | 'INSTAGRAM';

export type SocialPublishResult = {
  status: 'SUCCEEDED' | 'FAILED';
  connectionId?: string;
  platform?: SocialPlatform;
  destinationName?: string;
  remoteId?: string;
  publishedAt?: string;
  error?: string;
};

export type SocialTarget = {
  connectionId: string;
  platform: SocialPlatform;
};

export type SocialConnection = {
  id: string;
  clientId: string;
  authorizationId: string;
  facebookPageId: string;
  facebookPageName: string;
  instagramAccountId: string | null;
  instagramUsername: string | null;
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED';
  tokenExpiresAt: string | null;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type MetaOauthUrlResponse = {
  url: string;
  expiresAt: string;
};

export type ContentItem = {
  id: string;
  clientId: string;
  campaignId: string | null;
  title: string;
  contentType: string;
  platform: string | null;
  platforms: SocialPlatform[];
  socialTargets: SocialTarget[];
  status: ContentStatus;
  caption: string | null;
  hashtags: string[];
  mediaUrl: string | null;
  publishResults: Record<string, SocialPublishResult>;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentPayload = {
  clientId: string;
  campaignId?: string;
  title: string;
  contentType: string;
  platform?: string;
  platforms?: SocialPlatform[];
  socialTargets?: SocialTarget[];
  status?: ContentStatus;
  caption?: string;
  hashtags?: string[];
  mediaUrl?: string;
  scheduledAt?: string;
  publishedAt?: string;
};

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED';

export type Approval = {
  id: string;
  contentItemId: string;
  clientId: string;
  status: ApprovalStatus;
  feedback: string | null;
  revisionCount: number;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalComment = {
  id: string;
  approvalId: string;
  clientId: string;
  authorUserId: string | null;
  authorName: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalPayload = {
  contentItemId: string;
};

export type ApprovalDecisionPayload = {
  status: 'APPROVED' | 'REVISION_REQUESTED';
  feedback?: string;
};

export type ApprovalCommentPayload = {
  body: string;
};

export type AiLanguage = 'EN' | 'TAGLISH';

export type AiGenerationPayload = {
  clientName: string;
  industry?: string;
  contentTitle: string;
  contentType: string;
  platform?: string;
  goals?: string;
  brandNotes?: string;
  context?: string;
  tone?: string;
  hashtags?: string[];
  language?: AiLanguage;
  seo?: boolean;
};

export type AssistResponse = AiGenerationResponse;

export type AiGenerationResponse = {
  provider: string;
  model: string;
  output: string;
};

export type PerformanceMetrics = {
  reach?: number;
  impressions?: number;
  engagement?: number;
  clicks?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  followersGained?: number;
};

export type AnalyzePerformancePayload = {
  clientName: string;
  contentTitle?: string;
  platform?: string;
  contentType?: string;
  metrics: PerformanceMetrics;
};

export type AnalyticsRecord = {
  id: string;
  contentItemId: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsPayload = {
  contentItemId: string;
  reach?: number;
  impressions?: number;
  engagement?: number;
  clicks?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  followersGained?: number;
  capturedAt?: string;
};

export type Report = {
  id: string;
  clientId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary: string | null;
  driveUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportPayload = {
  clientId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary?: string;
  driveUrl?: string;
};

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';

export type LeadScoreBand = 'COLD' | 'WARM' | 'HOT';

export type Lead = {
  id: string;
  businessName: string;
  contactPerson: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  message: string | null;
  status: LeadStatus;
  score: number;
  scoreBand: LeadScoreBand;
  scoreReasons: string[];
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadPayload = {
  businessName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  source?: string;
  message?: string;
};

export type LeadUpdatePayload = Partial<LeadPayload> & {
  status?: LeadStatus;
  clientId?: string;
};

export type Asset = {
  id: string;
  clientId: string;
  contentItemId: string | null;
  name: string;
  assetType: string;
  driveUrl: string;
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type AssetPayload = {
  clientId: string;
  contentItemId?: string;
  name: string;
  assetType: string;
  driveUrl: string;
  version?: number;
  tags?: string[];
};

export type ClientPortalOverview = {
  client: Client;
  contentItems: ContentItem[];
  approvals: Approval[];
  assets: Asset[];
  reports: Report[];
};

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  modifiedTime: string | null;
  webViewLink: string | null;
  thumbnailLink: string | null;
  isFolder: boolean;
};

export type DriveFolderListing = {
  rootFolderId: string;
  currentFolder: {
    id: string;
    name: string;
    parentId: string | null;
    webViewLink: string | null;
  };
  items: DriveItem[];
};

export type OnboardingTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export type OnboardingTask = {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  status: OnboardingTaskStatus;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentPillar = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  cadencePerMonth: number;
  createdAt: string;
  updatedAt: string;
};

export type ContentPillarPayload = {
  clientId: string;
  name: string;
  description?: string;
  cadencePerMonth?: number;
};

export type ContentTemplate = {
  id: string;
  clientId: string | null;
  name: string;
  contentType: string;
  platform: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentTemplatePayload = {
  clientId?: string;
  name: string;
  contentType: string;
  platform?: string;
  body: string;
};

export type BestTimeSlot = {
  weekday: number;
  weekdayLabel: string;
  hour: number;
  avgEngagement: number;
  sampleSize: number;
};

export type BestTimeResult = {
  sampleSize: number;
  topSlots: BestTimeSlot[];
  bestHours: Array<{ hour: number; avgEngagement: number; sampleSize: number }>;
  bestWeekdays: Array<{ weekday: number; weekdayLabel: string; avgEngagement: number; sampleSize: number }>;
  note: string;
};
