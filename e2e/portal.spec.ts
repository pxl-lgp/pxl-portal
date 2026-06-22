import { expect, Page, test } from '@playwright/test';

const now = '2026-06-16T10:00:00.000Z';

const adminUser = {
  id: 'user-admin',
  email: 'admin@pxl.local',
  name: 'PXL Admin',
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: now,
  updatedAt: now,
};

const clientUser = {
  id: 'user-client',
  email: 'client@example.com',
  name: 'Client User',
  role: 'CLIENT',
  status: 'ACTIVE',
  createdAt: now,
  updatedAt: now,
};

const baseClient = {
  id: 'client-1',
  businessName: 'Acme Coffee',
  industry: 'Food and beverage',
  contactPerson: 'Ana Santos',
  email: 'ana@acme.test',
  phone: '09170000000',
  socialLinks: {},
  goals: 'Grow local orders',
  brandNotes: 'Warm and practical',
  servicesNeeded: ['Social Media'],
  status: 'ACTIVE',
  driveFolderUrl: 'https://drive.example/client-1',
  createdAt: now,
  updatedAt: now,
};

const baseContent = {
  id: 'content-1',
  clientId: 'client-1',
  campaignId: 'campaign-1',
  title: 'June promo reel',
  contentType: 'reel',
  platform: 'Instagram',
  platforms: ['INSTAGRAM'],
  socialTargets: [{ connectionId: 'connection-1', platform: 'INSTAGRAM' }],
  status: 'CLIENT_APPROVAL',
  caption: 'Try our June coffee promo.',
  hashtags: ['coffee'],
  mediaUrl: 'https://cdn.example/reel.mp4',
  publishResults: {},
  scheduledAt: null,
  publishedAt: null,
  createdAt: now,
  updatedAt: now,
};

const baseCampaign = {
  id: 'campaign-1',
  clientId: 'client-1',
  name: 'June Awareness Push',
  status: 'ACTIVE',
  goal: 'Increase inquiries',
  budget: 'PHP 50,000',
  audience: 'Local coffee buyers',
  offer: 'Free pastry with large coffee',
  notes: 'Focus on Reels',
  startsAt: now,
  endsAt: now,
  createdAt: now,
  updatedAt: now,
};

const baseApproval = {
  id: 'approval-1',
  contentItemId: 'content-1',
  clientId: 'client-1',
  status: 'PENDING',
  feedback: null,
  revisionCount: 0,
  decidedAt: null,
  createdAt: now,
  updatedAt: now,
};

const baseApprovalComment = {
  id: 'comment-1',
  approvalId: 'approval-1',
  clientId: 'client-1',
  authorUserId: 'user-admin',
  authorName: 'PXL Admin',
  authorRole: 'ADMIN',
  body: 'Please review before Friday.',
  createdAt: now,
  updatedAt: now,
};

const baseAsset = {
  id: 'asset-1',
  clientId: 'client-1',
  contentItemId: 'content-1',
  name: 'June promo cover',
  assetType: 'graphic',
  driveUrl: 'https://cdn.example/june-promo.jpg',
  version: 2,
  tags: ['promo', 'coffee'],
  createdAt: now,
  updatedAt: now,
};

const baseOnboardingTasks = [
  {
    id: 'task-1',
    clientId: 'client-1',
    title: 'Collect brand assets',
    description: 'Gather logo, colors, fonts, and visual references.',
    status: 'DONE',
    sortOrder: 0,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-2',
    clientId: 'client-1',
    title: 'Confirm content goals',
    description: 'Agree on content objectives and approval workflow.',
    status: 'PENDING',
    sortOrder: 1,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  },
];

const socialConnection = {
  id: 'connection-1',
  clientId: 'client-1',
  authorizationId: 'auth-1',
  facebookPageId: 'page-1',
  facebookPageName: 'Acme Coffee Page',
  instagramAccountId: 'ig-1',
  instagramUsername: 'acmecoffee',
  status: 'CONNECTED',
  tokenExpiresAt: null,
  lastVerifiedAt: now,
  createdAt: now,
  updatedAt: now,
};

