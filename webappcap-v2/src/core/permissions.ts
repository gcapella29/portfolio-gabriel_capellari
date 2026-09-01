import type { ProjectRole } from './domain';

export type Capability =
  | 'manageProject'
  | 'inviteMembers'
  | 'chooseTemplate'
  | 'editContent'
  | 'editAppearance'
  | 'manageMedia'
  | 'manageDomain'
  | 'viewLeads'
  | 'publish'
  | 'view';

const grants: Record<ProjectRole, ReadonlySet<Capability>> = {
  owner: new Set(['manageProject','inviteMembers','chooseTemplate','editContent','editAppearance','manageMedia','manageDomain','viewLeads','publish','view']),
  admin: new Set(['chooseTemplate','editContent','editAppearance','manageMedia','manageDomain','viewLeads','publish','view']),
  editor: new Set(['editContent','manageMedia','view']),
  viewer: new Set(['view'])
};

export function can(role: ProjectRole, capability: Capability) {
  return grants[role].has(capability);
}

export function normalizeRole(value: unknown): ProjectRole | null {
  const role = String(value || '').toLowerCase();
  return role === 'owner' || role === 'admin' || role === 'editor' || role === 'viewer' ? role : null;
}
