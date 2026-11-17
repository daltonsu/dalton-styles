import { useState } from "react";
import { Button, Progress, Space, Table, Tooltip as AntTooltip } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { downloadText, type DemoProps } from "./shared";
import { usePreferences } from "../../app/Preferences";
export const chartData = [
  { name: "6 月", 客户: 36, 合作: 18, 潜在: 12 },
  { name: "7 月", 客户: 52, 合作: 24, 潜在: 18 },
  { name: "8 月", 客户: 45, 合作: 28, 潜在: 14 },
  { name: "9 月", 客户: 68, 合作: 35, 潜在: 20 },
  { name: "10 月", 客户: 62, 合作: 38, 潜在: 18 },
  { name: "11 月", 客户: 88, 合作: 46, 潜在: 25 },
];
export default function ChartDemo({ id, variant: v }: DemoProps) {
  const { preset, appearance } = usePreferences();
  const colors = preset.chartColors;
  const tooltipProps = {
    contentStyle: {
      borderRadius: 8,
      background: appearance.elevated,
      borderColor: appearance.border,
      color: appearance.text,
    },
    labelStyle: { color: appearance.text },
  };
  const [showTable, setShowTable] = useState(false);
  let responsive = true;
  const data =
    id === "funnel-chart"
      ? v === 0
        ? [
            { name: "访问", value: 100 },
            { name: "注册", value: 72 },
            { name: "咨询", value: 48 },
            { name: "合作", value: 24 },
          ]
        : [
            { name: "浏览", value: 100 },
            { name: "试用", value: 60 },
            { name: "激活", value: 42 },
            { name: "订阅", value: 18 },
          ]
      : chartData.map((d, i) => ({
          ...d,
          name: [
            "pie-chart",
            "donut-chart",
            "horizontal-chart",
            "radar-chart",
          ].includes(id)
            ? ["Jakarta", "Bandung", "Surabaya", "Bali", "Medan", "其他"][i]
            : d.name,
          value: v === 0 ? d.客户 : d.合作,
          fill: colors[i],
        }));
  const axes = (
    <>
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke={appearance.border}
      />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 11, fill: appearance.secondary }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: appearance.secondary }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip {...tooltipProps} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
    </>
  );
  let chart;
  switch (id) {
    case "line-chart":
      chart = (
        <LineChart data={chartData}>
          {axes}
          <Line
            type="monotone"
            dataKey="客户"
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          {v === 1 && (
            <Line
              type="monotone"
              dataKey="合作"
              stroke={colors[1]}
              strokeWidth={2}
            />
          )}
        </LineChart>
      );
      break;
    case "area-chart":
      chart = (
        <AreaChart data={chartData}>
          {axes}
          <Area
            type="monotone"
            dataKey="客户"
            fill={colors[0]}
            fillOpacity={0.2}
            stroke={colors[0]}
            strokeWidth={2}
          />
          {v === 1 && (
            <Area
              type="monotone"
              dataKey="合作"
              fill={colors[1]}
              fillOpacity={0.2}
              stroke={colors[1]}
              strokeWidth={2}
            />
          )}
        </AreaChart>
      );
      break;
    case "bar-chart":
    case "stacked-chart":
      chart = (
        <BarChart data={chartData} barGap={4}>
          {axes}
          {[
            "客户",
            ...(id === "stacked-chart" || v === 1 ? ["合作"] : []),
            ...(id === "stacked-chart" && v === 1 ? ["潜在"] : []),
          ].map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i]}
              stackId={id === "stacked-chart" ? "a" : undefined}
              radius={id === "stacked-chart" ? 0 : [3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      );
      break;
    case "horizontal-chart":
      chart = (
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 16, right: 24 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke={appearance.border}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: appearance.secondary }}
            stroke={appearance.border}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 11, fill: appearance.secondary }}
            stroke={appearance.border}
            width={70}
          />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="value" name="客户数量" radius={[0, 3, 3, 0]}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={v === 1 ? colors[i] : colors[1]} />
            ))}
          </Bar>
        </BarChart>
      );
      break;
    case "pie-chart":
    case "donut-chart":
      chart = (
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={id === "donut-chart" ? "50%" : 0}
            outerRadius="78%"
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip {...tooltipProps} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      );
      break;
    case "scatter-chart":
      chart = (
        <ScatterChart margin={{ right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="客户" type="number" name="客户规模" unit="人" />
          <YAxis dataKey="合作" type="number" name="合作金额" unit="万" />
          {v === 1 && <ZAxis dataKey="潜在" range={[80, 500]} />}
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="客户" data={chartData} fill={colors[0]} />
        </ScatterChart>
      );
      break;
    case "radar-chart":
      chart = (
        <RadarChart
          data={chartData.map((d, i) => ({
            ...d,
            name: ["沟通", "交付", "增长", "响应", "服务", "协作"][i],
          }))}
        >
          <PolarGrid stroke={appearance.border} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: appearance.secondary }}
          />
          <Radar
            name="团队 A"
            dataKey="客户"
            stroke={colors[1]}
            fill={colors[1]}
            fillOpacity={0.2}
          />
          {v === 1 && (
            <Radar
              name="团队 B"
              dataKey="合作"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.2}
            />
          )}
          <Tooltip {...tooltipProps} />
          <Legend />
        </RadarChart>
      );
      break;
    case "funnel-chart":
      chart = (
        <FunnelChart>
          <Tooltip {...tooltipProps} />
          <Funnel
            data={data.map((d, i) => ({ ...d, fill: colors[i] }))}
            dataKey="value"
            nameKey="name"
            isAnimationActive={false}
          >
            <LabelList
              position="center"
              dataKey="name"
              fill={appearance.onAccent}
            />
          </Funnel>
        </FunnelChart>
      );
      break;
    case "gauge-chart":
      responsive = false;
      chart = (
        <div className="gauge-demo">
          <Progress
            type="dashboard"
            percent={v === 0 ? 68 : 92}
            strokeColor={v === 0 ? colors[0] : colors[1]}
            size={200}
          />
          <p>本月目标完成率</p>
        </div>
      );
      break;
    case "heatmap-chart":
      responsive = false;
      chart = (
        <div
          className="heatmap"
          role="img"
          aria-label={v === 0 ? "团队周活跃热力图" : "时段咨询密度热力图"}
        >
          {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((x) => (
            <small key={x}>{x}</small>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const n = (i * 17 + (v + 1) * 23) % 100;
            return (
              <AntTooltip
                key={i}
                title={`${Math.floor(i / 7) + 1} ${v === 0 ? "组" : "时段"} · ${n} 次`}
              >
                <button
                  aria-label={`${Math.floor(i / 7) + 1}组${(i % 7) + 1}日 ${n}次`}
                  style={{
                    background: `color-mix(in srgb, ${preset.primary} ${10 + n * 0.9}%, ${appearance.surface})`,
                    color:
                      n > (preset.mode === "dark" ? 42 : 65)
                        ? appearance.onAccent
                        : appearance.text,
                  }}
                >
                  {n}
                </button>
              </AntTooltip>
            );
          })}
        </div>
      );
      break;
    default:
      throw new Error(`Unknown chart: ${id}`);
  }
  const tableRows: Record<string, string | number>[] =
    id === "gauge-chart"
      ? [{ name: "本月目标完成率", value: v === 0 ? 68 : 92 }]
      : id === "heatmap-chart"
        ? Array.from({ length: 35 }, (_, i) => ({
            name: `${Math.floor(i / 7) + 1}组 / 周${(i % 7) + 1}`,
            value: (i * 17 + (v + 1) * 23) % 100,
          }))
        : [
              "line-chart",
              "area-chart",
              "bar-chart",
              "stacked-chart",
              "scatter-chart",
              "radar-chart",
            ].includes(id)
          ? chartData.map((d, i) => ({
              name:
                id === "radar-chart"
                  ? ["沟通", "交付", "增长", "响应", "服务", "协作"][i]
                  : d.name,
              客户: d.客户,
              ...(v === 1 || id === "stacked-chart" || id === "scatter-chart"
                ? { 合作: d.合作 }
                : {}),
              ...((id === "stacked-chart" && v === 1) ||
              (id === "scatter-chart" && v === 1)
                ? { 潜在: d.潜在 }
                : {}),
            }))
          : data;
  const keys = Object.keys(tableRows[0]);
  return (
    <div className="chart-demo">
      <div
        style={{
          height: id === "heatmap-chart" ? "auto" : 260,
          width: "100%",
          minWidth: 0,
        }}
      >
        {responsive ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {chart}
          </ResponsiveContainer>
        ) : (
          chart
        )}
      </div>
      <Space size={8} style={{ marginTop: 14 }}>
        <Button
          size="small"
          type="text"
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "收起数据" : "查看数据"}
        </Button>
        <Button
          size="small"
          type="text"
          onClick={() =>
            downloadText(
              `${id}.csv`,
              "\ufeff" +
                [
                  keys
                    .map((k) =>
                      k === "name" ? "名称" : k === "value" ? "数值" : k,
                    )
                    .join(","),
                  ...tableRows.map((d) => keys.map((k) => d[k]).join(",")),
                ].join("\r\n"),
              "text/csv;charset=utf-8",
            )
          }
        >
          导出 CSV
        </Button>
      </Space>
      {showTable && (
        <Table
          size="small"
          rowKey="name"
          pagination={false}
          dataSource={tableRows}
          columns={keys.map((k) => ({
            title: k === "name" ? "名称" : k === "value" ? "数值" : k,
            dataIndex: k,
          }))}
        />
      )}
    </div>
  );
}
