"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Attachment, AttachmentKind, PolicyCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

function guessKind(name: string): AttachmentKind {
  if (/行程|itinerary|ticket/i.test(name)) return "itinerary";
  if (/发票|invoice|fapiao/i.test(name)) return "invoice";
  return "other";
}

export default function SubmitPage() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const policies = useAppStore((s) => s.policies);
  const submitReimbursement = useAppStore((s) => s.submitReimbursement);
  const user = users.find((item) => item.id === currentUserId)!;

  const [category, setCategory] = useState<PolicyCategory>("transport");
  const [amount, setAmount] = useState("860");
  const [remark, setRemark] = useState("上海出差 2 天，交通+住宿");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const required = useMemo(() => {
    const related = policies.filter(
      (policy) =>
        policy.status === "valid" && (policy.category === category || policy.category === "office")
    );
    return Array.from(new Set(related.flatMap((policy) => policy.requiredMaterials)));
  }, [policies, category]);

  const onDrop = useCallback((files: File[]) => {
    const next = files.map((file) => ({
      id: `file-${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      kind: guessKind(file.name),
      size: file.size
    }));
    setAttachments((prev) => [...prev, ...next]);
    toast.success("已模拟接收文件", "Demo 仅保存文件名，不上传至服务器。");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  function handleSubmit() {
    setSubmitting(true);
    window.setTimeout(() => {
      const result = submitReimbursement({
        category,
        amount: Number(amount) || 0,
        remark,
        items: required,
        attachments
      });
      setSubmitting(false);
      if (!result.ok) {
        toast.error("提交未完成", result.message);
        return;
      }
      setLastId(result.id ?? null);
      setAttachments([]);
      toast.success("材料已登记", result.message);
    }, 400);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>材料提交</CardTitle>
          <CardDescription>
            模拟上传发票、行程单。提交后生成单号（首次为 R-0001）。系统不审批、不付款。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.role !== "xiaolin" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              当前身份不是小林。提交入口仅对普通员工开放，避免误用他人身份登记单据。
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>费用类别</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as PolicyCategory)}
              >
                {(Object.keys(CATEGORY_META) as PolicyCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_META[key].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>金额（演示）</Label>
              <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>费用说明</Label>
            <Textarea className="mt-1" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-xl border border-dashed px-4 py-10 text-center",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-6 w-6 text-blue-700" />
            <p className="mt-2 text-sm font-medium">拖拽或点击上传发票 / 行程单</p>
            <p className="mt-1 text-xs text-slate-500">建议文件名包含「发票」或「行程单」，便于材料检查识别</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation();
                onDrop([
                  new File(["mock-invoice"], "差旅发票.pdf", { type: "application/pdf" }),
                  new File(["mock-itinerary"], "行程单.pdf", { type: "application/pdf" })
                ]);
              }}
            >
              使用示例材料
            </Button>
          </div>
          <div className="space-y-2">
            {attachments.length === 0 ? (
              <p className="text-sm text-slate-500">尚未选择文件。</p>
            ) : (
              attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {file.name}
                  </span>
                  <button
                    className="text-xs text-rose-600"
                    onClick={() => setAttachments((prev) => prev.filter((item) => item.id !== file.id))}
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </div>
          <Button className="w-full" disabled={submitting || user.role !== "xiaolin"} onClick={handleSubmit}>
            {submitting ? "生成单号中…" : "提交材料并获取单号"}
          </Button>
          {lastId && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
              单号 <span className="font-semibold">{lastId}</span> 已生成。请前往「进度查询」查看，审批仍在原业务流程。
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>材料检查</CardTitle>
          <CardDescription>对照乔姐现行制度列出的材料清单，仅作自检，不替代财务核对。</CardDescription>
        </CardHeader>
        <CardContent>
          {required.length === 0 ? (
            <p className="text-sm text-slate-500">当前类别暂无有效制度，请联系乔姐。</p>
          ) : (
            <ul className="space-y-2">
              {required.map((item) => {
                const matched = attachments.some((file) =>
                  item.split(/[\/]/).some((part) => file.name.includes(part.replace("出行凭证", "行程")))
                );
                return (
                  <li
                    key={item}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      matched ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"
                    )}
                  >
                    {item}
                    <span className="ml-2 text-xs">{matched ? "已上传对应文件" : "待补充"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
