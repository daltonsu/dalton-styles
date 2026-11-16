import { App, Button, Card, Select, Tag } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useWorkspace } from "../domain/Store";
import { customersCsv, demoDate } from "../domain/model";
import { downloadText } from "../catalog/demos/shared";
export default function Settings() {
  const { data, setData, reset } = useWorkspace();
  const { modal, message } = App.useApp();
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">MAKE IT YOUR WORKSPACE</span>
          <h1>项目设置</h1>
          <p>调整显示偏好，管理当前浏览器中的演示数据。</p>
        </div>
      </div>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="设置分组">
          {[
            ["appearance", "外观与显示"],
            ["regional", "地区与格式"],
            ["demo-data", "演示数据"],
          ].map(([id, label]) => (
            <Button
              key={id}
              type="text"
              onClick={() =>
                document
                  .getElementById(id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              {label}
            </Button>
          ))}
        </nav>
        <div className="stack">
          <Card id="appearance" title="外观与显示">
            <Setting label="视觉主题" note="陶土橙 × 森林绿 × 暖白">
              <Tag color="success">Dalton · 默认主题</Tag>
            </Setting>
            <Setting label="表格密度" note="改变行间距，表格正文保持 14px。">
              <Select
                aria-label="表格密度"
                value={data.density}
                onChange={(density) => setData((d) => ({ ...d, density }))}
                options={[
                  { value: "standard", label: "标准" },
                  { value: "compact", label: "紧凑" },
                ]}
                style={{ width: 150 }}
              />
            </Setting>
            <Setting label="正文与默认控件" note="正文 14px，默认控件高 32px。">
              <Link to="/components/standards">
                <Button>查看规范</Button>
              </Link>
            </Setting>
            <Setting label="减少动画" note="自动遵循系统的“减少动态效果”偏好。">
              <span className="muted">跟随系统</span>
            </Setting>
          </Card>
          <Card id="regional" title="地区与格式">
            <Setting
              label="币种与数字"
              note="保留原样例的印尼盾金额，不显示小数。"
            >
              <code>IDR · id-ID</code>
            </Setting>
            <Setting
              label="演示日期"
              note="使用固定基准日，便于复核跟进和统计。"
            >
              <code>{demoDate}</code>
            </Setting>
            <Setting label="界面语言" note="组件和样例统一使用简体中文。">
              <span>简体中文</span>
            </Setting>
          </Card>
          <Card id="demo-data" title="演示数据">
            <p className="settings-note">
              客户和商机使用模拟数据，修改保存在当前浏览器。可随时恢复初始样例。
            </p>
            <Setting
              label="导出演示客户"
              note={`当前共有 ${data.customers.length} 位客户，此处导出全部记录。`}
            >
              <Button
                icon={<DownloadOutlined aria-hidden="true" />}
                onClick={() => {
                  downloadText(
                    "dalton-customers.csv",
                    customersCsv(data.customers),
                    "text/csv;charset=utf-8",
                  );
                  message.success("已导出全部客户");
                }}
              >
                导出 CSV
              </Button>
            </Setting>
            <Setting
              label="恢复初始演示数据"
              note="替换客户和商机数据，保留显示偏好。"
            >
              <Button
                danger
                icon={<ReloadOutlined aria-hidden="true" />}
                onClick={() =>
                  modal.confirm({
                    title: "恢复初始演示数据？",
                    content:
                      "当前客户修改和商机阶段将被初始样例替换，显示偏好保留。",
                    icon: null,
                    okText: "恢复初始数据",
                    okButtonProps: { danger: true },
                    autoFocusButton: "cancel",
                    onOk: () => {
                      reset();
                      message.success("已恢复初始演示数据");
                    },
                  })
                }
              >
                恢复初始数据
              </Button>
            </Setting>
          </Card>
        </div>
      </div>
    </>
  );
}
function Setting({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div>
        <h3>{label}</h3>
        <p>{note}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
