'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Loader2, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createOrganization,
  getOrganizationFeatures,
  getOrganizations,
  updateOrganizationFeature,
} from '@/lib/api';
import { Organization } from '@/lib/types';

export default function SuperAdminPage() {
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: getOrganizations });
  const organizations = organizationsQuery.data ?? [];
  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId) ?? null;
  const activeOrganizationId = selectedOrganization?.id ?? null;
  const featuresQuery = useQuery({
    queryKey: ['organizations', activeOrganizationId, 'features'],
    queryFn: () => getOrganizationFeatures(activeOrganizationId!),
    enabled: Boolean(activeOrganizationId),
  });
  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async (organization) => {
      setName('');
      setSlug('');
      setIsCreateModalOpen(false);
      setSelectedOrganizationId(organization.id);
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created.');
    },
    onError: () => toast.error('Unable to create organization.'),
  });
  const featureMutation = useMutation({
    mutationFn: ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) =>
      updateOrganizationFeature(activeOrganizationId!, featureKey, enabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['organizations', activeOrganizationId, 'features'] });
    },
    onError: () => toast.error('Unable to update feature access.'),
  });

  function submitOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ name, slug });
  }

  return (
    <>
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Platform controls</p>
          <h1 className="text-2xl font-black">Super Admin Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage organizations and turn feature bundles on or off per organization.
          </p>
        </div>
        <button className="button button-primary" onClick={() => setIsCreateModalOpen(true)} type="button">
          <Plus className="h-4 w-4" />
          Add organization
        </button>
      </section>

      <section>
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-black">Organizations</h2>
            </div>
            <p className="text-sm text-muted-foreground">{organizations.length} organizations</p>
          </div>
          <div>
            {organizationsQuery.isLoading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading organizations
              </div>
            ) : null}
            {!organizationsQuery.isLoading && organizations.length === 0 ? (
              <div className="grid min-h-40 place-items-center p-6 text-sm text-muted-foreground">
                No organizations yet.
              </div>
            ) : null}
            {organizations.length > 0 ? (
              <Table>
                <TableHeader className="bg-[var(--panel-muted)] text-xs uppercase text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3">Name</TableHead>
                    <TableHead className="px-4 py-3">Slug</TableHead>
                    <TableHead className="px-4 py-3">Created</TableHead>
                    <TableHead className="px-4 py-3 text-right">Feature access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((organization) => (
                    <TableRow
                      className="cursor-pointer"
                      key={organization.id}
                      onClick={() => setSelectedOrganizationId(organization.id)}
                    >
                      <TableCell className="px-4 py-3 font-bold">{organization.name}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">{organization.slug}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <button className="button button-secondary" type="button">
                          Manage features
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </div>
      </section>

      <CreateOrganizationModal
        isSaving={createMutation.isPending}
        name={name}
        onClose={() => setIsCreateModalOpen(false)}
        onNameChange={setName}
        onSlugChange={setSlug}
        onSubmit={submitOrganization}
        open={isCreateModalOpen}
        slug={slug}
      />

      <FeatureAccessModal
        features={featuresQuery.data ?? []}
        isLoading={featuresQuery.isLoading}
        isSaving={featureMutation.isPending}
        onClose={() => setSelectedOrganizationId(null)}
        onToggle={(featureKey, enabled) => featureMutation.mutate({ featureKey, enabled })}
        organization={selectedOrganization}
      />
    </>
  );
}

function CreateOrganizationModal({
  isSaving,
  name,
  onClose,
  onNameChange,
  onSlugChange,
  onSubmit,
  open,
  slug,
}: {
  isSaving: boolean;
  name: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  open: boolean;
  slug: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-black">Add organization</h2>
          </div>
          <button aria-label="Close modal" className="button button-secondary p-2" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="organization-name">Name</Label>
            <Input id="organization-name" onChange={(event) => onNameChange(event.target.value)} value={name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="organization-slug">Slug</Label>
            <Input
              id="organization-slug"
              onChange={(event) => onSlugChange(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="client-agency"
              value={slug}
            />
          </div>
          <Button disabled={isSaving || !name.trim() || !slug.trim()} type="submit">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create organization
          </Button>
        </form>
      </div>
    </div>
  );
}

function FeatureAccessModal({
  features,
  isLoading,
  isSaving,
  onClose,
  onToggle,
  organization,
}: {
  features: { key: string; label: string; description: string; enabled: boolean }[];
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onToggle: (featureKey: string, enabled: boolean) => void;
  organization: Organization | null;
}) {
  if (!organization) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog">
      <div className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div className="flex items-start gap-3">
            <SlidersHorizontal className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="font-black">Feature access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {organization.name} / {organization.slug}. Changes apply immediately to API access.
              </p>
            </div>
          </div>
          <button aria-label="Close modal" className="button button-secondary p-2" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading feature access
            </div>
          ) : null}
          {features.map((feature) => (
            <div className="flex items-center justify-between gap-4 p-5" key={feature.key}>
              <div>
                <h3 className="font-semibold">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={feature.enabled}
                disabled={isSaving}
                onCheckedChange={(enabled) => onToggle(feature.key, enabled)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
