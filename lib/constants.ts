import type { PolicyCategory, ReimbursementStatus, RoleId } from "./types";

export const APP_NAME = "青禾报销助手";
export const DEMO_DISCLAIMER = "真实登录与财务系统对接在正式试点前另行完成";
export const UNAUTHORIZED_QUERY_MESSAGE =
  "请确认访问权限，目前仅支持经授权查询本人单据状态。";
export const NO_POLICY_MESSAGE =
  "目前暂无相关制度，请联系乔姐确认，切勿凭经验操作。";
export const REVOKED_POLICY_MESSAGE = "该制度已失效";

export const ROLE_META: Record<
  RoleId,
  { label: string; duty: string; color: string; badgeClass: string }
> = {
  xiaolin: {
    label: "小林",
    duty: "业务使用者：查询制度、提交材料、查询本人单据状态",
    color: "#0D9488",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200"
  },
  jojie: {
    label: "乔姐",
    duty: "制度维护者：维护、发布、撤回报销制度与材料要求",
    color: "#D97706",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
  },
  zhoumin: {
    label: "周敏",
    duty: "业务事实核对者：核对材料完整性并手动更新审批进度",
    color: "#16A34A",
    badgeClass: "bg-green-50 text-green-800 border-green-200"
  },
  chengong: {
    label: "陈工",
    duty: "FDE 构建者：查看运行日志、知识库命中与系统边界",
    color: "#1E3A8A",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200"
  }
};

export const CATEGORY_META: Record<
  PolicyCategory,
  { label: string; description: string }
> = {
  transport: { label: "交通", description: "机票、高铁、市内交通" },
  dining: { label: "餐饮", description: "差旅餐费与招待边界" },
  lodging: { label: "住宿", description: "酒店标准与发票要求" },
  office: { label: "办公", description: "材料总则与办公费用" }
};

export const STATUS_META: Record<
  ReimbursementStatus,
  { label: string; className: string; hint: string }
> = {
  submitted: {
    label: "已提交",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    hint: "单据已进入原业务流程，等待材料核对"
  },
  material_review: {
    label: "材料审核中",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    hint: "行政/财务正在核对材料完整性"
  },
  finance_review: {
    label: "财务复核中",
    className: "bg-indigo-50 text-indigo-800 border-indigo-200",
    hint: "财务专员正在复核业务事实"
  },
  rejected: {
    label: "已驳回",
    className: "bg-rose-50 text-rose-800 border-rose-200",
    hint: "原业务流程已驳回，本助手仅展示结果"
  },
  approved: {
    label: "已通过",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    hint: "原业务流程已通过，本助手不付款、不自动审批"
  }
};

export const MANUAL_STATUSES: ReimbursementStatus[] = [
  "submitted",
  "material_review",
  "finance_review",
  "rejected",
  "approved"
];
