export function DemoWatermark() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -rotate-12 text-5xl font-black tracking-[0.4em] text-slate-400/20 md:text-7xl">
          Demo演示
        </div>
        <div className="absolute bottom-24 right-8 rotate-[-18deg] text-4xl font-black tracking-[0.3em] text-slate-400/15">
          Demo演示
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[70] border-t border-amber-200 bg-amber-50/95 px-4 py-2 text-center text-xs text-amber-900">
        Demo演示 · 本系统仅提供信息检索与状态查询，不自动审批、不付款。真实登录与财务系统对接在正式试点前另行完成。
      </div>
    </>
  );
}
