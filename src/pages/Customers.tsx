import { useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useWorkspace } from "../domain/Store";
import {
  cities,
  customersCsv,
  demoDate,
  emptyFilters,
  filterCustomers,
  money,
  owners,
  sources,
  statuses,
  type Customer,
  type Filters,
} from "../domain/model";
import { downloadText, EllipsisText } from "../catalog/demos/shared";
import { Metrics } from "../components/Metrics";
const ownerOptions = owners.map((o) => ({ value: o.id, label: o.name }));
const cityOptions = cities.map((value) => ({ value, label: value }));
const optionalColumns = [
  { value: "contact", label: "联系人" },
  { value: "amount", label: "预计金额" },
  { value: "owner", label: "负责人" },
  { value: "followup", label: "下次跟进" },
  { value: "city", label: "城市" },
];
import { usePreferences } from "../app/Preferences";
import { formatDate } from "../domain/date";

export default function Customers() {
  const {
    preferences: { dateFormat },
  } = usePreferences();
  const { data, setData } = useWorkspace();
  const { message, modal } = App.useApp();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [editor, setEditor] = useState<Customer | "new" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [assign, setAssign] = useState(false);
  const [assignTo, setAssignTo] = useState("maya");
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const rows = useMemo(
    () => filterCustomers(data.customers, filters),
    [data.customers, filters],
  );
  const detail = data.customers.find((c) => c.id === params.get("detail"));
  useEffect(() => {
    if (composing) return;
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: query }));
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, composing]);
  useEffect(
    () =>
      setPage((p) =>
        Math.max(1, Math.min(p, Math.ceil(rows.length / pageSize))),
      ),
    [rows.length, pageSize],
  );
  const changeFilters = (next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  };
  const resetFilters = () => {
    setQuery("");
    setFilters({ ...emptyFilters });
    setPage(1);
  };
  const showDetail = (id: string) => setParams({ detail: id });
  const closeDetail = () => setParams({});
  const edit = (c: Customer | "new") => {
    setEditor(c);
    setDirty(false);
    form.resetFields();
    form.setFieldsValue(
      c === "new"
        ? {
            status: "potential",
            owner: "maya",
            city: "Jakarta",
            source: "官网咨询",
            amount: 0,
            followup: dayjs(demoDate).add(7, "day"),
          }
        : { ...c, followup: dayjs(c.followup) },
    );
  };
  const closeEditor = () => {
    if (dirty)
      modal.confirm({
        title: "放弃未保存的修改？",
        content: "客户资料尚未保存，关闭后将丢失本次修改。",
        icon: null,
        okText: "放弃修改",
        cancelText: "继续编辑",
        autoFocusButton: "cancel",
        onOk: () => {
          setEditor(null);
          setDirty(false);
        },
      });
    else setEditor(null);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      if (editor === "new" && data.customers.length >= 500) {
        message.error("最多保存 500 位客户");
        return;
      }
      const name = values.name.trim();
      const updated: Customer = {
        ...(editor !== "new" && editor
          ? editor
          : {
              id: `CUS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
              created: demoDate,
              events: [{ date: demoDate, text: "建立客户档案。" }],
            }),
        ...values,
        name,
        contact: values.contact.trim(),
        email: values.email.trim(),
        phone: values.phone ?? "",
        industry: values.industry ?? "",
        notes: values.notes ?? "",
        followup: values.followup.format("YYYY-MM-DD"),
      };
      setData((d) => ({
        ...d,
        customers:
          editor === "new"
            ? [updated, ...d.customers]
            : d.customers.map((c) => (c.id === updated.id ? updated : c)),
      }));
      if (editor === "new") resetFilters();
      setEditor(null);
      setDirty(false);
      message.success(editor === "new" ? "客户已创建" : "客户资料已更新");
    } catch {
      /* Form displays field errors and retains values. */
    }
  };
  const remove = (c: Customer) =>
    modal.confirm({
      title: `删除 ${c.name}？`,
      content: "将删除该客户的资料与跟进记录，此操作不可撤销。",
      icon: null,
      okText: "删除客户",
      okButtonProps: { danger: true },
      cancelText: "取消",
      autoFocusButton: "cancel",
      maskClosable: false,
      onOk: () => {
        setData((d) => ({
          ...d,
          customers: d.customers.filter((x) => x.id !== c.id),
        }));
        setSelected((s) => s.filter((id) => id !== c.id));
        if (detail?.id === c.id) closeDetail();
        message.success("客户已删除");
      },
    });
  const follow = (c: Customer) => {
    setData((d) => ({
      ...d,
      customers: d.customers.map((x) =>
        x.id === c.id
          ? {
              ...x,
              followup: dayjs(demoDate).add(7, "day").format("YYYY-MM-DD"),
              events: [
                ...x.events,
                { date: demoDate, text: "已完成跟进，下次联系安排在 7 天后。" },
              ].slice(-50),
            }
          : x,
      ),
    }));
    message.success("已记录跟进");
  };
  const exportRows = (chosen = false) => {
    const exported = chosen
      ? data.customers.filter((c) => selected.includes(c.id))
      : rows;
    if (!exported.length) {
      message.info("没有可导出的客户");
      return;
    }
    downloadText(
      `dalton-customers-${demoDate}.csv`,
      customersCsv(exported),
      "text/csv;charset=utf-8",
    );
    message.success(`已导出 ${exported.length} 位客户`);
  };
  const columns: TableColumnsType<Customer> = [
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, c) => (
        <div className="customer-name-cell">
          <Avatar
            shape="square"
            className="theme-avatar"
            style={{ flexShrink: 0 }}
          >
            {c.name.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <button className="customer-name" onClick={() => showDetail(c.id)}>
              {c.name}
            </button>
            <small>
              <EllipsisText text={`${c.industry} · ${c.id}`} />
            </small>
          </div>
        </div>
      ),
    },
    ...(data.columns.includes("contact")
      ? [
          {
            title: "联系人",
            key: "contact",
            width: 190,
            render: (_: unknown, c: Customer) => (
              <div className="table-two-lines">
                <span>{c.contact}</span>
                <small>
                  <EllipsisText text={c.email} />
                </small>
              </div>
            ),
          },
        ]
      : []),
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 105,
      render: (s: string) => (
        <Tag color={statuses[s]?.color}>{statuses[s]?.label}</Tag>
      ),
    },
    ...(data.columns.includes("amount")
      ? [
          {
            title: "预计金额",
            key: "amount",
            width: 180,
            align: "right" as const,
            sorter: (a: Customer, b: Customer) => a.amount - b.amount,
            render: (_: unknown, c: Customer) => money(c.amount),
          },
        ]
      : []),
    ...(data.columns.includes("owner")
      ? [
          {
            title: "负责人",
            key: "owner",
            width: 115,
            render: (_: unknown, c: Customer) => (
              <Space size={7}>
                <Avatar
                  size={23}
                  className="theme-avatar theme-avatar-accent"
                  style={{
                    fontSize: 9,
                  }}
                >
                  {owners.find((o) => o.id === c.owner)?.initials}
                </Avatar>
                <span>
                  {owners.find((o) => o.id === c.owner)?.name.split(" ")[0]}
                </span>
              </Space>
            ),
          },
        ]
      : []),
    ...(data.columns.includes("city")
      ? [{ title: "城市", dataIndex: "city", key: "city", width: 110 }]
      : []),
    ...(data.columns.includes("followup")
      ? [
          {
            title: "下次跟进",
            dataIndex: "followup",
            key: "followup",
            width: 125,
            sorter: (a: Customer, b: Customer) =>
              a.followup.localeCompare(b.followup),
            render: (date: string, c: Customer) => (
              <span
                style={{
                  color:
                    date < demoDate && c.status !== "archived"
                      ? "var(--ui-error)"
                      : undefined,
                }}
              >
                {formatDate(date, dateFormat)}
              </span>
            ),
          },
        ]
      : []),
    {
      title: "操作",
      key: "actions",
      width: 65,
      fixed: "right",
      render: (_, c) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "detail", label: "查看详情" },
              { key: "edit", label: "编辑资料" },
              { key: "follow", label: "完成跟进" },
              { type: "divider" },
              { key: "delete", label: "删除客户", danger: true },
            ],
            onClick: (e) =>
              ({
                detail: () => showDetail(c.id),
                edit: () => edit(c),
                follow: () => follow(c),
                delete: () => remove(c),
              })[e.key as "detail" | "edit" | "follow" | "delete"]?.(),
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined aria-hidden="true" />}
            aria-label={`${c.name}的更多操作`}
          />
        </Dropdown>
      ),
    },
  ];
  const chips = Object.entries(filters).filter(
    ([key, val]) =>
      key !== "search" && key !== "status" && val !== "" && val !== undefined,
  );
  const chipText = (key: string, value: unknown) =>
    key === "owner"
      ? owners.find((o) => o.id === value)?.name
      : key === "min"
        ? `最低 ${money(Number(value))}`
        : key === "max"
          ? `最高 ${money(Number(value))}`
          : key === "from"
            ? `跟进从 ${value}`
            : key === "to"
              ? `跟进至 ${value}`
              : String(value);
  const preferences = (
    <div style={{ width: 230 }}>
      <p style={{ marginBottom: 12 }}>显示列</p>
      <Checkbox.Group
        options={optionalColumns}
        value={data.columns}
        onChange={(columns) =>
          setData((d) => ({ ...d, columns: columns as string[] }))
        }
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      />
      <p style={{ margin: "20px 0 10px" }}>表格密度</p>
      <Select
        aria-label="表格密度"
        style={{ width: "100%" }}
        value={data.density}
        options={[
          { value: "standard", label: "标准" },
          { value: "compact", label: "紧凑" },
        ]}
        onChange={(density) => setData((d) => ({ ...d, density }))}
      />
    </div>
  );
  return (
    <>
      <div className="workspace-toolbar">
        <Space wrap>
          <Button
            icon={<DownloadOutlined aria-hidden="true" />}
            onClick={() => exportRows()}
          >
            导出客户
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined aria-hidden="true" />}
            onClick={() => edit("new")}
          >
            新建客户
          </Button>
        </Space>
      </div>
      <Metrics />
      <section className="customer-card">
        <Tabs
          className="customer-tabs"
          activeKey={filters.status}
          onChange={(status) => changeFilters({ status })}
          items={[
            {
              key: "",
              label: (
                <>
                  全部客户 <small>{data.customers.length}</small>
                </>
              ),
            },
            ...Object.entries(statuses).map(([key, s]) => ({
              key,
              label: (
                <>
                  {s.label}{" "}
                  <small>
                    {data.customers.filter((c) => c.status === key).length}
                  </small>
                </>
              ),
            })),
          ]}
        />
        <div className="customer-toolbar">
          <div className="customer-filters">
            <Input.Search
              placeholder="搜索客户、联系人或邮箱"
              aria-label="搜索客户"
              type="search"
              value={query}
              allowClear
              onChange={(e) => setQuery(e.target.value)}
              onSearch={(search) => changeFilters({ search })}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
            />
            <Select
              aria-label="按城市筛选"
              placeholder="全部城市"
              value={filters.city || undefined}
              allowClear
              options={cityOptions}
              onChange={(value) => changeFilters({ city: value ?? "" })}
            />
            <Select
              aria-label="按负责人筛选"
              placeholder="全部负责人"
              value={filters.owner || undefined}
              allowClear
              options={ownerOptions}
              onChange={(value) => changeFilters({ owner: value ?? "" })}
            />
            <Button
              icon={<FilterOutlined aria-hidden="true" />}
              onClick={() => {
                filterForm.resetFields();
                filterForm.setFieldsValue({
                  ...filters,
                  dates:
                    filters.from && filters.to
                      ? [dayjs(filters.from), dayjs(filters.to)]
                      : undefined,
                });
                setAdvanced(true);
              }}
            >
              高级筛选
            </Button>
          </div>
          <Popover
            title="表格显示设置"
            content={preferences}
            trigger="click"
            placement="bottomRight"
          >
            <Button
              icon={<SettingOutlined aria-hidden="true" />}
              aria-label="表格显示设置"
            />
          </Popover>
        </div>
        <div className="table-summary">
          <div>
            <span>
              共 <strong>{rows.length}</strong> 位客户
            </span>
            {chips.map(([key, val]) => (
              <Tag
                key={key}
                closable
                onClose={() =>
                  changeFilters({
                    [key]: ["min", "max", "from", "to"].includes(key)
                      ? undefined
                      : "",
                  })
                }
              >
                {chipText(key, val)}
              </Tag>
            ))}
            {chips.length > 0 || query || filters.status ? (
              <Button type="link" size="small" onClick={resetFilters}>
                重置筛选
              </Button>
            ) : null}
          </div>
          <span>金额单位：印尼盾 IDR</span>
        </div>
        {selected.length > 0 && (
          <div className="bulk-bar">
            <span>已选择 {selected.length} 位客户（含其他页及筛选隐藏项）</span>
            <Space wrap>
              <Button size="small" onClick={() => setAssign(true)}>
                分配负责人
              </Button>
              <Button size="small" onClick={() => exportRows(true)}>
                导出所选
              </Button>
              <Button size="small" type="text" onClick={() => setSelected([])}>
                取消选择
              </Button>
            </Space>
          </div>
        )}
        <Table<Customer>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          size={data.density === "compact" ? "small" : "middle"}
          scroll={{ x: "max-content" }}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: setSelected,
            preserveSelectedRowKeys: true,
            getCheckboxProps: (record) => ({
              "aria-label": `选择 ${record.name}`,
            }),
            columnWidth: 48,
          }}
          pagination={{
            current: page,
            pageSize,
            total: rows.length,
            pageSizeOptions: [8, 12, 20],
            showSizeChanger: true,
            showTotal: (total, range) =>
              `显示 ${total ? range[0] : 0}–${range[1]} 条，共 ${total} 条`,
            onChange: (p, size) => {
              setPage(size !== pageSize ? 1 : p);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  data.customers.length ? "没有找到匹配的客户" : "还没有客户"
                }
              >
                <Button
                  onClick={
                    data.customers.length ? resetFilters : () => edit("new")
                  }
                >
                  {data.customers.length ? "清空筛选" : "新建客户"}
                </Button>
              </Empty>
            ),
          }}
        />
      </section>
      <Modal
        title={editor === "new" ? "新建客户" : "编辑客户资料"}
        forceRender
        open={!!editor}
        onCancel={closeEditor}
        onOk={save}
        okText="保存客户"
        cancelText="取消"
        width={760}
        styles={{ body: { maxHeight: "65vh", overflowY: "auto" } }}
      >
        <Form
          name="customer-editor"
          form={form}
          layout="vertical"
          onValuesChange={() => setDirty(true)}
          preserve={false}
        >
          <div className="form-grid">
            <Form.Item
              name="name"
              label="客户名称"
              rules={[
                { required: true, whitespace: true, message: "请输入客户名称" },
                { max: 80, message: "最多 80 个字符" },
              ]}
            >
              <Input placeholder="例如 Sagara Retail" maxLength={80} />
            </Form.Item>
            <Form.Item name="industry" label="所属行业">
              <Input placeholder="例如 零售与消费" maxLength={80} />
            </Form.Item>
            <Form.Item
              name="contact"
              label="联系人"
              rules={[
                { required: true, whitespace: true, message: "请输入联系人" },
              ]}
            >
              <Input maxLength={60} />
            </Form.Item>
            <Form.Item
              name="email"
              label="联系邮箱"
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "邮箱格式不正确" },
              ]}
            >
              <Input maxLength={120} />
            </Form.Item>
            <Form.Item name="phone" label="联系电话">
              <Input maxLength={30} />
            </Form.Item>
            <Form.Item
              name="city"
              label="所在城市"
              rules={[{ required: true }]}
            >
              <Select options={cityOptions} />
            </Form.Item>
            <Form.Item
              name="status"
              label="客户状态"
              rules={[{ required: true }]}
            >
              <Select
                options={Object.entries(statuses).map(([value, s]) => ({
                  value,
                  label: s.label,
                }))}
              />
            </Form.Item>
            <Form.Item name="owner" label="负责人" rules={[{ required: true }]}>
              <Select options={ownerOptions} />
            </Form.Item>
            <Form.Item
              name="amount"
              label="预计金额（IDR）"
              rules={[
                { required: true, message: "请输入金额" },
                {
                  type: "integer",
                  min: 0,
                  max: 1e12,
                  message: "请输入 0–1 万亿的整数",
                },
              ]}
            >
              <InputNumber
                min={0}
                max={1e12}
                precision={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="source"
              label="客户来源"
              rules={[{ required: true }]}
            >
              <Select
                options={sources.map((value) => ({ value, label: value }))}
              />
            </Form.Item>
            <Form.Item
              name="followup"
              label="下次跟进"
              rules={[{ required: true, message: "请选择跟进日期" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="客户详情"
        size={540}
        open={!!detail && !editor}
        onClose={closeDetail}
        extra={
          detail ? (
            <Button
              icon={<EditOutlined aria-hidden="true" />}
              onClick={() => edit(detail)}
            >
              编辑
            </Button>
          ) : undefined
        }
      >
        {detail && (
          <>
            <div className="detail-heading">
              <Avatar size={56} shape="square" className="theme-avatar">
                {detail.name.slice(0, 2)}
              </Avatar>
              <div>
                <h2>{detail.name}</h2>
                <Tag color={statuses[detail.status].color}>
                  {statuses[detail.status].label}
                </Tag>
              </div>
            </div>
            <Descriptions
              column={1}
              items={[
                ["联系人", detail.contact],
                ["邮箱", detail.email],
                ["电话", detail.phone || "未填写"],
                ["城市", detail.city],
                ["来源", detail.source],
                ["负责人", owners.find((o) => o.id === detail.owner)?.name],
                ["预计金额", money(detail.amount)],
                ["下次跟进", formatDate(detail.followup, dateFormat)],
                ["备注", detail.notes || "暂无备注"],
              ].map(([label, children]) => ({ key: label, label, children }))}
            />
            <Button
              style={{ marginTop: 20 }}
              type="primary"
              onClick={() => follow(detail)}
            >
              完成本次跟进
            </Button>
            <h3 className="section-title">跟进记录</h3>
            <Timeline
              items={[...detail.events].reverse().map((e) => ({
                title: formatDate(e.date, dateFormat),
                content: e.text,
              }))}
            />
          </>
        )}
      </Drawer>
      <Modal
        title="高级筛选"
        open={advanced}
        onCancel={() => setAdvanced(false)}
        okText="应用筛选"
        onOk={() =>
          filterForm
            .validateFields()
            .then((values) => {
              changeFilters({
                source: values.source ?? "",
                min: values.min ?? undefined,
                max: values.max ?? undefined,
                from: values.dates?.[0]?.format("YYYY-MM-DD"),
                to: values.dates?.[1]?.format("YYYY-MM-DD"),
              });
              setAdvanced(false);
            })
            .catch(() => {})
        }
      >
        <Form name="advanced-filter" form={filterForm} layout="vertical">
          <Form.Item label="客户来源" name="source">
            <Select
              allowClear
              options={sources.map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <div className="form-grid">
            <Form.Item label="最低金额" name="min">
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="最高金额"
              name="max"
              dependencies={["min"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    value != null &&
                    getFieldValue("min") != null &&
                    value < getFieldValue("min")
                      ? Promise.reject(new Error("最高金额不能低于最低金额"))
                      : Promise.resolve(),
                }),
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item label="跟进日期范围" name="dates">
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Button
            type="text"
            onClick={() =>
              filterForm.setFieldsValue({
                source: undefined,
                min: undefined,
                max: undefined,
                dates: undefined,
              })
            }
          >
            清空本面板
          </Button>
        </Form>
      </Modal>
      <Modal
        title="分配负责人"
        open={assign}
        onCancel={() => setAssign(false)}
        okText="确认分配"
        onOk={() => {
          setData((d) => ({
            ...d,
            customers: d.customers.map((c) =>
              selected.includes(c.id)
                ? {
                    ...c,
                    owner: assignTo,
                    events: [
                      ...c.events,
                      {
                        date: demoDate,
                        text: `负责人调整为 ${owners.find((o) => o.id === assignTo)?.name}。`,
                      },
                    ].slice(-50),
                  }
                : c,
            ),
          }));
          message.success(`已更新 ${selected.length} 位客户的负责人`);
          setSelected([]);
          setAssign(false);
        }}
      >
        <p style={{ marginBottom: 20 }}>
          将更新已选择的 {selected.length}{" "}
          位客户，包括其他页与当前筛选隐藏的客户。
        </p>
        <Select
          aria-label="新负责人"
          style={{ width: "100%" }}
          value={assignTo}
          onChange={setAssignTo}
          options={ownerOptions}
        />
      </Modal>
    </>
  );
}
