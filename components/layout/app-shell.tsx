"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Search,
  Shield,
  Upload
} from "lucide-react";
import { APP_NAME, ROLE_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DemoWatermark } from "./demo-watermark";
import { RoleSwitcher } from "./role-switcher";
import { Toaster } from "@/components/ui/toaster";

const NAV = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/knowledge", label: "知识库", icon: BookOpen },
  { href: "/submit", label: "材料提交", icon: Upload },
  { href: "/query", label: "进度查询", icon: Search },
  { href: "/finance", label: "财务核对台", icon: ClipboardCheck },
  { href: "/audit", label: "系统与审计", icon: Shield }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useAppStore((state) => state.hydrated);
  const setHydrated = useAppStore((state) => state.setHydrated);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const users = useAppStore((state) => state.users);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const user = users.find((item) => item.id === currentUserId) ?? users[0];
  const meta = ROLE_META[user.role];

  useEffect(() => {
    const finish = () => setHydrated(true);
    const persistApi = useAppStore.persist;
    if (persistApi.hasHydrated()) {
      finish();
      return;
    }
    const unsub = persistApi.onFinishHydration(finish);
    return unsub;
  }, [setHydrated]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <DemoWatermark />
      <Toaster />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 bg-white pt-6 md:block">
        <div className="px-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-700">Qinghe</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{APP_NAME}</h1>
          <p className="mt-1 text-xs text-slate-500">信息检索 · 状态查询 · 不审批不付款</p>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-blue-50 font-medium text-blue-800"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs", meta.badgeClass)}>
                  当前角色 · {user.name}
                </span>
                <span className="text-xs text-slate-400">{user.title}</span>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">{meta.duty}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <RoleSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetDemo();
                  toast.success("演示数据已重置", "制度恢复为乔姐发布的初始版本，单据库已清空。");
                }}
              >
                重置演示数据
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 lg:px-8">
          {!hydrated ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              正在加载本地演示数据…
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
