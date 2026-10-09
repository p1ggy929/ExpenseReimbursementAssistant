export type RoleId = "xiaolin" | "jojie" | "zhoumin" | "chengong";

export type PolicyCategory = "transport" | "dining" | "lodging" | "office";
export type PolicyStatus = "valid" | "revoked";

export type ReimbursementStatus =
  | "submitted"
  | "material_review"
  | "finance_review"
  | "rejected"
  | "approved";

export type AttachmentKind = "invoice" | "itinerary" | "other";

export interface User {
  id: string;
  name: string;
  role: RoleId;
  title: string;
}

export interface Policy {
  id: string;
  category: PolicyCategory;
  title: string;
  content: string;
  requiredMaterials: string[];
  status: PolicyStatus;
  updatedBy: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  size: number;
}

export interface Reimbursement {
  id: string;
  applicantId: string;
  category: PolicyCategory;
  amount: number;
  remark: string;
  items: string[];
  attachments: Attachment[];
  status: ReimbursementStatus;
  createdAt: string;
  updatedAt: string;
  reviewerId?: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  status: ReimbursementStatus | "created";
  label: string;
  at: string;
  by: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  detail: string;
}

export interface MockFact {
  id: string;
  reimbursementId: string;
  status: ReimbursementStatus;
  updatedBy: string;
  comment: string;
  materialComplete: boolean;
}

export interface KnowledgeHit {
  query: string;
  policyIds: string[];
  hit: boolean;
  at: string;
}

export interface AppStateData {
  currentUserId: string;
  users: User[];
  policies: Policy[];
  reimbursements: Reimbursement[];
  auditLogs: AuditLog[];
  mockFacts: MockFact[];
  knowledgeHits: KnowledgeHit[];
}
