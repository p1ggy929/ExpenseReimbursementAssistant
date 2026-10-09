"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_META,
  NO_POLICY_MESSAGE,
  REVOKED_POLICY_MESSAGE,
  ROLE_META
} from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { KnowledgeAnswer } from "@/lib/knowledge";
import type { Policy, PolicyCategory, PolicyStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const CATEGORIES: PolicyCategory[] = ["transport", "dining", "lodging", "office"];

const EMPTY_FORM = {
  id: "",
  category: "office" as PolicyCategory,
  title: "",
  content: "",
  requiredMaterials: "合规发票, 行程单",
  status: "valid" as PolicyStatus
};

export default function KnowledgePage() {
  const policies = useAppStore((s) => s.policies);
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const askKnowledge = useAppStore((s) => s.askKnowledge);
  const upsertPolicy = useAppStore((s) => s.upsertPolicy);
  const setPolicyStatus = useAppStore((s) => s.setPolicyStatus);
  const user = users.find((item) => item.id === currentUserId)!;
  const isJojie = user.role === "jojie";

  const [query, setQuery] = useState("报销需要什么材料");
  const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: policies.filter((policy) => policy.category === category)
    }));
  }, [policies]);

  function handleAsk(nextQuery = query) {
    setLoading(true);
    window.setTimeout(() => {
      const result = askKnowledge(nextQuery);
      setAnswer(result);
      setLoading(false);
      if (result.hit) toast.success("已检索制度库", `命中 ${result.matchedIds.length} 条乔姐维护的条款`);
      else toast.info("未命中有效制度", NO_POLICY_MESSAGE);
    }, 280);
  }

  function openEditor(policy?: Policy) {
    if (!isJojie) {
      toast.error("无权维护制度", "制度仍由乔姐维护。");
      return;
    }
    if (policy) {
      setForm({
        id: policy.id,
        category: policy.category,
        title: policy.title,
        content: policy.content,
        requiredMaterials: policy.requiredMaterials.join(", "),
        status: policy.status
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setOpen(true);
  }

  function savePolicy() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("请完整填写制度标题与正文");
      return;
    }
    upsertPolicy({
      id: form.id || undefined,
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      requiredMaterials: form.requiredMaterials
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean),
      status: form.status
    });
    setOpen(false);
    toast.success(form.id ? "制度已更新" : "制度已新增", "小林再次查询时将引用最新条款。");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>制度助手</CardTitle>
          <CardDescription>
            答案必须来自乔姐维护的条款。未检索到时不会编造，将提示联系乔姐。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：报销需要什么材料"
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={() => handleAsk()} disabled={loading}>
              {loading ? "检索中…" : "提问"}
            </Button>
          </div>
          {answer && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">结论</p>
                <p className="mt-1 text-sm leading-6 text-slate-800">{answer.conclusion}</p>
              </section>
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">制度依据</p>
                {answer.evidence.length === 0 ? (
                  <p className="mt-1 text-sm text-slate-600">{NO_POLICY_MESSAGE}</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {answer.evidence.map((item) => (
                      <div key={item.policy.id} className="rounded-lg border bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{item.policy.title}</span>
                          <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                            {CATEGORY_META[item.policy.category].label}
                          </Badge>
                          {item.revoked ? (
                            <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                              {REVOKED_POLICY_MESSAGE}
                            </Badge>
                          ) : (
                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              有效 · 乔姐维护
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">下一步建议</p>
                <p className="mt-1 text-sm leading-6 text-slate-800">{answer.nextStep}</p>
              </section>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">分类制度</h3>
        {isJojie && (
          <Button size="sm" onClick={() => openEditor()}>
            新增制度
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle>{CATEGORY_META[group.category].label}</CardTitle>
              <CardDescription>{CATEGORY_META[group.category].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.length === 0 ? (
                <p className="text-sm text-slate-500">该分类暂无制度。</p>
              ) : (
                group.items.map((policy) => {
                  const editor = users.find((item) => item.id === policy.updatedBy);
                  return (
                    <div key={policy.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{policy.title}</p>
                        {policy.status === "valid" ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">有效</Badge>
                        ) : (
                          <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                            {REVOKED_POLICY_MESSAGE}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{policy.content}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        材料要求：{policy.requiredMaterials.join("、") || "未列出"} · 更新于{" "}
                        {formatDateTime(policy.updatedAt)} · {editor?.name ?? "乔姐"}
                      </p>
                      {isJojie && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditor(policy)}>
                            编辑
                          </Button>
                          {policy.status === "valid" ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setPolicyStatus(policy.id, "revoked");
                                toast.info("制度已撤回", "小林查询时将明确提示该制度已失效。");
                              }}
                            >
                              撤回
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setPolicyStatus(policy.id, "valid");
                                toast.success("制度已发布");
                              }}
                            >
                              发布
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isJojie && (
        <p className="text-xs text-slate-400">
          当前角色为{ROLE_META[user.role].label}，制度维护入口仅对乔姐开放。
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "编辑制度" : "新增制度"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>分类</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PolicyCategory })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_META[category].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>标题</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>条款正文</Label>
              <Textarea
                className="mt-1"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div>
              <Label>材料要求（逗号分隔）</Label>
              <Input
                className="mt-1"
                value={form.requiredMaterials}
                onChange={(e) => setForm({ ...form, requiredMaterials: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={savePolicy}>
              保存并同步到知识库
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