type ContentMock = Omit<typeof baseContent, 'publishedAt' | 'scheduledAt' | 'status'> & {
  publishedAt: string | null;
  scheduledAt: string | null;
  status: string;
};

type ApprovalMock = Omit<typeof baseApproval, 'decidedAt' | 'status'> & {
  decidedAt: string | null;
  status: string;
};

async function signInAs(page: Page, role: 'ADMIN' | 'CLIENT' = 'ADMIN') {
  await page.addInitScript(
    ({ token }) => window.localStorage.setItem('pxl_access_token', token),
    { token: `${role.toLowerCase()}-token` },
  );
}

async function mockApi(page: Page, options: { role?: 'ADMIN' | 'CLIENT' } = {}) {
  const role = options.role ?? 'ADMIN';
  const user = role === 'CLIENT' ? clientUser : adminUser;
  const clients = [{ ...baseClient }];
  const users = [{ ...adminUser }, { ...clientUser }];
  const campaigns = [{ ...baseCampaign }];
  const assets = [{ ...baseAsset }];
  const reports: Array<{
    id: string;
    clientId: string;
    title: string;
    periodStart: string;
    periodEnd: string;
    summary: string;
    driveUrl: string;
    status: string;
    sentAt: string | null;
    createdAt: string;
    updatedAt: string;
  }> = [{ id: 'report-1', clientId: 'client-1', title: 'June Report', periodStart: now, periodEnd: now, summary: 'Strong month.', driveUrl: 'https://drive.example/report', status: 'READY', sentAt: null, createdAt: now, updatedAt: now }];
  const onboardingTasks = baseOnboardingTasks.map((task) => ({ ...task }));
  const contentItems: ContentMock[] = [{ ...baseContent }];
  const approvals: ApprovalMock[] = [{ ...baseApproval }];
  const approvalComments = [{ ...baseApprovalComment }];

  await page.route('http://api.pxl-e2e.test/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '');

    if (path === '/auth/login' && request.method() === 'POST') {
      await route.fulfill({ json: { accessToken: `${role.toLowerCase()}-token`, user } });
      return;
    }

    if (path === '/auth/me' && request.method() === 'GET') {
      await route.fulfill({ json: user });
      return;
    }

    if (path === '/auth/invite' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const invited = { ...clientUser, ...payload, id: 'user-invited', status: 'ACTIVE', createdAt: now, updatedAt: now };
      users.push(invited);
      await route.fulfill({ status: 201, json: invited });
      return;
    }

    if (path === '/auth/forgot-password' && request.method() === 'POST') {
      await route.fulfill({ json: {} });
      return;
    }

    if (path === '/auth/reset-password' && request.method() === 'POST') {
      await route.fulfill({ json: {} });
      return;
    }

    if (path === '/auth/users/user-client/password-reset' && request.method() === 'POST') {
      await route.fulfill({ json: {} });
      return;
    }

    if (path === '/users' && request.method() === 'GET') {
      await route.fulfill({ json: users });
      return;
    }

    if (path === '/users/user-client' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      users[1] = { ...users[1], ...payload, updatedAt: now };
      await route.fulfill({ json: users[1] });
      return;
    }

    if (path === '/clients' && request.method() === 'GET') {
      await route.fulfill({ json: clients });
      return;
    }

    if (path === '/clients/client-1' && request.method() === 'GET') {
      await route.fulfill({ json: clients[0] });
      return;
    }

    if (path === '/clients' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const client = { ...baseClient, ...payload, id: 'client-new', createdAt: now, updatedAt: now };
      clients.push(client);
      await route.fulfill({ status: 201, json: client });
      return;
    }

    if (path === '/content' && request.method() === 'GET') {
      await route.fulfill({ json: contentItems });
      return;
    }

    if (path === '/campaigns' && request.method() === 'GET') {
      await route.fulfill({ json: campaigns });
      return;
    }

    if (path === '/campaigns' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const campaign = { ...baseCampaign, ...payload, id: 'campaign-new', createdAt: now, updatedAt: now };
      campaigns.push(campaign);
      await route.fulfill({ status: 201, json: campaign });
      return;
    }

    if (path === '/content' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const item = {
        ...baseContent,
        ...payload,
        id: 'content-new',
        platform: payload.platform ?? null,
        platforms: payload.platforms ?? [],
        publishResults: {},
        scheduledAt: payload.scheduledAt ?? null,
        publishedAt: payload.publishedAt ?? null,
        createdAt: now,
        updatedAt: now,
      };
      contentItems.push(item);
      await route.fulfill({ status: 201, json: item });
      return;
    }

    if (path === '/content/content-1' && request.method() === 'GET') {
      await route.fulfill({ json: contentItems[0] });
      return;
    }

    if (path === '/content/content-1' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      contentItems[0] = { ...contentItems[0], ...payload, updatedAt: now };
      await route.fulfill({ json: contentItems[0] });
      return;
    }

    if (path === '/content/content-1/schedule' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      contentItems[0] = { ...contentItems[0], status: 'SCHEDULED', scheduledAt: payload.scheduledAt, updatedAt: now };
      await route.fulfill({ json: contentItems[0] });
      return;
    }

    if (path === '/content/content-1/publish' && request.method() === 'PATCH') {
      contentItems[0] = { ...contentItems[0], status: 'PUBLISHED', publishedAt: now, updatedAt: now };
      await route.fulfill({ json: contentItems[0] });
      return;
    }

    if (path === '/approvals' && request.method() === 'GET') {
      await route.fulfill({ json: approvals });
      return;
    }

    if (path === '/approvals/approval-1/comments' && request.method() === 'GET') {
      await route.fulfill({ json: approvalComments });
      return;
    }

    if (path === '/approvals/approval-1/comments' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const comment = {
        ...baseApprovalComment,
        ...payload,
        id: `comment-${approvalComments.length + 1}`,
        authorUserId: 'user-admin',
        authorName: 'PXL Admin',
        authorRole: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      };
      approvalComments.push(comment);
      await route.fulfill({ status: 201, json: comment });
      return;
    }

    if (path === '/approvals' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const approval = { ...baseApproval, ...payload, id: 'approval-new', clientId: 'client-1' };
      approvals.push(approval);
      await route.fulfill({ status: 201, json: approval });
      return;
    }

    if (path === '/client-portal/overview' && request.method() === 'GET') {
      await route.fulfill({
        json: {
          client: clients[0],
          contentItems,
          approvals,
          assets,
          reports,
        },
      });
      return;
    }

    if (path === '/client-portal/approvals/approval-1' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      approvals[0] = { ...approvals[0], ...payload, decidedAt: now, updatedAt: now };
      await route.fulfill({ json: approvals[0] });
      return;
    }

    if (path === '/client-portal/approvals/approval-1/comments' && request.method() === 'GET') {
      await route.fulfill({ json: approvalComments });
      return;
    }

    if (path === '/client-portal/approvals/approval-1/comments' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const comment = {
        ...baseApprovalComment,
        ...payload,
        id: `comment-${approvalComments.length + 1}`,
        authorUserId: 'user-client',
        authorName: 'Client User',
        authorRole: 'CLIENT',
        createdAt: now,
        updatedAt: now,
      };
      approvalComments.push(comment);
      await route.fulfill({ status: 201, json: comment });
      return;
    }

    if (path === '/leads' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          id: 'lead-1',
          ...payload,
          phone: payload.phone ?? null,
          status: 'NEW',
          score: 75,
          scoreBand: 'WARM',
          scoreReasons: ['Website funnel'],
          clientId: null,
          createdAt: now,
          updatedAt: now,
        },
      });
      return;
    }

    if (path === '/analytics' && request.method() === 'GET') {
      await route.fulfill({ json: [] });
      return;
    }

    if (path === '/assets' && request.method() === 'GET') {
      await route.fulfill({ json: assets });
      return;
    }

    if (path === '/assets' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      const asset = { ...baseAsset, ...payload, id: 'asset-new', createdAt: now, updatedAt: now };
      assets.push(asset);
      await route.fulfill({ status: 201, json: asset });
      return;
    }

    if (path === '/assets/asset-1/auto-tag' && request.method() === 'POST') {
      assets[0] = { ...assets[0], tags: ['promo', 'coffee', 'ai-tagged'], updatedAt: now };
      await route.fulfill({ json: assets[0] });
      return;
    }

    if (path === '/reports' && request.method() === 'GET') {
      await route.fulfill({ json: reports });
      return;
    }

    if (path === '/reports/report-1/send' && request.method() === 'PATCH') {
      reports[0] = { ...reports[0], status: 'SENT', sentAt: now, updatedAt: now };
      await route.fulfill({ json: reports[0] });
      return;
    }

    if (path === '/client-health' && request.method() === 'GET') {
      await route.fulfill({ json: [{ clientId: 'client-1', businessName: 'Acme Coffee', score: 80, status: 'WATCH', reasons: ['No assets'] }] });
      return;
    }

    if (path === '/search' && request.method() === 'GET') {
      await route.fulfill({ json: [{ type: 'client', id: 'client-1', title: 'Acme Coffee', href: '/admin/clients/client-1' }] });
      return;
    }

    if (path.startsWith('/exports/') && request.method() === 'GET') {
      await route.fulfill({ body: 'businessName,email\nAcme Coffee,ana@acme.test', headers: { 'content-type': 'text/csv' } });
      return;
    }

    if (path === '/imports/leads' && request.method() === 'POST') {
      await route.fulfill({ json: { imported: 1 } });
      return;
    }

    if (path === '/imports/clients' && request.method() === 'POST') {
      await route.fulfill({ json: { imported: 1 } });
      return;
    }

    if (path === '/onboarding-tasks' && request.method() === 'GET') {
      await route.fulfill({ json: onboardingTasks });
      return;
    }

    if (path === '/onboarding-tasks/task-2' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      onboardingTasks[1] = {
        ...onboardingTasks[1],
        ...payload,
        completedAt: payload.status === 'DONE' ? now : null,
        updatedAt: now,
      };
      await route.fulfill({ json: onboardingTasks[1] });
      return;
    }

    if (path === '/automation/logs' && request.method() === 'GET') {
      await route.fulfill({ json: [{ id: 'automation-1', eventName: 'drive-folder-provisioned', status: 'FAILED', entityType: 'client', entityId: 'client-1', payload: {}, response: {}, errorMessage: 'Drive quota exceeded', createdAt: now, updatedAt: now }] });
      return;
    }

    if (path === '/automation/summary' && request.method() === 'GET') {
      await route.fulfill({ json: { total: 1, failed: 1, pending: 0, succeeded: 0, retryableFailures: 1, lastFailureAt: now } });
      return;
    }

    if (path === '/audit' && request.method() === 'GET') {
      await route.fulfill({ json: [{ id: 'audit-1', actorUserId: 'user-admin', action: 'user.updated', entityType: 'user', entityId: 'user-client', metadata: { fields: ['status'] }, createdAt: now, updatedAt: now }] });
      return;
    }

    if (path === '/settings/notifications' && request.method() === 'GET') {
      await route.fulfill({ json: [{ eventKey: 'new-lead', enabled: true, recipients: ['ops@pxl.local'] }] });
      return;
    }

    if (path === '/settings/notifications/new-lead' && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      await route.fulfill({ json: { eventKey: 'new-lead', enabled: payload.enabled ?? true, recipients: payload.recipients ?? [] } });
      return;
    }

    if (path === '/permissions' && request.method() === 'GET') {
      await route.fulfill({ json: [{ key: 'users.manage', label: 'Manage users', roles: ['ADMIN'] }] });
      return;
    }

    if (path === '/clients/client-1/social-connections' && request.method() === 'GET') {
      await route.fulfill({ json: [socialConnection] });
      return;
    }

    await route.fulfill({ status: 404, json: { message: `No E2E mock for ${request.method()} ${path}` } });
  });
}

