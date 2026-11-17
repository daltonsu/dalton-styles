import { useRef, useState } from "react";
import {
  Affix,
  Anchor,
  App,
  Breadcrumb,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  Layout,
  Menu,
  Pagination,
  Space,
  Splitter,
  Steps,
  Tabs,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  MenuOutlined,
  ArrowUpOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  AsyncButton,
  downloadText,
  menuItems,
  Output,
  type DemoProps,
} from "./shared";
const icons = [
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FilterOutlined,
];
export default function GeneralDemos({ id, variant: v }: DemoProps) {
  const [value, setValue] = useState("overview");
  const [page, setPage] = useState(1);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(v === 1);
  const scroller = useRef<HTMLDivElement>(null);
  const { message, modal } = App.useApp();
  const notify = () => message.success("操作已完成");
  switch (id) {
    case "button":
      return v === 0 ? (
        <Space wrap>
          <Button type="primary" onClick={notify}>
            主要按钮
          </Button>
          <Button onClick={notify}>默认按钮</Button>
          <Button type="text" onClick={notify}>
            文字按钮
          </Button>
          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: "删除这条示例记录？",
                icon: null,
                onOk: notify,
              })
            }
          >
            危险按钮
          </Button>
        </Space>
      ) : v === 1 ? (
        <Space wrap>
          <Button size="small" onClick={notify}>
            小号 24
          </Button>
          <Button onClick={notify}>默认 32</Button>
          <Button size="large" onClick={notify}>
            大号 40
          </Button>
          <Button
            icon={<PlusOutlined aria-hidden="true" />}
            type="primary"
            onClick={notify}
          >
            新建
          </Button>
        </Space>
      ) : (
        <Space wrap>
          <AsyncButton />
          <Button loading>保存中</Button>
          <Button disabled>禁用</Button>
        </Space>
      );
    case "icon":
      return v === 0 ? (
        <div className="icon-grid">
          {icons.map((Icon, i) => (
            <TooltipIcon
              key={i}
              icon={<Icon />}
              label={
                [
                  "搜索",
                  "新增",
                  "下载",
                  "用户",
                  "设置",
                  "通知",
                  "删除",
                  "日期",
                  "完成",
                  "筛选",
                ][i]
              }
            />
          ))}
        </div>
      ) : (
        <Space wrap>
          <Button
            icon={<DownloadOutlined aria-hidden="true" />}
            onClick={() => downloadText("dalton-styles.txt", "Dalton Styles")}
          >
            下载
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined aria-hidden="true" />}
            onClick={notify}
          >
            新建
          </Button>
          <span>
            <CheckCircleOutlined aria-hidden="true" /> 已完成
          </span>
        </Space>
      );
    case "typography":
      return v === 0 ? (
        <>
          <Typography.Title level={2} style={{ fontSize: 24 }}>
            页面标题 24
          </Typography.Title>
          <Typography.Title level={3} style={{ fontSize: 20 }}>
            区块标题 20
          </Typography.Title>
          <Typography.Title level={4} style={{ fontSize: 16 }}>
            内容标题 16
          </Typography.Title>
        </>
      ) : v === 1 ? (
        <>
          <Typography.Paragraph>
            正文内容 14px，行高 22px。
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
            辅助说明 12px
          </Typography.Paragraph>
          <Typography.Text copyable code>
            CRM-2026-001
          </Typography.Text>
        </>
      ) : (
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: "collapsible" }}
          style={{ maxWidth: 260 }}
        >
          {"客户运营管理中心负责业务数据维护、客户联系和服务交付。".repeat(5)}
        </Typography.Paragraph>
      );
    case "link":
      return v === 0 ? (
        <Space>
          <Link to="/examples/customers">客户管理 →</Link>
          <Link to="/components/standards">设计规范</Link>
        </Space>
      ) : (
        <div className={v === 2 ? "download-card" : "demo-row"}>
          <DownloadOutlined aria-hidden="true" />
          <span>客户数据示例.csv</span>
          <Button
            onClick={() =>
              downloadText(
                "customers.csv",
                "\ufeff客户,城市\r\nSagara Retail,Jakarta\r\nBumi Foods,Bandung\r\nKopi Nusantara,Surabaya",
                "text/csv;charset=utf-8",
              )
            }
          >
            下载 CSV 示例
          </Button>
        </div>
      );
    case "divider":
      return v === 0 ? (
        <>
          客户信息
          <Divider />
          联系记录
        </>
      ) : (
        <>
          <Divider>业务信息</Divider>
          <Space separator={<Divider orientation="vertical" />}>
            <Link to="/examples/customers">查看客户</Link>
            <Link to="/examples/pipeline">查看商机</Link>
          </Space>
        </>
      );
    case "space":
      return v === 0 ? (
        <div className="stack">
          {[8, 16].map((size) => (
            <Space key={size} size={size}>
              <Button onClick={notify}>编辑</Button>
              <Button type="primary" onClick={notify}>
                保存
              </Button>
              <Typography.Text type="secondary">间距 {size}px</Typography.Text>
            </Space>
          ))}
        </div>
      ) : (
        <Space orientation="vertical" size={16}>
          <Button onClick={notify}>客户资料</Button>
          <Space wrap>
            {["Jakarta", "Bandung", "Surabaya", "Medan", "Bali"].map((x) => (
              <Button key={x} onClick={() => message.info(x)}>
                {x}
              </Button>
            ))}
          </Space>
        </Space>
      );
    case "grid": {
      const nums = [[2, 3], [4, 6], [5], [8], [12]][v];
      return (
        <div className="stack">
          {v < 5 ? (
            nums.map((n) => (
              <div
                key={n}
                className="sample-grid"
                style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }}
              >
                {Array.from({ length: n }, (_, i) => (
                  <div className="demo-block" key={i}>
                    {i + 1}
                  </div>
                ))}
              </div>
            ))
          ) : v === 5 ? (
            <div
              className="sample-grid"
              style={{ gridTemplateColumns: "1fr 2fr 1fr" }}
            >
              {["3 / 12", "6 / 12", "3 / 12"].map((x) => (
                <div key={x} className="demo-block">
                  {x}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="sample-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
              }}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div className="demo-block" key={i}>
                  内容 {i + 1}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "layout":
      return (
        <Layout className="layout-demo" style={{ minHeight: 180 }}>
          {v === 0 && (
            <Layout.Sider
              width="26%"
              style={{
                background: "var(--theme-navigation)",
                padding: 24,
                color: "white",
              }}
            >
              导航
            </Layout.Sider>
          )}
          <Layout style={{ minHeight: 180 }}>
            <Layout.Header style={{ height: 44, lineHeight: "44px" }}>
              品牌 / 导航 / 账号
            </Layout.Header>
            <Layout.Content style={{ padding: 28 }}>主内容</Layout.Content>
            <Layout.Footer style={{ padding: 12 }}>页脚</Layout.Footer>
          </Layout>
        </Layout>
      );
    case "flex":
      return (
        <Flex vertical={v === 1} gap={16} justify="space-between">
          {["客户", "商机", "任务", "合同"]
            .slice(0, v === 0 ? 2 : 4)
            .map((x) => (
              <div className="demo-block" key={x}>
                {x}
              </div>
            ))}
        </Flex>
      );
    case "splitter":
      return (
        <Splitter
          style={{
            height: 180,
            border: "1px solid var(--ui-border)",
            borderRadius: 6,
          }}
        >
          <Splitter.Panel
            defaultSize={v === 0 ? "35%" : "45%"}
            min="20%"
            max="75%"
          >
            <div className="panel-label">
              {v === 0 ? "客户列表" : "筛选条件"}
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div className="panel-label">
              {v === 0 ? "客户详情" : "搜索结果"}
            </div>
          </Splitter.Panel>
        </Splitter>
      );
    case "navigation":
      return (
        <div className="navigation-demo">
          {v === 4 ? (
            <>
              <Button
                icon={<MenuOutlined aria-hidden="true" />}
                onClick={() => setOpen(true)}
              >
                打开导航
              </Button>
              <Drawer
                title="工作空间"
                open={open}
                onClose={() => setOpen(false)}
                placement="left"
                size={280}
              >
                <Menu
                  items={menuItems}
                  selectedKeys={[value]}
                  onClick={(e) => {
                    setValue(e.key);
                    setOpen(false);
                  }}
                />
              </Drawer>
              <Output>当前页面：{value}</Output>
            </>
          ) : (
            <>
              {v >= 2 && (
                <Menu
                  mode="horizontal"
                  items={menuItems}
                  selectedKeys={[value]}
                  onClick={(e) => setValue(e.key)}
                />
              )}
              <div style={{ display: "flex", minHeight: 240 }}>
                {v !== 2 && (
                  <Menu
                    theme={v === 0 ? "dark" : "light"}
                    mode="inline"
                    style={{ width: 190, flexShrink: 0 }}
                    items={menuItems}
                    selectedKeys={[value]}
                    onClick={(e) => setValue(e.key)}
                  />
                )}
                <div className="panel-label" style={{ flex: 1 }}>
                  当前页面 · {value}
                </div>
              </div>
            </>
          )}
        </div>
      );
    case "menu":
      return (
        <>
          <Button size="small" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "展开" : "收起"}菜单
          </Button>
          <Menu
            style={{ width: collapsed ? 80 : 220, marginTop: 12 }}
            inlineCollapsed={collapsed}
            mode="inline"
            items={menuItems.map((x) => ({
              ...x,
              icon: <HomeOutlined aria-hidden="true" />,
            }))}
            selectedKeys={[value]}
            onClick={(e) => setValue(e.key)}
          />
          <Output>已选择：{value}</Output>
        </>
      );
    case "breadcrumb":
      return (
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  {v === 1 && <HomeOutlined aria-hidden="true" />} 首页
                </Link>
              ),
            },
            { title: <Link to="/examples/customers">客户管理</Link> },
            { title: "客户详情" },
          ]}
        />
      );
    case "tabs":
      return (
        <Tabs
          type={v === 1 ? "card" : "line"}
          tabPlacement={v === 2 ? "start" : "top"}
          items={["客户资料", "跟进记录", "关联商机"].map((label, i) => ({
            key: String(i),
            label,
            children: <div className="demo-block">{label}的内容</div>,
          }))}
        />
      );
    case "dropdown":
      return (
        <Dropdown
          menu={{
            items: [
              { key: "edit", label: "编辑资料" },
              { key: "copy", label: "复制记录" },
              { type: "divider" },
              { key: "delete", label: "删除记录", danger: true },
              { key: "disabled", label: "无权限操作", disabled: true },
            ],
            onClick: (e) =>
              e.key === "delete"
                ? modal.confirm({
                    title: "删除示例记录？",
                    icon: null,
                    onOk: notify,
                  })
                : message.info(
                    e.key === "edit" ? "已选择编辑资料" : "已选择复制记录",
                  ),
          }}
        >
          <Button>更多操作 ↓</Button>
        </Dropdown>
      );
    case "pagination":
      return (
        <>
          <Pagination
            current={page}
            onChange={setPage}
            total={v === 2 ? 500 : 80}
            pageSize={8}
            showSizeChanger={false}
            showQuickJumper={v === 0}
            simple={v === 1}
            showTotal={(n) => `共 ${n} 条`}
          />
          <Output>第 {page} 页</Output>
        </>
      );
    case "steps":
      return (
        <>
          <Steps
            current={step}
            orientation={v === 1 ? "vertical" : "horizontal"}
            items={["基本资料", "业务信息", "完成"].map((title) => ({ title }))}
          />
          <Space style={{ marginTop: 20 }}>
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
              上一步
            </Button>
            <Button type="primary" onClick={() => setStep((step + 1) % 3)}>
              {step === 2 ? "重新开始" : "下一步"}
            </Button>
          </Space>
        </>
      );
    case "anchor":
      return (
        <div className="anchor-demo">
          <Anchor
            getContainer={() => scroller.current!}
            items={["基本资料", "业务信息", "联系记录"].map((title, i) => ({
              key: String(i),
              href: `#anchor-${v}-${i}`,
              title,
            }))}
          />
          <div
            ref={scroller}
            style={{ height: 190, overflow: "auto", flex: 1 }}
          >
            {["基本资料", "业务信息", "联系记录"].map((x, i) => (
              <section
                id={`anchor-${v}-${i}`}
                key={x}
                style={{
                  minHeight: 180,
                  padding: 24,
                  background:
                    i % 2 ? "var(--ui-layout)" : "var(--theme-selected)",
                }}
              >
                {x}
              </section>
            ))}
          </div>
        </div>
      );
    case "affix":
      return (
        <div
          ref={scroller}
          style={{
            height: 180,
            overflow: "auto",
            position: "relative",
            border: "1px solid var(--ui-border)",
            padding: 12,
          }}
        >
          <div style={{ height: 500 }}>
            <p style={{ padding: 12 }}>在此区域滚动，观察固定操作</p>
            <Affix
              target={() => scroller.current}
              offsetTop={v === 0 ? 0 : undefined}
              offsetBottom={v === 1 ? 0 : undefined}
            >
              <Button type="primary" onClick={notify}>
                {v === 0 ? "顶部固定操作" : "底部固定操作"}
              </Button>
            </Affix>
            <p style={{ marginTop: 250 }}>内容末尾</p>
          </div>
        </div>
      );
    case "back-top":
      return (
        <div
          ref={scroller}
          style={{
            height: 180,
            overflow: "auto",
            border: "1px solid var(--ui-border)",
            padding: 16,
          }}
        >
          <p>在此区域向下滚动</p>
          <div style={{ height: 200 }} />
          <Button
            icon={<ArrowUpOutlined aria-hidden="true" />}
            aria-label="回到示例顶部"
            onClick={() =>
              scroller.current?.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            {v === 0 ? "回到顶部" : undefined}
          </Button>
        </div>
      );
    default:
      throw new Error(`Unknown general demo: ${id}`);
  }
}
function TooltipIcon({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="icon-item">
      {icon}
      <small>{label}</small>
    </span>
  );
}
