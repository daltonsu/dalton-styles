import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Modal,
  Result,
  Spin,
} from "antd";
import { BellOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  WorkspaceSidebar,
  workspaceLinks as links,
} from "../components/WorkspaceSidebar";
import { SiteHeader } from "../components/SiteHeader";
import { WorkspaceProvider, useWorkspace } from "../domain/Store";
import { demoDate } from "../domain/model";
import { usePreferences } from "../app/Preferences";
import { formatDate } from "../domain/date";
const Overview = lazy(() => import("./Overview"));
const Customers = lazy(() => import("./Customers"));
const Pipeline = lazy(() => import("./Pipeline"));
const Settings = lazy(() => import("./Settings"));
function WorkspaceShell() {
  const {
    preferences: { dateFormat },
  } = usePreferences();
  const { data, storageError } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split("/")[2] ?? "overview";
  const current = links.find((x) => x.key === section)?.label ?? "页面不存在";
  const [mobile, setMobile] = useState(false);
  const mobileTriggerRef = useRef<HTMLElement | null>(null);
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
    <WorkspaceSidebar
      selectedKey={section}
      collapsed={collapsed}
      customerCount={data.customers.length}
      onSelect={(key) => navigate(`/examples/${key}`)}
      onToggle={() => setCollapsed(!collapsed)}
      onAccountAction={() => {
        if (mobile) {
          setMobile(false);
          return mobileTriggerRef.current;
        }
      }}
    />
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
            mobileTriggerRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
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
        <main className="workspace-content" aria-label={current}>
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
          截至 {formatDate(demoDate, dateFormat)}，共 {due.length}{" "}
          位客户需要跟进。
        </p>
        {due.length ? (
          due.map((c) => (
            <div className="notification-row" key={c.id}>
              <strong>{c.name}</strong>
              <p>
                {c.contact} · 下次跟进 {formatDate(c.followup, dateFormat)}
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
