# 青禾报销助手（Demo）

可运行的差旅报销信息助手演示：员工自助查询乔姐维护的有效制度，经授权查询本人单据状态。财务专员周敏核对业务事实并回写进度。系统**不自动审批、不付款**。

真实登录与财务系统对接在正式试点前另行完成。本 Demo 全部使用前端 Mock + `localStorage`。

## 项目结构

```
app/                  # Next.js 14 App Router 页面
  page.tsx            # 工作台
  knowledge/page.tsx  # 知识库（查询 + 乔姐维护）
  submit/page.tsx     # 材料提交 / 材料检查
  query/page.tsx      # 本人单据进度查询
  finance/page.tsx    # 周敏财务核对台
  audit/page.tsx      # 陈工系统与审计
components/           # 布局与 shadcn 风格 UI
lib/                  # 类型、Mock、Zustand、制度检索
```

## 依赖安装

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

复制 `.env.example` 为 `.env.local`（可选）。Demo **无需 API Key、无需后端**。

```
NEXT_PUBLIC_APP_NAME=青禾报销助手
NEXT_PUBLIC_DEMO_MODE=true
```

## 演示步骤

1. 默认角色为小林。打开「知识库」，提问「报销需要什么材料」，查看：结论 → 制度依据 → 下一步建议。
2. 进入「材料提交」，上传任意文件（文件名含「发票」「行程单」更佳），提交后获得 `R-0001`。
3. 「进度查询」输入 `R-0001`，应通过本人校验并显示「已提交」。
4. 切换到乔姐或周敏，再次查询 `R-0001`，应提示无权访问。
5. 切换到周敏，在「财务核对台」将 `R-0001` 更新为「材料审核中」或「财务复核中」。切回小林查询，进度已同步。
6. 切换到乔姐，编辑或撤回制度后，小林再次提问，答案随之变化；撤回条款会提示「该制度已失效」。
7. 切换到陈工，查看命中率、对接示意图与审计日志。使用顶栏「重置演示数据」可反复演示。
