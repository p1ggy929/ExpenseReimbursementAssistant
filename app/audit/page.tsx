"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

const SYSTEMS = [
  {
    name: "制度库",
    owner: "乔姐维护",
    note: "Demo 使用 localStorage Mock。正式试点前对接制度主数据。"
  },
  {
    name: "单据状态库",
    owner: "周敏核对后回写",
    note: "只读展示 + 授权查询。不写入审批引擎，不触发付款。"
  },
  {
    name: "登录授权",
    owner: "陈工预留",
    note: "Demo 以角色切换模拟身份。真实 SSO/登录在正式试点前另行完成。"
  }
];

export default function AuditPage() {
  const knowledgeHits = useAppStore((s) => s.knowledgeHits);
  const auditLogs = useAppStore((s) => s.auditLogs);
  const policies = useAppStore((s) => s.policies);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const user = users.find((item) => item.id === currentUserId)!;
  const hitCount = knowledgeHits.filter((item) => item.hit).length;
  const rate = knowledgeHits.length ? Math.round((hitCount / knowledgeHits.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {user.role !== "chengong" && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          系统与审计主要为陈工交付视角。当前角色 {ROLE_META[user.role].label} 可只读查看 Demo 运行情况。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>知识库命中率</CardTitle>
            <CardDescription>基于本机 Mock 查询记录</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-800">{knowledgeHits.length ? `${rate}%` : "—"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {hitCount} 次命中 / {knowledgeHits.length} 次提问
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>有效制度</CardTitle>
            <CardDescription>乔姐已发布条款</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{policies.filter((p) => p.status === "valid").length}</p>
            <p className="mt-1 text-sm text-slate-500">撤回 {policies.filter((p) => p.status === "revoked").length} 条</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>安全边界</CardTitle>
            <CardDescription>助手能力上限</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-slate-600">
            不自动审批、不付款。仅信息检索与本人单据状态查询。
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>接口对接示意图</CardTitle>
          <CardDescription>Demo 阶段全部为前端 Mock，虚线表示正式试点前对接。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {SYSTEMS.map((item) => (
              <div key={item.name} className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <p className="text-sm font-semibold text-blue-900">{item.name}</p>
                <p className="mt-1 text-xs text-blue-700">{item.owner}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border bg-slate-900 p-4 text-xs text-slate-100">
            <pre>{`员工小林 ──查询──▶ 青禾助手 ──读──▶ 制度库(乔姐维护)
                └─授权查询本人单据──▶ 单据状态库(周敏核对回写)
陈工 ──观测──▶ 审计日志 / 命中率 / 边界声明
[未接通] 登录授权 SSO    [禁止] 自动审批引擎    [禁止] 付款网关`}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近提问命中</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {knowledgeHits.length === 0 ? (
              <p className="text-sm text-slate-500">尚无查询。请以小林身份提问「报销需要什么材料」。</p>
            ) : (
              knowledgeHits.slice(0, 8).map((hit, index) => (
                <div key={`${hit.at}-${index}`} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{hit.query}</p>
                  <p className="text-xs text-slate-500">
                    {hit.hit ? `命中 ${hit.policyIds.length} 条` : "未命中"} · {formatDateTime(hit.at)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>运行日志</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-2 overflow-auto">
            {auditLogs.map((log) => {
              const actor = users.find((item) => item.id === log.userId);
              return (
                <div key={log.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-slate-600">{log.detail}</p>
                  <p className="text-xs text-slate-400">
                    {actor?.name} · {formatDateTime(log.timestamp)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
