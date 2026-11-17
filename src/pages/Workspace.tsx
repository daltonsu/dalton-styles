import { lazy, Suspense, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Menu,
  Modal,
  Result,
  Spin,
} from "antd";
import {
  AppstoreOutlined,
  BellOutlined,
  BuildOutlined,
  DownOutlined,
  LeftOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Brand } from "../components/Brand";
import { SiteHeader } from "../components/SiteHeader";
import { WorkspaceProvider, useWorkspace } from "../domain/Store";
import { demoDate } from "../domain/model";
const Overview = lazy(() => import("./Overview"));
const Customers = lazy(() => import("./Customers"));
const Pipeline = lazy(() => import("./Pipeline"));
const Settings = lazy(() => import("./Settings"));
const links = [
  {
    key: "overview",
    label: "经营概览",
    icon: <AppstoreOutlined aria-hidden="true" />,
  },
  {
    key: "customers",
    label: "客户管理",
    icon: <TeamOutlined aria-hidden="true" />,
  },
  {
    key: "pipeline",
    label: "商机看板",
    icon: <BuildOutlined aria-hidden="true" />,
  },
  {
    key: "settings",
    label: "项目设置",
    icon: <SettingOutlined aria-hidden="true" />,
  },
];
function WorkspaceShell() {
  const { data, storageError } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split("/")[2] ?? "overview";
  const current = links.find((x) => x.key === section)?.label ?? "页面不存在";
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(false);
  const due = data.customers.filter(
    (c) => c.status !== "archived" && c.followup <= demoDate,
  );
  useEffect(() => {
    document.title = `${current} · Dalton Styles`;
    setMobile(false);
  }, [current, location.pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((x) => !x);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  const sidebar = (
    <>
      <div className="workspace-brand">
        <Brand caption="WORKSPACE" />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[section]}
        items={links.map((x) => ({
          ...x,
          label: (
            <span>
              {x.label}
              {x.key === "customers" && (
                <small className="nav-count">{data.customers.length}</small>
              )}
            </span>
          ),
        }))}
        onClick={(e) => navigate(`/examples/${e.key}`)}
      />
      <div className="workspace-user">
        <Avatar className="theme-avatar">DS</Avatar>
        <span>Dalton</span>
        <Button
          type="text"
          className="workspace-collapse"
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          icon={
            <LeftOutlined
              aria-hidden="true"
              style={{ transform: collapsed ? "rotate(180deg)" : undefined }}
            />
          }
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
    </>
  );
  const matchedPages = links.filter((x) => !search || x.label.includes(search));
  const matchedCustomers = search
    ? data.customers
        .filter((c) =>
          `${c.name} ${c.contact}`.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  return (
    <div
      className={`workspace-shell ${collapsed ? "workspace-collapsed" : ""}`}
    >
      <aside className="workspace-sidebar">{sidebar}</aside>
      <Drawer
        placement="left"
        className="workspace-mobile"
        size={258}
        open={mobile}
        onClose={() => setMobile(false)}
        styles={{
          body: {
            padding: 0,
            background: "var(--theme-navigation)",
            color: "white",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {sidebar}
      </Drawer>
      <div className="site-main">
        <SiteHeader
          section="页面样例"
          brandCaption="WORKSPACE"
          current={current}
          onMenu={() => {
            setCollapsed(false);
            setMobile(true);
          }}
        >
          <Button
            className="workspace-search"
            aria-label="搜索工作空间"
            icon={<SearchOutlined aria-hidden="true" />}
            onClick={() => setSearchOpen(true)}
          >
            <span>搜索工作空间</span>
            <kbd>⌘ K</kbd>
          </Button>
          <Badge dot={due.length > 0} offset={[-8, 6]}>
            <Button
              type="text"
              icon={<BellOutlined aria-hidden="true" />}
              aria-label="跟进提醒"
              onClick={() => setNotifications(true)}
            />
          </Badge>
          <Avatar size={30} className="theme-avatar theme-avatar-accent">
            DS
          </Avatar>
        </SiteHeader>
        {storageError && (
          <Alert
            type="warning"
            title="浏览器存储不可用，本次修改仅在当前页面保留。"
          />
        )}
        <main className="workspace-content">
          <Suspense
            fallback={
              <div className="page-loading">
                <Spin />
              </div>
            }
          >
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="customers" element={<Customers />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <Result
                    status="404"
                    title="没有找到页面"
                    extra={<Link to="/examples/overview">返回概览</Link>}
                  />
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Modal
        title="搜索工作空间"
        open={searchOpen}
        onCancel={() => setSearchOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Input
          autoFocus
          placeholder="输入页面名称、客户或联系人"
          aria-label="搜索工作空间"
          prefix={<SearchOutlined aria-hidden="true" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="command-results">
          {matchedPages.map((x) => (
            <button
              key={x.key}
              onClick={() => {
                navigate(`/examples/${x.key}`);
                setSearchOpen(false);
              }}
            >
              {x.icon}
              <span>{x.label}</span>
              <small>页面</small>
            </button>
          ))}
          {matchedCustomers.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                navigate(`/examples/customers?detail=${c.id}`);
                setSearchOpen(false);
              }}
            >
              <TeamOutlined aria-hidden="true" />
              <span>{c.name}</span>
              <small>客户</small>
            </button>
          ))}
          {!matchedPages.length && !matchedCustomers.length && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="没有匹配的页面或客户"
            />
          )}
        </div>
      </Modal>
      <Drawer
        title="跟进提醒"
        open={notifications}
        onClose={() => setNotifications(false)}
        size={400}
      >
        <p className="muted" style={{ marginBottom: 24 }}>
          截至演示基准日 {demoDate}，共 {due.length} 位客户需要跟进。
        </p>
        {due.length ? (
          due.map((c) => (
            <div className="notification-row" key={c.id}>
              <strong>{c.name}</strong>
              <p>
                {c.contact} · 下次跟进 {c.followup}
              </p>
              <Button
                size="small"
                onClick={() => {
                  navigate(`/examples/customers?detail=${c.id}`);
                  setNotifications(false);
                }}
              >
                查看客户
              </Button>
            </div>
          ))
        ) : (
          <Empty description="所有跟进已处理" />
        )}
      </Drawer>
    </div>
  );
}
export default function Workspace() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
