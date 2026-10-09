"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UNAUTHORIZED_QUERY_MESSAGE, STATUS_META } from "./constants";
import { seedState } from "./mock-data";
import { searchPolicies, type KnowledgeAnswer } from "./knowledge";
import { nextReimbursementId, nowIso } from "./utils";
import type {
  AppStateData,
  Attachment,
  MockFact,
  Policy,
  PolicyCategory,
  Reimbursement,
  ReimbursementStatus,
  RoleId,
  User
} from "./types";

const STORAGE_KEY = "qinghe-reimbursement-demo-v1";

function addLog(
  state: AppStateData,
  action: string,
  userId: string,
  detail: string
): AppStateData {
  return {
    ...state,
    auditLogs: [
      {
        id: `log-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        action,
        userId,
        timestamp: nowIso(),
        detail
      },
      ...state.auditLogs
    ].slice(0, 200)
  };
}

interface AppStore extends AppStateData {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  currentUser: () => User;
  switchRole: (userId: string) => void;
  resetDemo: () => void;
  askKnowledge: (query: string) => KnowledgeAnswer;
  upsertPolicy: (
    policy: Omit<Policy, "id" | "updatedAt" | "updatedBy"> & { id?: string }
  ) => void;
  setPolicyStatus: (policyId: string, status: Policy["status"]) => void;
  submitReimbursement: (input: {
    category: PolicyCategory;
    amount: number;
    remark: string;
    items: string[];
    attachments: Attachment[];
  }) => { ok: boolean; message: string; id?: string };
  queryReimbursement: (id: string) => {
    ok: boolean;
    message: string;
    reimbursement?: Reimbursement;
  };
  updateReimbursementStatus: (input: {
    id: string;
    status: ReimbursementStatus;
    comment: string;
    materialComplete: boolean;
  }) => { ok: boolean; message: string };
  factsFor: (reimbursementId: string) => MockFact[];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...seedState(),
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((user) => user.id === currentUserId) ?? users[0];
      },
      switchRole: (userId) => {
        const user = get().users.find((item) => item.id === userId);
        if (!user) return;
        set((state) =>
          addLog(state, "auth.switch_role", userId, `切换角色为 ${user.name}（${user.title}）`)
        );
        set({ currentUserId: userId });
      },
      resetDemo: () => {
        const seeded = seedState();
        set({
          ...seeded,
          hydrated: true
        });
        set((state) =>
          addLog(state, "system.reset", "u-chengong", "演示数据已重置为初始 Mock 状态")
        );
      },
      askKnowledge: (query) => {
        const answer = searchPolicies(query, get().policies);
        set((state) => ({
          ...addLog(
            state,
            "knowledge.query",
            state.currentUserId,
            `查询「${query}」，命中 ${answer.matchedIds.length} 条制度`
          ),
          knowledgeHits: [
            {
              query,
              policyIds: answer.matchedIds,
              hit: answer.hit,
              at: nowIso()
            },
            ...state.knowledgeHits
          ].slice(0, 100)
        }));
        return answer;
      },
      upsertPolicy: (input) => {
        const user = get().currentUser();
        if (user.role !== "jojie") return;
        const timestamp = nowIso();
        set((state) => {
          const id = input.id ?? `p-${Date.now()}`;
          const existing = state.policies.find((policy) => policy.id === id);
          const next: Policy = {
            id,
            category: input.category,
            title: input.title,
            content: input.content,
            requiredMaterials: input.requiredMaterials,
            status: input.status,
            updatedBy: user.id,
            updatedAt: timestamp
          };
          const policies = existing
            ? state.policies.map((policy) => (policy.id === id ? next : policy))
            : [next, ...state.policies];
          return addLog(
            { ...state, policies },
            existing ? "policy.update" : "policy.create",
            user.id,
            `${existing ? "更新" : "新增"}制度《${next.title}》`
          );
        });
      },
      setPolicyStatus: (policyId, status) => {
        const user = get().currentUser();
        if (user.role !== "jojie") return;
        set((state) => {
          const policy = state.policies.find((item) => item.id === policyId);
          if (!policy) return state;
          const policies = state.policies.map((item) =>
            item.id === policyId
              ? { ...item, status, updatedBy: user.id, updatedAt: nowIso() }
              : item
          );
          return addLog(
            { ...state, policies },
            status === "valid" ? "policy.publish" : "policy.revoke",
            user.id,
            `${status === "valid" ? "发布" : "撤回"}制度《${policy.title}》`
          );
        });
      },
      submitReimbursement: (input) => {
        const user = get().currentUser();
        if (user.role !== "xiaolin") {
          return { ok: false, message: "仅小林（普通员工）可提交本人报销材料。" };
        }
        if (!input.attachments.length) {
          return { ok: false, message: "请至少上传一份发票或行程单后再提交。" };
        }
        let createdId = "";
        set((state) => {
          createdId = nextReimbursementId(state.reimbursements.map((item) => item.id));
          const createdAt = nowIso();
          const reimbursement: Reimbursement = {
            id: createdId,
            applicantId: user.id,
            category: input.category,
            amount: input.amount,
            remark: input.remark,
            items: input.items,
            attachments: input.attachments,
            status: "submitted",
            createdAt,
            updatedAt: createdAt,
            timeline: [
              {
                id: `tl-${createdId}-created`,
                status: "created",
                label: "材料已提交，等待核对",
                at: createdAt,
                by: user.id
              }
            ]
          };
          return addLog(
            {
              ...state,
              reimbursements: [reimbursement, ...state.reimbursements]
            },
            "reimbursement.submit",
            user.id,
            `${user.name}提交报销材料，生成单号 ${createdId}`
          );
        });
        return {
          ok: true,
          message: `已生成报销单号 ${createdId}。本助手不审批、不付款，进度由周敏在原流程核对后回写。`,
          id: createdId
        };
      },
      queryReimbursement: (id) => {
        const user = get().currentUser();
        const reimbursement = get().reimbursements.find(
          (item) => item.id.toUpperCase() === id.trim().toUpperCase()
        );
        if (!reimbursement) {
          set((state) =>
            addLog(state, "reimbursement.query_miss", user.id, `查询单号 ${id} 不存在`)
          );
          return { ok: false, message: "未找到该单号，请确认后重试。" };
        }
        if (reimbursement.applicantId !== user.id) {
          set((state) =>
            addLog(
              state,
              "reimbursement.unauthorized",
              user.id,
              `无权查询 ${reimbursement.id}（申请人非当前用户）`
            )
          );
          return { ok: false, message: UNAUTHORIZED_QUERY_MESSAGE };
        }
        set((state) =>
          addLog(state, "reimbursement.query", user.id, `查询本人单据 ${reimbursement.id}`)
        );
        return { ok: true, message: "已确认是本人单据。", reimbursement };
      },
      updateReimbursementStatus: (input) => {
        const user = get().currentUser();
        if (user.role !== "zhoumin") {
          return { ok: false, message: "仅财务专员周敏可核对业务事实并回写进度。" };
        }
        const target = get().reimbursements.find((item) => item.id === input.id);
        if (!target) return { ok: false, message: "单据不存在。" };

        set((state) => {
          const updatedAt = nowIso();
          const reimbursements = state.reimbursements.map((item) => {
            if (item.id !== input.id) return item;
            return {
              ...item,
              status: input.status,
              reviewerId: user.id,
              updatedAt,
              timeline: [
                ...item.timeline,
                {
                  id: `tl-${item.id}-${Date.now()}`,
                  status: input.status,
                  label: `${STATUS_META[input.status].label}${input.comment ? `：${input.comment}` : ""}`,
                  at: updatedAt,
                  by: user.id
                }
              ]
            };
          });
          const fact: MockFact = {
            id: `fact-${Date.now()}`,
            reimbursementId: input.id,
            status: input.status,
            updatedBy: user.id,
            comment: input.comment,
            materialComplete: input.materialComplete
          };
          return addLog(
            {
              ...state,
              reimbursements,
              mockFacts: [fact, ...state.mockFacts]
            },
            "finance.update_status",
            user.id,
            `周敏将 ${input.id} 进度更新为 ${STATUS_META[input.status].label}`
          );
        });
        return {
          ok: true,
          message: `已将 ${input.id} 标记为「${STATUS_META[input.status].label}」。此为原流程进度回写，系统未自动审批或付款。`
        };
      },
      factsFor: (reimbursementId) =>
        get().mockFacts.filter((fact) => fact.reimbursementId === reimbursementId)
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
        policies: state.policies,
        reimbursements: state.reimbursements,
        auditLogs: state.auditLogs,
        mockFacts: state.mockFacts,
        knowledgeHits: state.knowledgeHits
      })
    }
  )
);

export function useCurrentRole(): RoleId {
  return useAppStore((state) => state.users.find((user) => user.id === state.currentUserId)?.role ?? "xiaolin");
}