test('admin can log in and reach the dashboard', async ({ page }) => {
  await mockApi(page);

  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin@pxl.local');
  await page.locator('#login-password').fill('change-this-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('admin can create a client', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/clients');
  await page.getByLabel('Business name').fill('Beta Bakery');
  await page.getByLabel('Industry').fill('Food');
  await page.getByLabel('Contact person').fill('Ben Baker');
  await page.getByLabel('Email').fill('ben@beta.test');
  await page.getByRole('button', { name: /save client/i }).click();

  await expect(page.getByText('Client saved. Automation event logged.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Beta Bakery' })).toBeVisible();
});

test('admin can create a campaign', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/campaigns');
  await page.getByLabel('Campaign name').fill('Holiday Growth Sprint');
  await page.getByLabel('Budget').fill('PHP 75,000');
  await page.getByLabel('Goal').fill('Drive holiday inquiries');
  await page.getByRole('button', { name: /save campaign/i }).click();

  await expect(page.getByText('Campaign saved.')).toBeVisible();
  await expect(page.getByText('Holiday Growth Sprint')).toBeVisible();
});

test('admin can track client onboarding progress', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/clients/client-1');
  await expect(page.getByRole('heading', { name: 'Onboarding Workspace' })).toBeVisible();
  await expect(page.getByText('50%')).toBeVisible();
  await expect(page.getByText('Collect brand assets')).toBeVisible();
  await expect(page.getByText('Confirm content goals')).toBeVisible();
  await page.locator('article').filter({ hasText: 'Confirm content goals' }).getByRole('combobox').selectOption('IN_PROGRESS');

  await expect(page.locator('article').filter({ hasText: 'Confirm content goals' }).getByRole('combobox')).toHaveValue('IN_PROGRESS');
});

