'use client';

import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { getPermissions } from '@/lib/api';
import { UserRole } from '@/lib/types';

const roles: UserRole[] = ['ADMIN', 'TEAM', 'CLIENT'];

export default function PermissionsPage() {
  const query = useQuery({ queryKey: ['permissions'], queryFn: getPermissions });
  const permissions = query.data ?? [];

  return (
    <>
      <section>
        <h1 className="text-2xl font-black">Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Current role permissions for the portal and API.</p>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b p-5">
          <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-black">Role matrix</h2>
        </div>
        {query.isError ? <div className="p-5 text-sm text-red-700">Unable to load permissions.</div> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">Permission</th>
                {roles.map((role) => <th className="p-3" key={role}>{role}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr className="border-t" key={permission.key}>
                  <td className="p-3 font-medium">{permission.label}</td>
                  {roles.map((role) => (
                    <td className="p-3" key={role}>{permission.roles.includes(role) ? 'Yes' : 'No'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
