"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { CATEGORY_META, MANUAL_STATUSES, STATUS_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Reimbursement, ReimbursementStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function FinancePage() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const reimbursements = useAppStore((s) => s.reimbursements);
  const policies = useAppStore((s) => s.policies);
  const updateReimbursementStatus = useAppStore((s) => s.updateReimbursementStatus);
  const factsFor = useAppStore((s) => s.factsFor);
  const user = users.find((item) => item.id === currentUserId)!;
  const isFinance = user.role === "zhoumin";
  const [selectedId, setSelectedId] = useState<string | null>(reimbursements[0]?.id ?? null);
  const selected = reimbursements.find((item) => item.id === selectedId) ?? null;
  const [status, setStatus] = useState<ReimbursementStatus>("material_review");
  const [comment, setComment] = useState("已核验申请人身份为小林，材料进入审核。");
  const [complete, setComplete] = useState(true);

  function selectRecord(item: Reimbursement) {
    setSelectedId(item.id);
    setStatus(item.status === "submitted" ? "material_review" : item.status);
  }

  function applyUpdate() {
    if (!selected) return;
    const result = updateReimbursementStatus({
      id: selected.id,
      status,
      comment,
      materialComplete: complete
    });
    if (!result.ok) {
      toast.error("未更新", result.message);
      return;
    }
    toast.success("进度已回写", result.message);
  }

  const required = selected
    ? Array.from(
        new Set(
          policies
            .filter(
              (policy) =>
                policy.status === "valid" &&
                (policy.category === selected.category || policy.category === "office")
            )
            .flatMap((policy) => policy.requiredMaterials)
        )
      )
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>待办单据</CardTitle>
          <CardDescription>展示已提交单据。周敏确认是小林本人单据后，手动回写审核进度。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isFinance && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              业务事实核对仅周敏可操作。当前为只读预览。
            </div>
          )}
          {reimbursements.length === 0 ? (
            <div className="rounded-lg border border-dashed px-3 py-10 text-center text-sm text-slate-500">
              暂无已提交单据。请先让小林上传材料生成 R-0001。
            </div>
          ) : (
            reimbursements.map((item) => {
              const applicant = users.find((u) => u.id === item.applicantId);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectRecord(item)}
                  className={`w-full rounded-lg border px-3 py-3 text-left ${
                    selectedId === item.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.id}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    申请人 {applicant?.name} · {CATEGORY_META[item.category].label} · {formatDateTime(item.createdAt)}
                  </p>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>核对与进度回写</CardTitle>
          <CardDescription>状态更新会同步到小林的查询结果。此处没有自动审批或打款按钮。</CardDescription>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-slate-500">请选择左侧单据。</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p>
                  单号 {selected.id} · 申请人确认为{" "}
                  {users.find((u) => u.id === selected.applicantId)?.name}
                </p>
                <p className="mt-1 text-slate-500">{selected.remark}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">材料完整性（对照现行制度）</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {required.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {selected.attachments.map((file) => (
                    <li key={file.id}>已上传：{file.name}</li>
                  ))}
                </ul>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} />
                标记材料完整（业务事实，非自动审批）
              </label>
              <div>
                <p className="mb-1 text-sm font-medium">回写进度</p>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReimbursementStatus)}
                  disabled={!isFinance}
                >
                  {MANUAL_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_META[value].label}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} disabled={!isFinance} />
              <Button className="w-full" disabled={!isFinance} onClick={applyUpdate}>
                保存核对结果并同步小林端
              </Button>
              <div>
                <p className="text-xs font-medium text-slate-500">历史核对记录</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {factsFor(selected.id).length === 0 ? (
                    <li className="text-slate-400">尚无 MockFact 记录</li>
                  ) : (
                    factsFor(selected.id).map((fact) => (
                      <li key={fact.id} className="rounded border px-3 py-2">
                        {STATUS_META[fact.status].label} · {fact.comment}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
