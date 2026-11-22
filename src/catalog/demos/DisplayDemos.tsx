import { useState } from "react";
import {
  App,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Carousel,
  Checkbox,
  Collapse,
  Descriptions,
  Empty,
  Image,
  Input,
  Radio,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Tree,
  Typography,
  Watermark,
} from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  HeartOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { landscape, Output, rows, treeData, type DemoProps } from "./shared";
import { usePreferences } from "../../app/Preferences";
import { formatDate } from "../../domain/date";
const columns = [
  { title: "客户", dataIndex: "name", key: "name" },
  {
    title: "金额（百万 IDR）",
    dataIndex: "amount",
    key: "amount",
    sorter: (a: (typeof rows)[0], b: (typeof rows)[0]) => a.amount - b.amount,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (x: string) => (
      <Tag color={x === "合作中" ? "success" : "warning"}>{x}</Tag>
    ),
  },
];
export default function DisplayDemos({ id, variant: v }: DemoProps) {
  const {
    preferences: { dateFormat },
  } = usePreferences();
  const { message } = App.useApp();
  const [value, setValue] = useState("客户资料");
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(128);
  const [text, setText] = useState("");
  const [comments, setComments] = useState(["已与客户确认下一步合作计划。"]);
  const [tags, setTags] = useState(["重点客户", "待跟进", "已归档"]);
  const [deadline] = useState(() => Date.now() + 3600000);
  switch (id) {
    case "table":
      return (
        <Table
          dataSource={v === 2 ? [] : rows}
          columns={columns}
          size={v === 1 ? "small" : "middle"}
          rowSelection={v === 1 ? {} : undefined}
          pagination={false}
          scroll={{ x: 420 }}
        />
      );
    case "list":
      return (
        <div>
          {rows.map((row) => (
            <div className="demo-list-item" key={row.key}>
              {v === 0 && (
                <Avatar
                  style={{
                    background: "var(--theme-selected)",
                    color: "var(--theme-ink)",
                  }}
                  icon={<UserOutlined aria-hidden="true" />}
                />
              )}
              <div>
                <strong>{row.name}</strong>
                <p className="muted" style={{ fontSize: 12, marginTop: 5 }}>
                  客户运营与合作跟进
                </p>
              </div>
              <Button
                type="link"
                onClick={() => message.info(`已选择 ${row.name}`)}
              >
                查看
              </Button>
            </div>
          ))}
        </div>
      );
    case "card":
      switch (v) {
        case 0:
          return (
            <Card title="客户概览" size="small">
              <p>Jakarta · 24 位客户</p>
              <p className="muted" style={{ marginTop: 10 }}>
                统一管理客户信息和合作进展。
              </p>
            </Card>
          );
        case 1:
          return (
            <Card
              hoverable
              onClick={() => setSelected(!selected)}
              style={{
                borderColor: selected ? "var(--theme-primary)" : undefined,
              }}
            >
              <Space>
                <Checkbox
                  checked={selected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSelected(e.target.checked)}
                />
                年度合作方案
              </Space>
              <p className="muted" style={{ marginTop: 12 }}>
                点击卡片或复选框选择
              </p>
            </Card>
          );
        case 2:
          return (
            <Card
              title="客户资料"
              extra={
                <Button
                  type="link"
                  onClick={() => message.info("已进入编辑演示")}
                >
                  编辑
                </Button>
              }
              actions={[
                <Button type="text" onClick={() => message.success("已保存")}>
                  保存资料
                </Button>,
              ]}
            >
              <p>Sagara Retail</p>
              <p className="muted" style={{ marginTop: 8 }}>
                Jakarta · 零售与消费
              </p>
            </Card>
          );
        case 3:
          return (
            <Card
              style={{ maxWidth: 360 }}
              cover={<img alt="森林群岛" src={landscape()} />}
              actions={[
                <Button
                  type="text"
                  aria-label="收藏"
                  icon={<HeartOutlined aria-hidden="true" />}
                  onClick={() => message.success("已收藏")}
                />,
                <Button
                  type="text"
                  aria-label="编辑"
                  icon={<EditOutlined aria-hidden="true" />}
                  onClick={() => message.info("编辑资料")}
                />,
                <Button
                  type="text"
                  aria-label="更多"
                  icon={<EllipsisOutlined aria-hidden="true" />}
                  onClick={() => message.info("暂无更多操作")}
                />,
              ]}
            >
              <Card.Meta
                avatar={<Avatar>MP</Avatar>}
                title="森林群岛"
                description="一段关于自然与工作的灵感"
              />
            </Card>
          );
        case 4:
          return (
            <Card
              tabList={["客户资料", "跟进记录"].map((key) => ({
                key,
                label: key,
              }))}
              activeTabKey={value}
              onTabChange={setValue}
            >
              {value === "客户资料"
                ? "Sagara Retail · Jakarta"
                : "已完成第一次需求沟通"}
            </Card>
          );
        case 5:
          return (
            <Card title="工作空间">
              {["客户", "商机", "任务", "合同"].map((x) => (
                <Card.Grid
                  key={x}
                  style={{ width: "50%", textAlign: "center" }}
                >
                  <Button type="text" onClick={() => message.info(x)}>
                    {x}
                  </Button>
                </Card.Grid>
              ))}
            </Card>
          );
        case 6:
          return (
            <Card title="合作项目">
              <Card
                type="inner"
                title="年度客户运营"
                extra={<Tag color="success">进行中</Tag>}
              >
                负责人 Maya · 2026 年
              </Card>
            </Card>
          );
        case 7:
          return (
            <div className="stack">
              <Switch
                checked={loading}
                onChange={setLoading}
                checkedChildren="加载中"
                unCheckedChildren="已加载"
              />
              <Card loading={loading} title="客户资料">
                <p>Sagara Retail</p>
                <p className="muted">客户资料已加载</p>
              </Card>
            </div>
          );
        case 8:
          return (
            <div className="stack">
              <Card title="紧凑卡片" size="small">
                适合辅助信息
              </Card>
              <Card
                title="无边框卡片"
                variant="borderless"
                style={{ background: "var(--theme-selected)" }}
              >
                轻量内容分组
              </Card>
            </div>
          );
        default:
          return (
            <Card
              title="客户管理"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined aria-hidden="true" />}
                  onClick={() => message.info("新建客户演示")}
                >
                  新建客户
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={rows}
                size="small"
                pagination={false}
                scroll={{ x: 420 }}
              />
            </Card>
          );
      }
    case "statistic":
      return v === 0 ? (
        <Space size={32} wrap>
          <Statistic title="合同金额（IDR）" value={128000000} />
          <Statistic title="合作客户" value={32} suffix="位" />
        </Space>
      ) : (
        <div className="demo-row">
          <Statistic title="客户数量" value={count} />
          <Button onClick={() => setCount(count + 1)}>增加客户</Button>
          <Statistic.Timer type="countdown" title="距离结束" value={deadline} />
        </div>
      );
    case "descriptions":
      return (
        <Descriptions
          column={v === 0 ? 1 : 2}
          bordered={v === 1}
          items={[
            { key: "name", label: "客户名称", children: "Sagara Retail" },
            { key: "city", label: "所在城市", children: "Jakarta" },
            { key: "owner", label: "负责人", children: "Maya Putri" },
            {
              key: "note",
              label: "备注",
              children: "重点跟进年度合作计划和多门店采购需求。",
            },
          ]}
        />
      );
    case "avatar":
      return v === 0 ? (
        <Space wrap>
          <Avatar icon={<UserOutlined aria-hidden="true" />} />
          <Avatar style={{ background: "var(--theme-navigation)" }}>MP</Avatar>
          <Avatar
            shape="square"
            style={{
              background: "var(--theme-primary)",
              color: "var(--ui-on-accent)",
            }}
          >
            DS
          </Avatar>
          <Avatar size={48}>AP</Avatar>
        </Space>
      ) : (
        <Avatar.Group max={{ count: 3 }}>
          {["MP", "RA", "SW", "DS", "AP"].map((x, i) => (
            <Avatar
              key={x}
              style={{
                background: [
                  "var(--theme-primary)",
                  "var(--theme-navigation)",
                  "#6a5686",
                ][i % 3],
                color: i % 3 === 0 ? "var(--ui-on-accent)" : undefined,
              }}
            >
              {x}
            </Avatar>
          ))}
        </Avatar.Group>
      );
    case "badge":
      return v === 0 ? (
        <Space wrap>
          {(
            ["success", "processing", "warning", "error", "default"] as const
          ).map((status, i) => (
            <Badge
              key={status}
              status={status}
              text={["合作中", "处理中", "待跟进", "失败", "未开始"][i]}
            />
          ))}
        </Space>
      ) : (
        <Space size={28}>
          <Badge count={8}>
            <Avatar shape="square" icon={<UserOutlined aria-hidden="true" />} />
          </Badge>
          <Badge dot>
            <Avatar shape="square" icon={<UserOutlined aria-hidden="true" />} />
          </Badge>
        </Space>
      );
    case "tag":
      return v === 0 ? (
        <Space wrap>
          <Tag color="success">合作中</Tag>
          <Tag color="warning">洽谈中</Tag>
          <Tag color="error">已逾期</Tag>
          <Tag>已归档</Tag>
        </Space>
      ) : (
        <>
          <Space wrap>
            {tags.map((x) => (
              <Tag
                key={x}
                closable
                onClose={() => setTags(tags.filter((t) => t !== x))}
              >
                {x}
              </Tag>
            ))}
            <Tag.CheckableTag checked={selected} onChange={setSelected}>
              可选择标签
            </Tag.CheckableTag>
          </Space>
          <Output>{selected ? "标签已选中" : "标签未选中"}</Output>
        </>
      );
    case "tree":
      return (
        <>
          <Tree
            treeData={treeData}
            defaultExpandedKeys={["id", "java"]}
            checkable={v === 1}
            onSelect={(keys) => setText(keys.join("、"))}
            onCheck={(keys) =>
              setText((Array.isArray(keys) ? keys : keys.checked).join("、"))
            }
          />
          <Output>{text || (v === 0 ? "点击节点查看" : "尚未选择")}</Output>
        </>
      );
    case "collapse":
      return (
        <Collapse
          accordion={v === 1}
          defaultActiveKey={["1"]}
          items={[
            {
              key: "1",
              label: "客户资料",
              children: "客户名称、联系方式和业务地区。",
            },
            {
              key: "2",
              label: "合作信息",
              children: "合作范围、合同与预计金额。",
            },
            {
              key: "3",
              label: "跟进记录",
              children: "联系时间、负责人和下一步行动。",
            },
          ]}
        />
      );
    case "timeline":
      return (
        <Timeline
          items={[
            {
              title: formatDate("2026-11-01", dateFormat),
              content: "建立客户档案",
            },
            {
              title: formatDate("2026-11-02", dateFormat),
              content: "完成首次沟通",
            },
            {
              title: formatDate("2026-11-04", dateFormat),
              content: v === 0 ? "确认合作方案" : "等待客户反馈",
              color: v === 0 ? "green" : "gray",
            },
          ]}
        />
      );
    case "calendar":
      return (
        <Calendar
          fullscreen={false}
          style={{ maxWidth: v === 0 ? 520 : 320 }}
          cellRender={
            v === 0
              ? (current, info) =>
                  info.type === "date" &&
                  typeof current !== "number" &&
                  current.date() === 16 ? (
                    <Badge status="success" text="回访" />
                  ) : (
                    info.originNode
                  )
              : undefined
          }
        />
      );
    case "carousel":
      return (
        <Carousel arrows autoplay={false} style={{ maxWidth: 640 }}>
          {[0, 1, 2].map((i) => (
            <div key={i}>
              {v === 0 ? (
                <img
                  src={landscape(i % 2 === 1)}
                  alt={i % 2 ? "陶土群山" : "森林群岛"}
                  className="demo-image"
                />
              ) : (
                <div
                  className="carousel-slide"
                  style={{
                    background: [
                      "var(--theme-navigation)",
                      "var(--theme-primary)",
                      "#6a5686",
                    ][i],
                    color: i === 1 ? "var(--ui-on-accent)" : undefined,
                  }}
                >
                  内容 {i + 1}
                </div>
              )}
            </div>
          ))}
        </Carousel>
      );
    case "image":
      return (
        <Image
          width={v === 0 ? 320 : 220}
          style={{
            maxWidth: "100%",
            aspectRatio: v === 0 ? "2 / 1" : "1 / 1",
            objectFit: "cover",
            borderRadius: 6,
          }}
          src={landscape(v === 1)}
          alt={v === 0 ? "森林群岛，可点击预览" : "陶土群山，可点击预览"}
        />
      );
    case "segmented":
      return (
        <>
          <Segmented
            options={v === 0 ? ["列表", "卡片", "看板"] : ["日", "周", "月"]}
            onChange={(x) => setText(String(x))}
          />
          <Output>当前视图：{text || (v === 0 ? "列表" : "日")}</Output>
        </>
      );
    case "empty":
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            v === 0
              ? "还没有客户，创建第一位客户开始使用"
              : "没有找到匹配结果，试试调整搜索条件"
          }
        >
          <Button
            type={v === 0 ? "primary" : "default"}
            onClick={() =>
              message.info(
                v === 0 ? "请在页面样例的客户管理中新增客户" : "已清空搜索条件",
              )
            }
          >
            {v === 0 ? "新建客户" : "清空筛选"}
          </Button>
        </Empty>
      );
    case "watermark":
      return (
        <div className="stack">
          {v === 1 && (
            <Input
              aria-label="水印文字"
              placeholder="输入水印文字"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          <Watermark content={text || "Dalton Styles"}>
            <div
              style={{
                height: 180,
                background: "var(--ui-subtle)",
                padding: 24,
              }}
            >
              客户资料 · 内部演示
            </div>
          </Watermark>
        </div>
      );
    case "comment":
      return (
        <div className="stack">
          {comments.map((c, i) => (
            <div className="demo-list-item" key={i}>
              <Avatar
                style={{
                  background: "var(--theme-selected)",
                  color: "var(--theme-ink)",
                }}
              >
                MP
              </Avatar>
              <div>
                <strong>Maya Putri</strong>
                <p style={{ marginTop: 8 }}>{c}</p>
              </div>
            </div>
          ))}
          {v === 1 && (
            <>
              <Input.TextArea
                aria-label="评论内容"
                value={text}
                maxLength={500}
                showCount
                onChange={(e) => setText(e.target.value)}
                placeholder="写下你的评论"
              />
              <Button
                style={{ alignSelf: "flex-end" }}
                type="primary"
                disabled={!text.trim()}
                onClick={() => {
                  setComments([...comments, text.trim()]);
                  setText("");
                }}
              >
                发表评论
              </Button>
            </>
          )}
        </div>
      );
    default:
      throw new Error(`Unknown display demo: ${id}`);
  }
}
