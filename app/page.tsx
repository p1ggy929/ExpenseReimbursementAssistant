"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ROLE_META, STATUS_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

const SHORTCUTS = [
  {
    href: "/knowledge",
    title: "查制度",
    desc: "自助检索乔姐维护的现行差旅制度与材料要求",
    icon: BookOpen
  },
  {
    href: "/query",
    title: "查进度",
    desc: "凭单号查询本人单据审批到哪一步（须先授权校验）",
    icon: Search
  },
  {
    href: "/submit",
    title: "材料检查",
    desc: "对照制度上传发票与行程单，获取报销单号",
    icon: ClipboardCheck
  }
];

export default function HomePage() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const reimbursements = useAppStore((s) => s.reimbursements);
  const policies = useAppStore((s) => s.policies);
  const user = users.find((item) => item.id === currentUserId)!;
  const meta = ROLE_META[user.role];
  const events = reimbursements
    .flatMap((item) =>
      item.timeline.map((event) => ({
        ...event,
        reimbursementId: item.id,
        statusNow: item.status
      }))
    )
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-card">
        <p className="text-sm text-blue-700">工作台</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">你好，{user.name}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          你当前是<span className="font-medium"> {user.title} </span>
          。{meta.duty}。助手只回答乔姐已发布的制度，只展示周敏回写的进度，
          <span className="font-medium"> 不自动审批、不付款</span>。
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            有效制度 {policies.filter((p) => p.status === "valid").length} 条
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            单据 {reimbursements.length} 笔
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Demo 本地 Mock</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-blue-200">
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>报销单流转轨迹</CardTitle>
          <CardDescription>
            时间线仅同步展示原业务流程的进度事实，由周敏核对后回写。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              暂无单据流转。请以小林身份在「材料提交」上传发票与行程单，将生成 R-0001。
            </div>
          ) : (
            <ol className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{event.reimbursementId}</span>
                      <StatusBadge status={event.status === "created" ? "submitted" : event.status} />
                      {event.status !== "created" && event.status !== event.statusNow && (
                        <span className="text-xs text-slate-400">
                          当前：{STATUS_META[event.statusNow].label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{event.label}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(event.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
