import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import type { PageId } from "../../../web/src/data/copy";

export type Role = "admin" | "editor" | "officer";
export const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  editor: "Content Editor",
  officer: "Application Officer",
};
export type StaffUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  active: boolean;
  loginEmail: string;
  activated: boolean;
};
export type DocumentId = PageId;
export type Activity = {
  id: string;
  scope: "content" | "applications" | "contact" | "staff";
  at: string;
  actorId: string;
  message: string;
};
export type ContentEntry = {
  revision: number;
  id: DocumentId;
  updatedAt: string;
  updatedBy: string;
  history: Activity[];
};
export type ApplicationStatus =
  | "new"
  | "in_review"
  | "needs_information"
  | "recommended"
  | "approved"
  | "rejected";
export type ApplicationKind = "membership" | "loan";
export type ApplicationAttachmentRole = "id" | "photo";
export type ApplicationAttachment = {
  role: ApplicationAttachmentRole;
  storageId: string;
  url?: string | null;
};
type ApplicationBase = {
  revision: number;
  source: "website" | "staff";
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  submittedAt: string;
  status: ApplicationStatus;
  assigneeId: string;
  notes: Activity[];
  history: Activity[];
  informationRequest: string;
  recommendation: {
    decision: "approve" | "reject";
    reason: string;
    actorId: string;
    at: string;
  } | null;
  decision: {
    outcome: "approved" | "rejected";
    reason: string;
    actorId: string;
    at: string;
  } | null;
  attachments: ApplicationAttachment[];
};
export type MembershipApplication = ApplicationBase & {
  kind: "membership";
  membershipType: "personal" | "group" | "children";
  purpose: string;
};
export type LoanApplication = ApplicationBase & {
  kind: "loan";
  product: string;
  amount: number;
  months: number;
  memberNumber: string;
  purpose: string;
};
export type Application = MembershipApplication | LoanApplication;
export type NewApplication = {
  kind: ApplicationKind;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  membershipType: MembershipApplication["membershipType"];
  product: string;
  amount: number;
  months: number;
  memberNumber: string;
  purpose: string;
  assigneeId: string;
  attachments: ApplicationAttachment[];
};
export type WorkspaceState = {
  users: StaffUser[];
  applications: Application[];
  content: {
    published: WebsiteContent;
    entries: ContentEntry[];
  };
  activity: Activity[];
};
export type Permission =
  | "content:view"
  | "content:edit"
  | "applications:view"
  | "applications:review"
  | "applications:decide"
  | "staff:manage";
export function can(user: StaffUser, permission: Permission) {
  if (!user.active) return false;
  if (user.roles.includes("admin")) return true;
  switch (permission) {
    case "content:view":
    case "content:edit":
      return user.roles.includes("editor");
    case "applications:view":
    case "applications:review":
      return user.roles.includes("officer");
    default:
      return false;
  }
}
export const statusLabels: Record<ApplicationStatus, string> =
  {
    in_review: "In review",
    new: "New",
    needs_information: "Needs information",
    recommended: "Awaiting decision",
    approved: "Approved",
    rejected: "Rejected",
  };
