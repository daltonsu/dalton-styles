import {
  TeamOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { demoDate, shortMoney } from "../domain/model";
import { useWorkspace } from "../domain/Store";
export function Metrics() {
  const { data } = useWorkspace();
  const rows = data.customers;
  const active = rows.filter((c) => c.status === "active").length;
  const total = rows
    .filter((c) => c.status !== "archived")
    .reduce((s, c) => s + c.amount, 0);
  const overdue = rows.filter(
    (c) => c.status !== "archived" && c.followup <= demoDate,
  ).length;
  return (
    <section className="metrics-grid" aria-label="客户数据概览">
      {[
        {
          label: "客户总数",
          value: String(rows.length),
          note: `覆盖 ${new Set(rows.map((c) => c.city)).size} 个城市`,
          icon: <TeamOutlined aria-hidden="true" />,
        },
        {
          label: "合作客户",
          value: String(active),
          note: `合作率 ${rows.length ? Math.round((active / rows.length) * 100) : 0}%`,
          icon: <CheckCircleOutlined aria-hidden="true" />,
        },
        {
          label: "预计合作金额",
          value: shortMoney(total),
          note: "未归档金额合计 · IDR",
          icon: <WalletOutlined aria-hidden="true" />,
          unit: "Rp",
        },
        {
          label: "待处理跟进",
          value: String(overdue),
          note: "到期与逾期客户",
          icon: <ClockCircleOutlined aria-hidden="true" />,
        },
      ].map((m, i) => (
        <article className="metric-card" key={m.label}>
          <div>
            <span>{m.label}</span>
            {m.icon}
          </div>
          <strong>
            {m.unit && <small>{m.unit}</small>}
            {m.value}
          </strong>
          <p>
            {i === 0 && <span className="metric-dot" />}
            {m.note}
          </p>
          {i < 2 && (
            <svg
              className="metric-spark"
              viewBox="0 0 80 30"
              aria-hidden="true"
            >
              <path
                d="M0 28 12 20 24 23 35 15 47 17 59 8 70 12 80 2"
                fill="none"
                stroke={i ? "#b66a4d" : "#54765a"}
                strokeWidth="1.5"
              />
            </svg>
          )}
        </article>
      ))}
    </section>
  );
}
