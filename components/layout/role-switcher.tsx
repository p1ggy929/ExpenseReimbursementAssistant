"use client";

import { ROLE_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const users = useAppStore((state) => state.users);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const switchRole = useAppStore((state) => state.switchRole);

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((user) => {
        const meta = ROLE_META[user.role];
        const active = user.id === currentUserId;
        return (
          <button
            key={user.id}
            type="button"
            onClick={() => {
              switchRole(user.id);
              toast.info(`已切换为${user.name}`, meta.duty);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              active ? meta.badgeClass : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {user.name} · {user.title}
          </button>
        );
      })}
    </div>
  );
}
