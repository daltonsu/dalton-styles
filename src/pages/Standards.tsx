import { App, Button, Card, Table } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { theme } from "../app/theme";
import { downloadText } from "../catalog/demos/shared";
const swatches = [
  ["品牌主色", "#b64c32", "主要操作与强调"],
  ["森林绿", "#203c33", "导航与结构"],
  ["暖白", "#f6f5f1", "页面背景"],
  ["主文字", "#25352f", "正文与标题"],
  ["次文字", "#617069", "辅助信息"],
  ["成功", "#2c6a4b", "完成与合作"],
  ["警告", "#91600e", "待处理状态"],
  ["危险", "#b43c3c", "失败与删除"],
];
export default function Standards() {
  const { message } = App.useApp();
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">FOUNDATIONS</span>
          <h1>
            设计规范 <small>Foundations</small>
          </h1>
          <p>组件与页面共用的视觉语言。</p>
        </div>
        <Button
          icon={<DownloadOutlined aria-hidden="true" />}
          onClick={() =>
            downloadText(
              "dalton-theme.json",
              JSON.stringify(theme, null, 2),
              "application/json",
            )
          }
        >
          导出主题
        </Button>
      </div>
      <h2 className="section-title">色彩</h2>
      <div className="palette-grid">
        {swatches.map(([name, color, usage]) => (
          <button
            className="palette-card"
            key={color}
            onClick={() =>
              navigator.clipboard
                .writeText(color)
                .then(() => message.success(`已复制 ${color}`))
                .catch(() => message.error("无法访问剪贴板，请手动复制色值"))
            }
          >
            <span style={{ background: color }} />
            <strong>
              {name}
              <small>{color.toUpperCase()}</small>
            </strong>
            <p>{usage}</p>
          </button>
        ))}
      </div>
      <div className="standards-grid">
        <Card title="文字层级">
          {[
            [24, "页面标题"],
            [20, "区块标题"],
            [16, "内容标题"],
            [14, "正文与操作"],
            [12, "辅助说明"],
          ].map(([size, label]) => (
            <div className="type-row" key={size}>
              <span style={{ fontSize: Number(size) }}>{label}</span>
              <small>{size}px</small>
            </div>
          ))}
        </Card>
        <Card title="尺寸与间距">
          <div className="measurement-grid">
            {[
              [32, "默认控件"],
              [24, "小号控件"],
              [40, "大号控件"],
              [6, "控件圆角"],
              [10, "卡片圆角"],
              [24, "页面间距"],
            ].map(([n, label]) => (
              <div key={label}>
                <strong>
                  {n}
                  <small>px</small>
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 24 }}>
            间距采用 4px 网格；表格内容保持 14px。
          </p>
        </Card>
      </div>
      <h2 className="section-title">交互约定</h2>
      <Table
        pagination={false}
        rowKey="name"
        columns={[
          { title: "场景", dataIndex: "name" },
          { title: "约定", dataIndex: "rule" },
        ]}
        dataSource={[
          {
            name: "表单",
            rule: "字段就近校验，失败保留输入；修改后关闭时提醒。",
          },
          {
            name: "危险操作",
            rule: "说明对象和后果；确认按钮使用明确的动作名称。",
          },
          {
            name: "列表",
            rule: "搜索与筛选回到第一页；空数据与无结果分开呈现。",
          },
          { name: "反馈", rule: "真实完成后再显示成功；请求失败提供重试。" },
          { name: "小屏", rule: "侧栏收进抽屉，卡片单列，宽表格局部滚动。" },
          { name: "动效", rule: "遵循系统减少动态效果的设置。" },
        ]}
      />
    </>
  );
}
