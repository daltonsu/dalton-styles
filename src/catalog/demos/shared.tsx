import { useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import type { ReactNode } from "react";
export interface DemoProps {
  id: string;
  variant: number;
}
export const cities = ["Jakarta", "Bandung", "Surabaya", "Bali", "Medan"];
export const options = cities.map((value) => ({ value, label: value }));
export const treeData = [
  {
    title: "Indonesia",
    value: "id",
    key: "id",
    children: [
      {
        title: "Java",
        value: "java",
        key: "java",
        children: cities
          .slice(0, 3)
          .map((value) => ({ title: value, value, key: value })),
      },
      {
        title: "Sumatra",
        value: "sumatra",
        key: "sumatra",
        children: [{ title: "Medan", value: "Medan", key: "Medan" }],
      },
    ],
  },
];
export const menuItems = [
  { key: "overview", label: "经营概览" },
  {
    key: "customers",
    label: "客户管理",
    children: [
      { key: "all", label: "全部客户" },
      { key: "new", label: "新建客户" },
    ],
  },
  { key: "settings", label: "项目设置" },
  { key: "disabled", label: "即将开放", disabled: true },
];
export const rows = [
  { key: "1", name: "Sagara Retail", amount: 420, status: "合作中" },
  { key: "2", name: "Bumi Foods", amount: 260, status: "待联系" },
  { key: "3", name: "Kopi Nusantara", amount: 680, status: "合作中" },
];
export const landscape = (warm = false) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="${warm ? "#f4e6db" : "#eaf0e3"}"/><circle cx="490" cy="84" r="35" fill="#d7b376"/><path d="M0 270Q120 35 290 210T640 150V320H0" fill="${warm ? "#b86b50" : "#678363"}"/><path d="M0 320Q160 120 400 270T640 230V320H0" fill="${warm ? "#8e4d38" : "#203c33"}"/></svg>`,
  );
export function Output({ children }: { children: ReactNode }) {
  return (
    <div className="demo-output" role="status">
      {children}
    </div>
  );
}
export function EllipsisText({ text }: { text: string }) {
  const [clipped, setClipped] = useState(false);
  return (
    <Tooltip title={clipped ? text : undefined}>
      <span
        className="ellipsis"
        tabIndex={clipped ? 0 : undefined}
        ref={(el) => {
          if (el) setClipped(el.scrollWidth > el.clientWidth);
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
}
export function AsyncButton() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <Button type="primary" loading={loading} onClick={() => setLoading(true)}>
      {loading ? "保存中" : "体验加载"}
    </Button>
  );
}
export function downloadText(
  name: string,
  content: string,
  mime = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
