import {
  Avatar,
  Button,
  Card,
  Progress,
  Segmented,
  Tag,
  App,
  Empty,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useWorkspace } from "../domain/Store";
import { demoDate, sources, stages, statuses, money } from "../domain/model";
import { Metrics } from "../components/Metrics";
import { usePreferences } from "../app/Preferences";
import { formatDate } from "../domain/date";
export default function Overview() {
  const {
    preset,
    appearance,
    preferences: { dateFormat },
  } = usePreferences();
  const colors = preset.chartColors;
  const { data, setData } = useWorkspace();
  const { message } = App.useApp();
  const [range, setRange] = useState("6 个月");
  const chart = [6, 7, 8, 9, 10, 11]
    .slice(range === "3 个月" ? 3 : 0)
    .map((m) => ({
      name: `${m} 月`,
      新增客户: data.customers.filter(
        (c) => Number(c.created.slice(5, 7)) === m,
      ).length,
      合作客户: data.customers.filter(
        (c) => Number(c.created.slice(5, 7)) === m && c.status === "active",
      ).length,
    }));
  const due = data.customers
    .filter((c) => c.followup <= demoDate && c.status !== "archived")
    .sort((a, b) => a.followup.localeCompare(b.followup));
  const follow = (id: string) => {
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              followup: dayjs(demoDate).add(7, "day").format("YYYY-MM-DD"),
              events: [
                ...c.events,
                { date: demoDate, text: "已完成跟进，下次联系安排在 7 天后。" },
              ],
            }
          : c,
      ),
    }));
    message.success("已记录跟进，下次联系安排在 7 天后");
  };
  return (
    <>
      <Metrics />
      <div className="overview-grid">
        <Card
          title="客户增长"
          extra={
            <Segmented
              size="small"
              options={["3 个月", "6 个月"]}
              value={range}
              onChange={setRange}
            />
          }
        >
          <p className="card-note">按建档月份统计</p>
          <div style={{ height: 260, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chart} barGap={5}>
                <CartesianGrid
                  vertical={false}
                  stroke={appearance.border}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: appearance.secondary }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: appearance.secondary }}
                  width={25}
                />
                <Tooltip
                  cursor={{ fill: appearance.subtle }}
                  contentStyle={{
                    borderRadius: 8,
                    background: appearance.elevated,
                    color: appearance.text,
                    borderColor: appearance.border,
                  }}
                  labelStyle={{ color: appearance.text }}
                />
                <Bar
                  dataKey="新增客户"
                  fill={colors[0]}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="合作客户"
                  fill={colors[1]}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-key">
            <span>
              <i style={{ background: colors[0] }} />
              新增客户
            </span>
            <span>
              <i style={{ background: colors[1] }} />
              其中当前合作
            </span>
          </div>
        </Card>
        <Card
          title="客户来源"
          extra={
            <span className="card-note">{data.customers.length} 位客户</span>
          }
        >
          <div className="source-bars">
            {sources.map((s, i) => {
              const count = data.customers.filter((c) => c.source === s).length;
              const percent = data.customers.length
                ? Math.round((count / data.customers.length) * 100)
                : 0;
              return (
                <div key={s}>
                  <div>
                    <span>{s}</span>
                    <small>
                      {count} 位 · {percent}%
                    </small>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={colors[i]}
                    size="small"
                  />
                </div>
              );
            })}
          </div>
          <p className="card-note source-foot">每个来源，都是一次新的连接。</p>
        </Card>
        <Card
          title="需要你的一点关注"
          extra={
            <Link className="card-link" to="/examples/customers">
              查看客户 <ArrowRightOutlined aria-hidden="true" />
            </Link>
          }
        >
          <p className="card-note">到期与逾期跟进 · 共 {due.length} 项</p>
          {due.length ? (
            due.slice(0, 4).map((c) => (
              <div className="followup-row" key={c.id}>
                <Avatar shape="square" className="theme-avatar">
                  {c.name.slice(0, 1)}
                </Avatar>
                <div>
                  <Link to={`/examples/customers?detail=${c.id}`}>
                    {c.name}
                  </Link>
                  <small>
                    联系 {c.contact} · {formatDate(c.followup, dateFormat)}
                  </small>
                </div>
                <Button size="small" onClick={() => follow(c.id)}>
                  完成跟进
                </Button>
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="所有跟进已处理"
            />
          )}
        </Card>
        <Card
          title="商机进展"
          extra={
            <Link className="card-link" to="/examples/pipeline">
              查看看板 <ArrowRightOutlined aria-hidden="true" />
            </Link>
          }
        >
          <div className="source-bars">
            {stages.map((s, i) => {
              const group = data.deals.filter((d) => d.stage === i);
              return (
                <div key={s}>
                  <div>
                    <span>
                      {s} <Tag>{group.length}</Tag>
                    </span>
                    <small>
                      {money(group.reduce((n, d) => n + d.amount, 0))}
                    </small>
                  </div>
                  <Progress
                    percent={
                      data.deals.length
                        ? (group.length / data.deals.length) * 100
                        : 0
                    }
                    strokeColor={colors[i]}
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
