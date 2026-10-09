import type { AppStateData } from "./types";

export const seedState = (): AppStateData => ({
  currentUserId: "u-xiaolin",
  users: [
    { id: "u-xiaolin", name: "小林", role: "xiaolin", title: "普通员工" },
    { id: "u-jojie", name: "乔姐", role: "jojie", title: "行政专员" },
    { id: "u-zhoumin", name: "周敏", role: "zhoumin", title: "财务专员" },
    { id: "u-chengong", name: "陈工", role: "chengong", title: "FDE工程师" }
  ],
  policies: [
    {
      id: "p-office-materials",
      category: "office",
      title: "差旅报销材料总则",
      content:
        "员工报销差旅费用前，须一次性提交：1）合规发票（增值税普通发票或电子发票均可，抬头须为公司全称）；2）行程单或出行凭证（机票行程单、高铁票、网约车行程证明）；3）费用发生说明（事由、起止日期、同行人）。材料不齐不得进入财务复核。制度由行政专员乔姐维护，查询结果仅作指引，不替代原审批流程。",
      requiredMaterials: ["合规发票", "行程单/出行凭证", "费用发生说明"],
      status: "valid",
      updatedBy: "u-jojie",
      updatedAt: "2026-09-28T09:00:00.000Z"
    },
    {
      id: "p-transport",
      category: "transport",
      title: "交通费报销条款",
      content:
        "交通费报销须提供与行程日期一致的发票及行程单。机票需提供电子客票行程单；高铁需提供车票或铁路电子客票；市内交通单次超过 100 元须备注事由。出租车/网约车需提供行程明细。不得以个人消费小票替代运输凭证。",
      requiredMaterials: ["交通发票", "行程单或车票"],
      status: "valid",
      updatedBy: "u-jojie",
      updatedAt: "2026-09-28T09:10:00.000Z"
    },
    {
      id: "p-dining",
      category: "dining",
      title: "餐饮费报销条款",
      content:
        "差旅期间餐费按公司标准限额报销，须提供餐饮发票，发票内容应为餐饮服务。不得报销酒水、娱乐项目。若与交通/住宿合并开票，须在说明中拆分金额。招待餐另走招待流程，不适用本差旅条款。",
      requiredMaterials: ["餐饮发票", "餐费说明"],
      status: "valid",
      updatedBy: "u-jojie",
      updatedAt: "2026-09-28T09:20:00.000Z"
    },
    {
      id: "p-lodging",
      category: "lodging",
      title: "住宿费报销条款",
      content:
        "住宿须提供酒店发票及入住水单/订单。发票日期应覆盖出差期间，房型与职级标准相符。个人提前离店或超标部分由个人承担，不得并入报销。无发票的平台截图不能单独作为报销依据。",
      requiredMaterials: ["酒店发票", "入住订单或水单"],
      status: "valid",
      updatedBy: "u-jojie",
      updatedAt: "2026-09-28T09:30:00.000Z"
    }
  ],
  reimbursements: [],
  auditLogs: [
    {
      id: "log-seed",
      action: "system.seed",
      userId: "u-chengong",
      timestamp: "2026-10-08T08:00:00.000Z",
      detail: "陈工初始化 Demo：制度库已由乔姐发布，单据库为空，等待小林首次提交。"
    }
  ],
  mockFacts: [],
  knowledgeHits: []
});
