'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Loader2, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  createOrganization,
  getOrganizationFeatures,
  getOrganizations,
  updateOrganizationFeature,
} from '@/lib/api';

export default function SuperAdminPage() {
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: getOrganizations });
  const organizations = organizationsQuery.data ?? [];
  const activeOrganizationId = selectedOrganizationId ?? organizations[0]?.id ?? null;
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
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b p-5">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-black">Organizations</h2>
          </div>
          <div className="grid gap-2 p-4">
            {organizationsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading organizations
              </div>
            ) : null}
            {organizations.map((organization) => {
              const selected = organization.id === activeOrganizationId;

              return (
                <button
                  className={`rounded-xl border p-3 text-left transition ${
                    selected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  key={organization.id}
                  onClick={() => setSelectedOrganizationId(organization.id)}
                  type="button"
                >
                  <span className="block font-semibold">{organization.name}</span>
                  <span className="block text-xs text-muted-foreground">{organization.slug}</span>
                </button>
              );
            })}
          </div>
          <form className="grid gap-3 border-t p-4" onSubmit={submitOrganization}>
            <h3 className="flex items-center gap-2 text-sm font-black">
              <Plus className="h-4 w-4" /> Add organization
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="organization-name">Name</Label>
              <Input id="organization-name" onChange={(event) => setName(event.target.value)} value={name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization-slug">Slug</Label>
              <Input
                id="organization-slug"
                onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="client-agency"
                value={slug}
              />
            </div>
            <Button disabled={createMutation.isPending || !name.trim() || !slug.trim()} type="submit">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create organization
            </Button>
          </form>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b p-5">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-black">Feature Access</h2>
              <p className="text-xs text-muted-foreground">Changes apply immediately to API access.</p>
            </div>
          </div>
          <div className="divide-y">
            {featuresQuery.isLoading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading feature access
              </div>
            ) : null}
            {featuresQuery.data?.map((feature) => (
              <div className="flex items-center justify-between gap-4 p-5" key={feature.key}>
                <div>
                  <h3 className="font-semibold">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Switch
                  checked={feature.enabled}
                  disabled={featureMutation.isPending}
                  onCheckedChange={(enabled) => featureMutation.mutate({ featureKey: feature.key, enabled })}
                />
              </div>
            ))}
            {!activeOrganizationId && !organizationsQuery.isLoading ? (
              <div className="p-5 text-sm text-muted-foreground">Create an organization to manage feature access.</div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
