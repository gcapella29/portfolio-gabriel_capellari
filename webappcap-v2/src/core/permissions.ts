export type Role = "owner" | "admin" | "editor" | "viewer";

export type Capability =
  | "manageProject"
  | "inviteMembers"
  | "chooseTemplate"
  | "editContent"
  | "editAppearance"
  | "manageMedia"
  | "manageDomain"
  | "viewLeads"
  | "publish"
  | "view";

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  owner: [
    "manageProject",
    "inviteMembers",
    "chooseTemplate",
    "editContent",
    "editAppearance",
    "manageMedia",
    "manageDomain",
    "viewLeads",
    "publish",
    "view",
  ],
  admin: [
    "inviteMembers",
    "chooseTemplate",
    "editContent",
    "editAppearance",
    "manageMedia",
    "viewLeads",
    "publish",
    "view",
  ],
  editor: ["editContent", "manageMedia", "view"],
  viewer: ["view"],
};

export function can(role: Role, capability: Capability) {
  return ROLE_CAPABILITIES[role].includes(capability);
}
