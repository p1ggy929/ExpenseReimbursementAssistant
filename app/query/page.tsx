"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { STATUS_META, UNAUTHORIZED_QUERY_MESSAGE } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Reimbursement } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function QueryPage() {
  const queryReimbursement = useAppStore((s) => s.queryReimbursement);
  const users = useAppStore((s) => s.users);
  const [id, setId] = useState("R-0001");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [record, setRecord] = useState<Reimbursement | null>(null);

  function handleQuery() {
    setLoading(true);
    setRecord(null);
    setDenied(false);
    window.setTimeout(() => {
      const result = queryReimbursement(id);
      setLoading(false);
      setMessage(result.message);
      if (!result.ok) {
        setDenied(result.message === UNAUTHORIZED_QUERY_MESSAGE);
        toast.error("无法展示单据", result.message);
        return;
      }
      setRecord(result.reimbursement ?? null);
      toast.success("已确认是本人单据", "正在展示原流程回写的进度，系统未自动审批。");
    }, 280);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>本人单据进度查询</CardTitle>
          <CardDescription>
            查询前必须校验是否为本人单据。非本人仅提示无权访问。财务核对请使用周敏的核对台。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="输入单号，如 R-0001" />
            <Button onClick={handleQuery} disabled={loading}>
              {loading ? "校验身份中…" : "查询进度"}
            </Button>
          </div>
          {denied && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">
              无权访问，请确认身份。{UNAUTHORIZED_QUERY_MESSAGE}
            </div>
          )}
          {message && !denied && !record && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {record && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{record.id}</CardTitle>
                <CardDescription>
                  申请人 {users.find((u) => u.id === record.applicantId)?.name} · 更新于{" "}
                  {formatDateTime(record.updatedAt)}
                </CardDescription>
              </div>
              <StatusBadge status={record.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{STATUS_META[record.status].hint}</p>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              金额 ¥{record.amount} · {record.remark || "无说明"}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">已提交材料（模拟）</p>
              <ul className="mt-2 space-y-1 text-sm">
                {record.attachments.map((file) => (
                  <li key={file.id}>{file.name}</li>
                ))}
              </ul>
            </div>
            <ol className="space-y-3 border-l border-slate-200 pl-4">
              {record.timeline.map((event) => (
                <li key={event.id}>
                  <p className="text-sm font-medium text-slate-800">{event.label}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(event.at)}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
