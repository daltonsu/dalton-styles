export const dateFormats = ["YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY"] as const;
export type DateFormat = (typeof dateFormats)[number];
export const weekStarts = [0, 1, 2, 3, 4, 5, 6] as const;
export type WeekStart = (typeof weekStarts)[number];
export const weekStartOptions = [1, 0] as const satisfies readonly WeekStart[];
export const weekdays = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六",
] as const;

export function formatDate(iso: string, format: DateFormat) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (format === "YYYY/MM/DD") return `${year}/${month}/${day}`;
  if (format === "MM/DD/YYYY") return `${month}/${day}/${year}`;
  return `${day}/${month}/${year}`;
}

export function parseDate(input: string, format: DateFormat) {
  if (!input.trim()) return "";
  const fields = input.trim().split("/");
  if (fields.length !== 3) return null;
  const [first, second, third] = fields;
  const iso =
    format === "YYYY/MM/DD"
      ? `${first}-${second}-${third}`
      : format === "MM/DD/YYYY"
        ? `${third}-${first}-${second}`
        : `${third}-${second}-${first}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso < "0001-01-01") return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === iso
    ? iso
    : null;
}
