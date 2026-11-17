import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Drawer,
  Empty,
  Input,
  Menu,
  Result,
  Table,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CodeOutlined,
  CopyOutlined,
  DownOutlined,
  SearchOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  LayoutOutlined,
  EditOutlined,
  DatabaseOutlined,
  BellOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { SiteHeader } from "../components/SiteHeader";
import manifest from "../catalog/manifest.json";
import { ComponentDemo } from "../catalog/ComponentDemo";
import { componentNames, apiFor, hasNativeApi } from "../catalog/api";
import Standards from "./Standards";
const sources = import.meta.glob("../catalog/demos/*.tsx", {
  query: "?raw",
  import: "default",
});
const groupNames = [...new Set(manifest.map((c) => c.group))];
const groupIcons = [
  <AppstoreOutlined aria-hidden="true" />,
  <LayoutOutlined aria-hidden="true" />,
  <EditOutlined aria-hidden="true" />,
  <DatabaseOutlined aria-hidden="true" />,
  <BellOutlined aria-hidden="true" />,
  <BarChartOutlined aria-hidden="true" />,
];
function sourceFile(group: string) {
  return group === "数据录入"
    ? "InputDemos"
    : group === "数据展示"
      ? "DisplayDemos"
      : group === "反馈"
        ? "FeedbackDemos"
        : group === "数据可视化"
          ? "ChartDemo"
          : "GeneralDemos";
}
export default function Catalog() {
  const { id = "button" } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const component = manifest.find((c) => c.id === id);
  const index = manifest.findIndex((c) => c.id === id);
  const filtered = useMemo(
    () =>
      manifest.filter((c) =>
        `${c.label} ${c.en} ${c.id}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  useEffect(() => {
    if (component) setOpenKeys([component.group]);
    setSourceOpen(false);
    setSource("");
    document.title = `${id === "standards" ? "设计规范" : (component?.label ?? "未找到组件")} · Dalton Styles`;
    setMobile(false);
  }, [id, component]);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("已复制代码");
    } catch {
      message.error("复制失败，请选中代码手动复制");
    }
  };
  const showSource = async () => {
    if (!component) return;
    if (!source)
      setSource(
        String(
          await sources[
            `../catalog/demos/${sourceFile(component.group)}.tsx`
          ](),
        ),
      );
    setSourceOpen(!sourceOpen);
  };
  const sidebar = (
    <>
      <div className="catalog-brand">
        <Brand caption="COMPONENTS" />
      </div>
      <Input
        className="catalog-search"
        prefix={<SearchOutlined aria-hidden="true" />}
        placeholder="搜索组件"
        aria-label="搜索组件"
        value={search}
        allowClear
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="catalog-menu-scroll">
        {filtered.length ? (
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[id]}
            openKeys={search ? groupNames : openKeys}
            onOpenChange={setOpenKeys}
            onClick={(e) => {
              navigate(`/components/${e.key}`);
              setSearch("");
            }}
            items={groupNames.flatMap((group, i) => {
              const items = filtered.filter((c) => c.group === group);
              return items.length
                ? [
                    {
                      key: group,
                      icon: groupIcons[i],
                      label: (
                        <span className="category-label">
                          {group}
                          <small>{items.length}</small>
                        </span>
                      ),
                      children: items.map((c) => ({
                        key: c.id,
                        label: (
                          <span>
                            {c.label}
                            <small className="component-en">{c.en}</small>
                          </span>
                        ),
                      })),
                    },
                  ]
                : [];
            })}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="没有匹配的组件"
          />
        )}
      </div>
      <div className="sidebar-bottom">
        <Button
          type="text"
          className="collapse-catalog"
          icon={
            <ArrowLeftOutlined
              aria-hidden="true"
              style={{ transform: collapsed ? "rotate(180deg)" : undefined }}
            />
          }
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "" : "收起导航"}
        </Button>
      </div>
    </>
  );
  return (
    <div className={`catalog-shell ${collapsed ? "catalog-collapsed" : ""}`}>
      <aside className="catalog-sidebar">{sidebar}</aside>
      <Drawer
        className="mobile-sidebar"
        placement="left"
        size={280}
        open={mobile}
        onClose={() => setMobile(false)}
        styles={{
          body: { padding: 0, display: "flex", flexDirection: "column" },
        }}
      >
        {sidebar}
      </Drawer>
      <div className="site-main">
        <SiteHeader
          section="组件库"
          brandCaption="COMPONENTS"
          current={
            id === "standards" ? "设计规范" : (component?.label ?? "未找到")
          }
          onMenu={() => {
            setCollapsed(false);
            setMobile(true);
          }}
        />
        <main className="catalog-content" id="main-content">
          {id === "standards" ? (
            <Standards />
          ) : !component ? (
            <Result
              status="404"
              title="没有找到这个组件"
              extra={<Link to="/components/button">返回组件库</Link>}
            />
          ) : (
            <>
              <div className="page-title">
                <div>
                  <span className="eyebrow">组件 / {component.group}</span>
                  <h1>
                    {component.label}
                    <small>{component.en}</small>
                  </h1>
                  <p>{component.description}</p>
                </div>
              </div>
              <div className="catalog-examples">
                {component.examples.map((ex, v) => (
                  <section
                    className={`example-card ${ex.wide ? "wide" : ""}`}
                    key={`${id}-${v}`}
                    data-example={`${id}-${v}`}
                  >
                    <div className="example-heading">
                      <h2>{ex.title}</h2>
                      <span>{String(v + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="example-preview">
                      <ComponentDemo id={id} variant={v} />
                    </div>
                    <details className="example-code">
                      <summary>
                        <CodeOutlined aria-hidden="true" /> 使用代码{" "}
                        <span>React / TSX</span>
                        <DownOutlined aria-hidden="true" />
                      </summary>
                      <div className="code-toolbar">
                        <small>在本项目中使用</small>
                        <Button
                          size="small"
                          type="text"
                          icon={<CopyOutlined aria-hidden="true" />}
                          onClick={() =>
                            copy(
                              `import { ComponentDemo } from './catalog/ComponentDemo';\n\n<ComponentDemo id="${id}" variant={${v}} />`,
                            )
                          }
                        >
                          复制
                        </Button>
                      </div>
                      <pre>
                        <code>{`import { ComponentDemo } from './catalog/ComponentDemo';\n\n<ComponentDemo id="${id}" variant={${v}} />`}</code>
                      </pre>
                    </details>
                  </section>
                ))}
              </div>
              <section className="usage-section">
                <h2 className="section-title">使用方法</h2>
                <div className="usage-card">
                  <div className="usage-title">
                    <CodeOutlined aria-hidden="true" />
                    <strong>
                      {componentNames[id] ?? "Recharts / React 图表"}
                    </strong>
                    <Tag color="success">React 实现</Tag>
                  </div>
                  <p>
                    所有演示使用本项目统一主题。上方代码调用项目内的示例组件；跨项目复用时，将对应实现与共享依赖一并迁移，并由业务传入数据和事件。
                  </p>
                  <Button
                    type="link"
                    style={{ paddingLeft: 0 }}
                    onClick={showSource}
                  >
                    {sourceOpen ? "收起" : "查看"}完整 React 实现{" "}
                    <DownOutlined aria-hidden="true" />
                  </Button>
                  {sourceOpen && (
                    <div className="source-view">
                      <div className="code-toolbar">
                        <small>
                          src/catalog/demos/{sourceFile(component.group)}.tsx ·
                          共享依赖见 shared.tsx
                        </small>
                        <Button
                          icon={<CopyOutlined aria-hidden="true" />}
                          size="small"
                          onClick={() => copy(source)}
                        >
                          复制源码
                        </Button>
                      </div>
                      <pre>
                        <code>{source}</code>
                      </pre>
                    </div>
                  )}
                </div>
                {apiFor(id).length > 0 && (
                  <>
                    <h2 className="section-title">
                      {hasNativeApi(id) ? "常用参数" : "示例入口参数"}
                    </h2>
                    <Table
                      size="middle"
                      pagination={false}
                      rowKey={(r) => r[0]}
                      dataSource={apiFor(id)}
                      columns={[
                        {
                          title: "参数",
                          dataIndex: 0,
                          render: (x) => <code className="api-name">{x}</code>,
                        },
                        { title: "类型", dataIndex: 1 },
                        { title: "说明", dataIndex: 2 },
                      ]}
                      scroll={{ x: 500 }}
                    />
                  </>
                )}
              </section>
              <nav className="component-pagination" aria-label="相邻组件">
                {index > 0 ? (
                  <Link to={`/components/${manifest[index - 1].id}`}>
                    <ArrowLeftOutlined aria-hidden="true" />{" "}
                    {manifest[index - 1].label}
                  </Link>
                ) : (
                  <span />
                )}
                {index < manifest.length - 1 ? (
                  <Link to={`/components/${manifest[index + 1].id}`}>
                    {manifest[index + 1].label}{" "}
                    <ArrowRightOutlined aria-hidden="true" />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