test('admin can create content and send it for approval', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/content');
  await page.getByLabel('Title').fill('Summer promo post');
  await page.getByLabel('Content type').fill('post');
  await page.getByRole('button', { name: /save content/i }).click();

  await expect(page.getByText('Content saved.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Summer promo post' })).toBeVisible();

  await page.goto('/admin/approvals');
  await page.getByRole('button', { name: /^send$/i }).click();

  await expect(page.getByText('Content sent for approval.')).toBeVisible();
});

test('admin can bulk update selected content status', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/content');
  await page.getByLabel('Select June promo reel').check();
  await page.getByRole('button', { name: /apply status/i }).click();

  await expect(page.locator('tbody tr').filter({ hasText: 'June promo reel' }).getByText('DRAFTING')).toBeVisible();
});

test('admin can use media library cards and auto-tag assets', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/assets');
  await expect(page.getByRole('heading', { name: 'June promo cover' })).toBeVisible();
  await expect(page.getByText('Used in June promo reel')).toBeVisible();
  await expect(page.getByText('v2')).toBeVisible();
  await page.getByRole('button', { name: /auto-tag/i }).click();

  await expect(page.getByRole('article').filter({ hasText: 'June promo cover' }).getByText('ai-tagged')).toBeVisible();
});

test('admin can schedule and publish selected content', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/content/content-1');
  await expect(page.getByRole('heading', { name: 'Platform Previews' })).toBeVisible();
  await expect(page.getByText('Instagram preview')).toBeVisible();
  await expect(page.getByText(/Try our June coffee promo\.\s+#coffee/)).toBeVisible();
  await page.getByLabel('Schedule date and time').fill('2026-06-20T10:30');
  await page.getByRole('button', { name: /^schedule$/i }).click();

  await expect(page.getByText('Content scheduled.')).toBeVisible();

  await page.getByRole('button', { name: /publish now/i }).click();

  await expect(page.getByText('Published successfully to every selected destination.')).toBeVisible();
});

test('public funnel submits a lead', async ({ page }) => {
  await mockApi(page);

  await page.goto('/get-started');
  await page.getByRole('button', { name: 'Start My Free Plan' }).click();
  await page.getByRole('button', { name: 'E-commerce / Online store' }).click();
  await page.getByRole('button', { name: 'More leads & inquiries' }).click();
  await page.getByRole('button', { name: 'Under ₱25,000' }).click();
  await page.getByRole('button', { name: 'As soon as possible' }).click();
  await page.getByLabel('Your name').fill('Lia Lead');
  await page.getByLabel('Email address').fill('lia@example.com');
  await page.getByLabel('Business name (optional)').fill('Lia Studio');
  await page.getByRole('button', { name: /get my free growth plan/i }).click();

  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible();
});

test('client can approve pending content', async ({ page }) => {
  await signInAs(page, 'CLIENT');
  await mockApi(page, { role: 'CLIENT' });

  await page.goto('/client/dashboard');
  await expect(page.getByRole('heading', { name: 'Acme Coffee' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'June promo reel' })).toBeVisible();

  await page.getByRole('button', { name: /^approve$/i }).click();

  await expect(page.getByText('APPROVED')).toBeVisible();
});

test('client can comment on an approval thread', async ({ page }) => {
  await signInAs(page, 'CLIENT');
  await mockApi(page, { role: 'CLIENT' });

  await page.goto('/client/dashboard');
  await expect(page.getByText('Please review before Friday.')).toBeVisible();
  await page.getByPlaceholder('Add a comment or revision note').fill('Looks good from our side.');
  await page.getByRole('button', { name: /^send$/i }).click();

  await expect(page.getByText('Looks good from our side.')).toBeVisible();
});

test('admin can invite and disable a user', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/users');
  const inviteForm = page.locator('form').filter({ hasText: 'Invite user by email' });
  await inviteForm.getByLabel('Name').fill('Invited User');
  await inviteForm.getByLabel('Email').fill('invited@example.com');
  await inviteForm.getByRole('button', { name: /send invite/i }).click();

  await expect(page.getByText('Invite email sent.')).toBeVisible();

  const clientRow = page.locator('input[value="client@example.com"]').locator('xpath=ancestor::article');
  await clientRow.locator('select').nth(1).selectOption('DISABLED');
  await clientRow.getByRole('button', { name: /^save$/i }).click();

  await expect(page.getByText('User account updated.')).toBeVisible();
});

