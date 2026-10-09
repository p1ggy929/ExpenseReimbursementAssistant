import { STATUS_META } from "@/lib/constants";
import type { ReimbursementStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: ReimbursementStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
