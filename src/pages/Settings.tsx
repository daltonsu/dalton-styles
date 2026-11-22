import { App, Button, Card, Select } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useWorkspace } from "../domain/Store";
import { customersCsv, demoDate } from "../domain/model";
import { downloadText } from "../catalog/demos/shared";
import { usePreferences } from "../app/Preferences";
import { formatDate } from "../domain/date";
export default function Settings() {
  const { data, setData, reset } = useWorkspace();
  const { modal, message } = App.useApp();
  const { preset, preferences, reducedMotion, setSettingsOpen } =
    usePreferences();
  return (
    <>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="设置分组">
          {[
            ["appearance", "外观与显示"],
            ["regional", "地区与格式"],
            ["demo-data", "数据管理"],
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
            <Setting
              label="视觉主题"
              note={`当前配色：${preset.name} · 控件圆角 ${preferences.radius}px`}
            >
              <Button onClick={() => setSettingsOpen(true)}>
                调整全局外观
              </Button>
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
            <Setting
              label="减少动画"
              note="可在全局设置中调整，同时遵循系统偏好。"
            >
              <span className="muted">
                {reducedMotion ? "已开启" : "跟随系统"}
              </span>
            </Setting>
          </Card>
          <Card id="regional" title="地区与格式">
            <Setting label="币种与数字" note="金额使用印尼盾，不显示小数。">
              <code>IDR · id-ID</code>
            </Setting>
            <Setting label="统计基准日期" note="跟进和统计使用的固定基准日期。">
              <code>{formatDate(demoDate, preferences.dateFormat)}</code>
            </Setting>
            <Setting label="界面语言" note="统一使用简体中文。">
              <span>简体中文</span>
            </Setting>
          </Card>
          <Card id="demo-data" title="数据管理">
            <Setting
              label="导出客户"
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
              label="恢复初始数据"
              note="替换客户和商机数据，保留显示偏好。"
            >
              <Button
                danger
                icon={<ReloadOutlined aria-hidden="true" />}
                onClick={() =>
                  modal.confirm({
                    title: "恢复初始数据？",
                    content:
                      "当前客户修改和商机阶段将被初始数据替换，显示偏好保留。",
                    icon: null,
                    okText: "恢复初始数据",
                    okButtonProps: { danger: true },
                    autoFocusButton: "cancel",
                    onOk: () => {
                      reset();
                      message.success("已恢复初始数据");
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
