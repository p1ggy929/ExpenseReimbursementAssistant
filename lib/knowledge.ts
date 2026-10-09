import {
  NO_POLICY_MESSAGE,
  REVOKED_POLICY_MESSAGE,
  CATEGORY_META
} from "./constants";
import type { Policy } from "./types";

const STOP_WORDS = new Set([
  "的",
  "了",
  "吗",
  "呢",
  "啊",
  "请",
  "一下",
  "什么",
  "哪些",
  "怎么",
  "如何",
  "需要"
]);

export interface KnowledgeAnswer {
  conclusion: string;
  evidence: {
    policy: Policy;
    excerpt: string;
    revoked: boolean;
  }[];
  nextStep: string;
  hit: boolean;
  matchedIds: string[];
}

function tokenize(query: string) {
  return query
    .toLowerCase()
    .replace(/[，。？?！、,.；;:：]/g, " ")
    .split(/\s+/)
    .flatMap((part) => part.split(/(?=[报销制度材料发票行程单交通餐饮住宿办公差旅])/))
    .map((t) => t.trim())
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

function scorePolicy(query: string, policy: Policy) {
  const q = query.toLowerCase();
  const hay = `${policy.title} ${policy.content} ${policy.requiredMaterials.join(" ")} ${CATEGORY_META[policy.category].label}`.toLowerCase();
  let score = 0;

  if (/材料|发票|行程|交什么|准备什么|要什么/.test(q) && policy.requiredMaterials.length) {
    score += 8;
  }
  if (q.includes("交通") && policy.category === "transport") score += 6;
  if (q.includes("餐") && policy.category === "dining") score += 6;
  if (q.includes("住") || q.includes("酒店") || q.includes("住宿")) {
    if (policy.category === "lodging") score += 6;
  }
  if (q.includes("办公") && policy.category === "office") score += 4;
  if (q.includes("报销") && policy.title.includes("报销")) score += 3;
  if (q.includes("制度") || q.includes("条款")) score += 2;

  for (const token of tokenize(query)) {
    if (token.length >= 2 && hay.includes(token)) score += 2;
  }
  if (policy.id === "p-office-materials" && /材料/.test(q)) score += 4;
  if (policy.status === "revoked") score -= 1;
  return score;
}

export function searchPolicies(query: string, policies: Policy[]): KnowledgeAnswer {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      conclusion: "请输入问题，例如「报销需要什么材料」。",
      evidence: [],
      nextStep: "可从交通、餐饮、住宿、办公分类浏览乔姐维护的现行制度。",
      hit: false,
      matchedIds: []
    };
  }

  const ranked = policies
    .map((policy) => ({ policy, score: scorePolicy(trimmed, policy) }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (!ranked.length) {
    return {
      conclusion: NO_POLICY_MESSAGE,
      evidence: [],
      nextStep: "请联系行政专员乔姐确认现行制度后再操作，切勿凭经验提交。",
      hit: false,
      matchedIds: []
    };
  }

  const validHits = ranked.filter((item) => item.policy.status === "valid");
  const revokedHits = ranked.filter((item) => item.policy.status === "revoked");

  if (!validHits.length) {
    return {
      conclusion: `${REVOKED_POLICY_MESSAGE}。匹配到的条款均已由乔姐撤回，不能作为报销依据。`,
      evidence: revokedHits.map((item) => ({
        policy: item.policy,
        excerpt: item.policy.content.slice(0, 120),
        revoked: true
      })),
      nextStep: "请等待乔姐重新发布有效制度，或直接联系乔姐确认。",
      hit: true,
      matchedIds: revokedHits.map((item) => item.policy.id)
    };
  }

  const materials = Array.from(
    new Set(validHits.flatMap((item) => item.policy.requiredMaterials))
  );

  return {
    conclusion:
      materials.length > 0
        ? `根据乔姐维护的现行制度，报销通常需要提交：${materials.join("、")}。以下结论仅引用有效条款，不构成自动审批。`
        : "已检索到相关现行制度，请阅读下列依据后再准备材料。",
    evidence: [
      ...validHits.map((item) => ({
        policy: item.policy,
        excerpt: item.policy.content,
        revoked: false
      })),
      ...revokedHits.map((item) => ({
        policy: item.policy,
        excerpt: item.policy.content,
        revoked: true
      }))
    ],
    nextStep:
      "请在「材料提交」页上传发票与行程单。系统仅生成单号并供查询进度，审批与付款仍在原财务流程中由周敏核对。",
    hit: true,
    matchedIds: ranked.map((item) => item.policy.id)
  };
}
