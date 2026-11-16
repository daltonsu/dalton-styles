import { useEffect, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Progress,
  Result,
  Skeleton,
  Space,
  Spin,
  Switch,
  Tooltip,
  Tour,
} from "antd";
import {
  InfoCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Output, type DemoProps } from "./shared";
export default function FeedbackDemos({ id, variant: v }: DemoProps) {
  const { message, notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [value, setValue] = useState("Sagara Retail");
  const [progress, setProgress] = useState(36);
  const [form] = Form.useForm();
  const first = useRef<HTMLButtonElement>(null),
    second = useRef<HTMLButtonElement>(null),
    third = useRef<HTMLButtonElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  const save = () => {
    if ((id === "modal" && v === 1) || (id === "drawer" && v === 1)) {
      form
        .validateFields()
        .then(() => {
          setOpen(false);
          message.success("演示资料已保存");
        })
        .catch(() => {});
      return;
    }
    if (v === 4 && id === "modal") {
      setLoading(true);
      setError("");
      timeout.current = setTimeout(() => {
        setLoading(false);
        if (attempt === 0) {
          setError("模拟请求失败，请重试。已保留原内容。");
          setAttempt(1);
        } else {
          setOpen(false);
          message.success("重试成功");
          setAttempt(0);
        }
      }, 900);
    } else {
      setOpen(false);
      message.success("操作已完成");
    }
  };
  switch (id) {
    case "alert":
      return (
        <div className="stack">
          {(v === 0 ? ["success", "info"] : ["warning", "error"]).map(
            (type) => (
              <Alert
                key={type}
                type={type as "success"}
                title={
                  {
                    success: "资料已保存",
                    info: "还有 3 位客户需要跟进",
                    warning: "请核对客户联系方式",
                    error: "保存失败，请检查输入后重试",
                  }[type]
                }
                closable={v === 1}
                showIcon
              />
            ),
          )}
        </div>
      );
    case "message":
      return v === 0 ? (
        <Space>
          <Button onClick={() => message.success("资料已保存")}>
            成功消息
          </Button>
          <Button onClick={() => message.error("保存失败，请稍后重试")}>
            错误消息
          </Button>
        </Space>
      ) : (
        <Button
          disabled={loading}
          onClick={() => {
            setLoading(true);
            const hide = message.loading("正在保存…", 0);
            timeout.current = setTimeout(() => {
              hide();
              setLoading(false);
              message.success("保存成功");
            }, 1000);
          }}
        >
          加载后反馈
        </Button>
      );
    case "notification":
      return (
        <Button
          onClick={() =>
            notification.open({
              title: "客户跟进提醒",
              description: "Sagara Retail 的下次跟进已到期，请联系负责人。",
              duration: v === 1 ? 0 : 4.5,
              actions: (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => notification.destroy()}
                >
                  知道了
                </Button>
              ),
            })
          }
        >
          打开{v === 1 ? "持久" : "任务"}通知
        </Button>
      );
    case "modal":
      return (
        <>
          <Button
            danger={v === 2}
            onClick={() => {
              setOpen(true);
              setError("");
            }}
          >
            {
              [
                "打开对话框",
                "编辑客户",
                "删除示例记录",
                "预览长内容",
                "体验异步确认",
                "打开宽弹窗",
              ][v]
            }
          </Button>
          <Modal
            title={
              [
                "客户信息",
                "编辑客户",
                "删除这条示例记录？",
                "客户合作记录",
                "确认保存客户资料",
                "宽弹窗示例",
              ][v]
            }
            open={open}
            onCancel={() => {
              if (!loading) setOpen(false);
            }}
            width={v === 5 ? 800 : v === 2 ? 440 : 600}
            confirmLoading={loading}
            closable={!loading}
            keyboard={!loading}
            maskClosable={v !== 2 && !loading}
            cancelButtonProps={{ disabled: loading }}
            okButtonProps={{ danger: v === 2 }}
            okText={v === 2 ? "删除记录" : error ? "重试" : "保存"}
            onOk={save}
            destroyOnHidden
            styles={{ body: { maxHeight: "55vh", overflowY: "auto" } }}
          >
            {v === 1 ? (
              <Form
                name={`demo-${id}-${v}`}
                form={form}
                layout="vertical"
                initialValues={{ name: value }}
              >
                <Form.Item
                  label="客户名称"
                  name="name"
                  rules={[{ required: true, message: "请输入客户名称" }]}
                >
                  <Input onChange={(e) => setValue(e.target.value)} />
                </Form.Item>
              </Form>
            ) : v === 2 ? (
              <p>将删除这条演示记录，此操作不可撤销。</p>
            ) : v === 3 ? (
              <div className="stack">
                {Array.from({ length: 15 }, (_, i) => (
                  <p key={i}>
                    {i + 1}.
                    与客户确认合作范围和交付计划，记录业务需求与后续行动。
                  </p>
                ))}
              </div>
            ) : (
              <p>
                客户：{value}。
                {v === 4
                  ? "首次保存将模拟失败，可在原处重试。"
                  : "请核对信息后继续。"}
              </p>
            )}
            {error && (
              <Alert style={{ marginTop: 16 }} type="error" title={error} />
            )}
          </Modal>
        </>
      );
    case "drawer":
      return (
        <>
          <Button onClick={() => setOpen(true)}>
            {v === 0 ? "查看客户详情" : "编辑客户资料"}
          </Button>
          <Drawer
            title={v === 0 ? "客户详情" : "编辑客户"}
            open={open}
            onClose={() => setOpen(false)}
            size={480}
            extra={
              v === 1 ? (
                <Button type="primary" onClick={save}>
                  保存
                </Button>
              ) : undefined
            }
          >
            {v === 0 ? (
              <div className="stack">
                <h3>Sagara Retail</h3>
                <p>联系人：Andi Pratama</p>
                <p>所在城市：Jakarta</p>
                <p>合作状态：合作中</p>
              </div>
            ) : (
              <Form
                name={`demo-${id}-${v}`}
                form={form}
                layout="vertical"
                initialValues={{ name: value }}
              >
                <Form.Item
                  name="name"
                  label="客户名称"
                  rules={[{ required: true, message: "请输入客户名称" }]}
                >
                  <Input onChange={(e) => setValue(e.target.value)} />
                </Form.Item>
              </Form>
            )}
          </Drawer>
        </>
      );
    case "popconfirm":
      return (
        <Popconfirm
          title={v === 0 ? "确认归档这条记录？" : "确认删除这条记录？"}
          description={
            v === 0 ? "归档后仍可在归档列表查看。" : "删除后无法恢复。"
          }
          icon={null}
          onConfirm={() => message.success(v === 0 ? "已归档" : "已删除")}
          okText={v === 0 ? "归档" : "删除"}
          okButtonProps={{ danger: v === 1 }}
        >
          <Button danger={v === 1}>{v === 0 ? "归档记录" : "删除记录"}</Button>
        </Popconfirm>
      );
    case "popover":
      return (
        <Popover
          trigger={v === 0 ? "click" : ["hover", "focus"]}
          title="Maya Putri"
          content={
            <div>
              <p>客户运营负责人</p>
              <p className="muted">maya@example.com</p>
            </div>
          }
        >
          <Button>{v === 0 ? "点击查看名片" : "悬停或聚焦查看名片"}</Button>
        </Popover>
      );
    case "tooltip":
      return (
        <Tooltip title="客户资料只保存在当前浏览器中">
          <Button
            type={v === 0 ? "default" : "text"}
            icon={
              v === 1 ? <InfoCircleOutlined aria-hidden="true" /> : undefined
            }
            aria-label="查看提示"
          >
            {v === 0 ? "悬停或聚焦查看提示" : undefined}
          </Button>
        </Tooltip>
      );
    case "progress":
      return (
        <div className="stack">
          <Progress percent={progress} type={v === 1 ? "circle" : "line"} />
          <Space>
            <Button
              disabled={progress === 0}
              onClick={() => setProgress(Math.max(0, progress - 10))}
            >
              减少
            </Button>
            <Button
              disabled={progress === 100}
              onClick={() => setProgress(Math.min(100, progress + 10))}
            >
              增加
            </Button>
          </Space>
          {v === 1 && <Progress percent={70} status="exception" />}
        </div>
      );
    case "skeleton":
      return (
        <div className="stack">
          <Switch
            checked={loading}
            onChange={setLoading}
            checkedChildren="显示内容"
            unCheckedChildren="显示骨架"
          />
          {v === 0 ? (
            <Skeleton loading={!loading} active avatar>
              <p>客户资料已加载：Sagara Retail</p>
            </Skeleton>
          ) : (
            <Card loading={!loading} title="客户信息">
              Sagara Retail · Jakarta
            </Card>
          )}
        </div>
      );
    case "spin":
      return v === 0 ? (
        <Space>
          <Spin size="small" />
          <Spin />
          <Spin size="large" />
        </Space>
      ) : (
        <div className="stack">
          <Switch
            checked={!loading}
            onChange={(x) => setLoading(!x)}
            checkedChildren="加载中"
            unCheckedChildren="已加载"
          />
          <Spin spinning={!loading} description="加载客户资料">
            <div className="demo-block" style={{ minHeight: 120 }}>
              客户内容区域
            </div>
          </Spin>
        </div>
      );
    case "result":
      return (
        <Result
          status={v === 0 || open ? "success" : "error"}
          title={v === 0 || open ? "操作成功" : "操作未完成"}
          subTitle={
            v === 0 || open
              ? "客户资料已更新，可以继续下一步。"
              : "这是失败状态演示，可点击重试切换为成功状态。"
          }
          extra={
            v === 0 ? (
              <Button onClick={() => message.info("已返回")}>返回</Button>
            ) : (
              <Button type="primary" onClick={() => setOpen(true)}>
                重试
              </Button>
            )
          }
        >
          {open && <Alert type="success" title="重试成功，资料已更新" />}
        </Result>
      );
    case "tour":
      return (
        <>
          <Space wrap>
            <Button ref={first} icon={<PlusOutlined aria-hidden="true" />}>
              新建客户
            </Button>
            <Button ref={second}>筛选条件</Button>
            <Button ref={third} icon={<SettingOutlined aria-hidden="true" />}>
              显示设置
            </Button>
          </Space>
          <div style={{ marginTop: 20 }}>
            <Button type="primary" onClick={() => setOpen(true)}>
              开始引导
            </Button>
          </div>
          <Tour
            open={open}
            onClose={() => setOpen(false)}
            steps={[
              {
                title: "创建客户",
                description: "在这里添加客户资料。",
                target: () => first.current!,
              },
              {
                title: "筛选客户",
                description: "通过城市、状态等条件筛选。",
                target: () => second.current!,
              },
              ...(v === 0
                ? [
                    {
                      title: "显示设置",
                      description: "按需调整表格列与密度。",
                      target: () => third.current!,
                    },
                  ]
                : []),
            ]}
          />
        </>
      );
    default:
      throw new Error(`Unknown feedback demo: ${id}`);
  }
}
