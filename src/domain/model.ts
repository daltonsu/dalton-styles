import seed from "./seed.json";
export type Customer = (typeof seed.customers)[number];
export type Deal = (typeof seed.deals)[number];
export const demoDate = "2026-11-16";
export const statuses: Record<string, { label: string; color: string }> = {
  active: { label: "合作中", color: "success" },
  negotiating: { label: "洽谈中", color: "warning" },
  potential: { label: "待跟进", color: "processing" },
  archived: { label: "已归档", color: "default" },
};
export const owners = [
  { id: "maya", name: "Maya Putri", initials: "MP" },
  { id: "rizky", name: "Rizky Aditya", initials: "RA" },
  { id: "sarah", name: "Sarah Wijaya", initials: "SW" },
];
export const cities = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Bali",
  "Yogyakarta",
  "Medan",
];
export const sources = ["合作伙伴", "官网咨询", "线下活动", "主动拓客"];
export const stages = ["初步接洽", "需求确认", "方案报价", "赢单"];
export const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export const shortMoney = (n: number) =>
  n >= 1e9
    ? `${(n / 1e9).toFixed(2)}B`
    : n >= 1e6
      ? `${(n / 1e6).toFixed(1)}M`
      : String(n);
export const initialCustomers = () =>
  structuredClone(seed.customers).map((c, i) => ({
    ...c,
    followup: `2026-11-${String(12 + (i % 14)).padStart(2, "0")}`,
  }));
export const initialDeals = () => structuredClone(seed.deals);
export interface Filters {
  search: string;
  status: string;
  city: string;
  owner: string;
  source: string;
  min?: number;
  max?: number;
  from?: string;
  to?: string;
}
export const emptyFilters: Filters = {
  search: "",
  status: "",
  city: "",
  owner: "",
  source: "",
};
export function filterCustomers(rows: Customer[], f: Filters) {
  const search = f.search.trim().toLowerCase();
  return rows.filter(
    (c) =>
      (!search ||
        [c.name, c.contact, c.email].some((s) =>
          s.toLowerCase().includes(search),
        )) &&
      (!f.status || c.status === f.status) &&
      (!f.city || c.city === f.city) &&
      (!f.owner || c.owner === f.owner) &&
      (!f.source || c.source === f.source) &&
      (f.min === undefined || c.amount >= f.min) &&
      (f.max === undefined || c.amount <= f.max) &&
      (!f.from || c.followup >= f.from) &&
      (!f.to || c.followup <= f.to),
  );
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function customersCsv(rows: Customer[]) {
  return (
    "\ufeff" +
    [
      [
        "客户编号",
        "客户名称",
        "联系人",
        "邮箱",
        "城市",
        "状态",
        "金额_IDR",
        "负责人",
        "下次跟进",
      ],
      ...rows.map((c) => [
        c.id,
        c.name,
        c.contact,
        c.email,
        c.city,
        statuses[c.status]?.label ?? c.status,
        c.amount,
        owners.find((o) => o.id === c.owner)?.name ?? c.owner,
        c.followup,
      ]),
    ]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n")
  );
}
export interface DataState {
  customers: Customer[];
  deals: Deal[];
  density: "standard" | "compact";
  columns: string[];
}
export const initialState = (): DataState => ({
  customers: initialCustomers(),
  deals: initialDeals(),
  density: "standard",
  columns: ["contact", "amount", "owner", "followup"],
});
function validDate(value: unknown) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}
export function validState(data: unknown): data is DataState {
  if (!data || typeof data !== "object") return false;
  const d = data as DataState;
  return (
    Array.isArray(d.customers) &&
    d.customers.length <= 500 &&
    new Set(d.customers.map((c) => c?.id)).size === d.customers.length &&
    d.customers.every(
      (c) =>
        c &&
        [
          "id",
          "name",
          "contact",
          "email",
          "phone",
          "city",
          "industry",
          "source",
          "notes",
        ].every((k) => typeof c[k as keyof Customer] === "string") &&
        !!statuses[c.status] &&
        owners.some((o) => o.id === c.owner) &&
        Number.isSafeInteger(c.amount) &&
        c.amount >= 0 &&
        validDate(c.followup) &&
        validDate(c.created) &&
        Array.isArray(c.events) &&
        c.events.every(
          (e) => e && typeof e.text === "string" && validDate(e.date),
        ),
    ) &&
    Array.isArray(d.deals) &&
    d.deals.length <= 500 &&
    new Set(d.deals.map((x) => x?.id)).size === d.deals.length &&
    d.deals.every(
      (x) =>
        x &&
        ["id", "name", "company", "owner"].every(
          (k) => typeof x[k as keyof Deal] === "string",
        ) &&
        owners.some((o) => o.id === x.owner) &&
        Number.isSafeInteger(x.amount) &&
        x.amount >= 0 &&
        Number.isInteger(x.stage) &&
        x.stage >= 0 &&
        x.stage < 4,
    ) &&
    ["standard", "compact"].includes(d.density) &&
    Array.isArray(d.columns) &&
    d.columns.every((x) =>
      ["contact", "amount", "owner", "followup", "city"].includes(x),
    )
  );
}