test('user can request and complete password reset', async ({ page }) => {
  await mockApi(page);

  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill('client@example.com');
  await page.getByRole('button', { name: /send reset link/i }).click();

  await expect(page.getByText(/reset email has been sent/i)).toBeVisible();

  await page.goto('/reset-password?token=test-token');
  await page.getByLabel('New password').fill('new-password-123');
  await page.getByRole('button', { name: /save password/i }).click();

  await expect(page.getByText('Password updated. You can now log in.')).toBeVisible();
});

test('admin can review audit logs, notifications, permissions, and automation health', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/audit-log');
  await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible();
  await expect(page.locator('article').filter({ hasText: 'user.updated' })).toBeVisible();

  await page.goto('/admin/notifications');
  await expect(page.getByRole('heading', { name: 'Notification settings' })).toBeVisible();
  await page.getByLabel('Recipients').fill('ops@pxl.local, owner@pxl.local');
  await page.getByRole('button', { name: /^save$/i }).click();

  await page.goto('/admin/permissions');
  await expect(page.getByRole('heading', { name: 'Permissions' })).toBeVisible();
  await expect(page.getByText('Manage users')).toBeVisible();

  await page.goto('/admin/automation');
  await expect(page.getByText('Drive quota exceeded')).toBeVisible();
  await expect(page.getByText('Retryable')).toBeVisible();
});

test('admin can use reports delivery, client health, search, and import export tools', async ({ page }) => {
  await signInAs(page);
  await mockApi(page);

  await page.goto('/admin/reports');
  await expect(page.getByText('June Report')).toBeVisible();
  await page.getByRole('button', { name: /send to client/i }).click();
  await expect(page.getByText('SENT', { exact: true })).toBeVisible();

  await page.goto('/admin/client-health');
  await expect(page.getByText('Acme Coffee')).toBeVisible();
  await expect(page.getByText('WATCH')).toBeVisible();

  await page.goto('/admin/search');
  await page.getByPlaceholder('Search anything').fill('Acme');
  await expect(page.getByText('Acme Coffee')).toBeVisible();

  await page.goto('/admin/import-export');
  await expect(page.getByRole('heading', { name: 'Import / Export' })).toBeVisible();
  await page.getByRole('textbox').fill('businessName,email\nNew Lead,new@example.com');
  await page.getByRole('button', { name: /^import$/i }).click();
  await expect(page.getByText('Imported 1 rows.')).toBeVisible();
});
