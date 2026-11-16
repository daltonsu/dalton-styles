import { lazy, Suspense } from "react";
import { Spin } from "antd";
import manifest from "./manifest.json";
const General = lazy(() => import("./demos/GeneralDemos"));
const Inputs = lazy(() => import("./demos/InputDemos"));
const Display = lazy(() => import("./demos/DisplayDemos"));
const Feedback = lazy(() => import("./demos/FeedbackDemos"));
const Charts = lazy(() => import("./demos/ChartDemo"));
export function ComponentDemo({
  id,
  variant = 0,
}: {
  id: string;
  variant?: number;
}) {
  const component = manifest.find((x) => x.id === id);
  if (!component) throw new Error(`Unknown component ${id}`);
  const Renderer =
    component.group === "数据录入"
      ? Inputs
      : component.group === "数据展示"
        ? Display
        : component.group === "反馈"
          ? Feedback
          : component.group === "数据可视化"
            ? Charts
            : General;
  return (
    <Suspense fallback={<Spin />}>
      <div className="demo-surface">
        <Renderer id={id} variant={variant} />
      </div>
    </Suspense>
  );
}
