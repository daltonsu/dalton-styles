import {
  App,
  Button,
  Drawer,
  Input,
  Progress,
  Radio,
  Segmented,
  Switch,
  Tag,
} from "antd";
import {
  ArrowRightOutlined,
  CheckOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { Fragment, useRef, type CSSProperties } from "react";
import { usePreferences } from "../app/Preferences";
import {
  appearancePalettes,
  themePresets,
  type CornerRadius,
} from "../app/theme";

export function GlobalSettings() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const {
    preferences,
    preset,
    storageError,
    settingsOpen,
    setSettingsOpen,
    updatePreferences,
    resetPreferences,
  } = usePreferences();
  const { message } = App.useApp();
  const close = () => setSettingsOpen(false);
  return (
    <>
      {isHome && (
        <button
          className="global-settings-trigger"
          style={{ visibility: settingsOpen ? "hidden" : undefined }}
          aria-label="打开全局设置"
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <DownOutlined aria-hidden="true" />
        </button>
      )}
      <Drawer
        rootClassName={`global-settings-drawer ${isHome ? "global-settings-home" : ""}`}
        rootStyle={isHome ? { top: "var(--site-header-height)" } : undefined}
        zIndex={isHome ? 40 : 10}
        placement="top"
        size={
          isHome
            ? "calc(100dvh - var(--site-header-height) - 90px)"
            : "calc(100dvh - 90px)"
        }
        open={settingsOpen}
        onClose={close}
        focusable={{ trap: true, focusTriggerAfterClose: false }}
        afterOpenChange={(open) => {
          if (open) closeButtonRef.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const last = event.currentTarget.querySelector<HTMLButtonElement>(
            ".global-settings-reset",
          );
          if (event.shiftKey && event.target === closeButtonRef.current) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && event.target === last) {
            event.preventDefault();
            closeButtonRef.current?.focus({ preventScroll: true });
          }
        }}
        closable={false}
        destroyOnHidden
        title={
          <span className="global-settings-title">
            <span>DALTON STYLES</span>全局设置
          </span>
        }
        extra={
          <button
            ref={closeButtonRef}
            className="global-settings-trigger global-settings-close"
            onClick={close}
            aria-label="收起全局设置"
            aria-expanded="true"
          >
            <UpOutlined aria-hidden="true" />
          </button>
        }
      >
        <div className="global-settings-content">
          <div className="global-settings-grid">
            <div className="global-settings-controls">
              <section
                className="global-setting-section"
                aria-labelledby="theme-color-heading"
              >
                <div className="global-setting-heading">
                  <span>01</span>
                  <div>
                    <h2 id="theme-color-heading">主题配色</h2>
                    <p>应用到组件库和所有页面样例，刷新后仍保留。</p>
                  </div>
                </div>
                <Radio.Group
                  className="theme-options"
                  value={preferences.themeId}
                  onChange={(event) =>
                    updatePreferences({ themeId: event.target.value })
                  }
                  aria-labelledby="theme-color-heading"
                >
                  {(["light", "dark"] as const).map((mode) => (
                    <Fragment key={mode}>
                      <div className="theme-mode-label">
                        {mode === "light" ? "浅色主题" : "暗色主题"}
                      </div>
                      {themePresets
                        .filter((item) => item.mode === mode)
                        .map((item) => (
                          <Radio
                            value={item.id}
                            key={item.id}
                            className="theme-option"
                            data-mode={item.mode}
                            style={
                              {
                                "--option-primary": item.primary,
                                "--option-bg":
                                  appearancePalettes[item.mode].surface,
                                "--option-text":
                                  appearancePalettes[item.mode].text,
                                "--option-muted":
                                  appearancePalettes[item.mode].secondary,
                                "--option-border":
                                  appearancePalettes[item.mode].border,
                              } as CSSProperties
                            }
                          >
                            <span
                              className="theme-option-colors"
                              aria-hidden="true"
                            >
                              <i style={{ background: item.primary }} />
                              <i style={{ background: item.navigation }} />
                              <i
                                style={{
                                  background:
                                    appearancePalettes[item.mode].layout,
                                }}
                              />
                            </span>
                            <span className="theme-option-name">
                              {item.name}
                              {preferences.themeId === item.id && (
                                <CheckOutlined aria-hidden="true" />
                              )}
                            </span>
                            <span className="theme-option-code">
                              {item.primary.toUpperCase()}
                            </span>
                          </Radio>
                        ))}
                    </Fragment>
                  ))}
                </Radio.Group>
                <p className="theme-description" aria-live="polite">
                  {preset.description}
                </p>
              </section>
              <section
                className="global-setting-section"
                aria-labelledby="corner-heading"
              >
                <div className="global-setting-heading">
                  <span>02</span>
                  <div>
                    <h2 id="corner-heading">控件圆角</h2>
                    <p>为按钮、输入框和卡片选择合适的轮廓。</p>
                  </div>
                </div>
                <Segmented
                  block
                  aria-labelledby="corner-heading"
                  value={preferences.radius}
                  onChange={(value) =>
                    updatePreferences({ radius: value as CornerRadius })
                  }
                  options={[
                    { value: 2, label: "利落 · 2px" },
                    { value: 6, label: "默认 · 6px" },
                    { value: 12, label: "圆润 · 12px" },
                  ]}
                />
              </section>
              <section
                className="global-setting-section global-motion-setting"
                aria-labelledby="motion-heading"
              >
                <div className="global-setting-heading">
                  <span>03</span>
                  <div>
                    <h2 id="motion-heading">减少动画</h2>
                    <p>关闭过渡动效，让操作更直接。未开启时跟随系统偏好。</p>
                  </div>
                </div>
                <Switch
                  aria-label="减少动画"
                  checked={preferences.reduceMotion}
                  onChange={(reduceMotion) =>
                    updatePreferences({ reduceMotion })
                  }
                />
              </section>
            </div>
            <aside
              className="global-settings-preview"
              aria-label="当前外观预览"
            >
              <div className="preview-caption">
                <span>实时预览</span>
                <span>
                  {preset.name} / {preferences.radius}px
                </span>
              </div>
              <div className="appearance-preview">
                <div className="appearance-preview-nav" aria-hidden="true">
                  <strong>
                    d<span>.</span>
                  </strong>
                  <i />
                  <i />
                  <i />
                </div>
                <div className="appearance-preview-body">
                  <div className="appearance-preview-heading">
                    <span>你的工作空间</span>
                    <Tag color="success">进行中</Tag>
                  </div>
                  <h3>每一个细节，恰到好处。</h3>
                  <p>熟悉的组件，换一种表达。</p>
                  <div className="appearance-preview-card">
                    <span>本周进度</span>
                    <strong>
                      68<small>%</small>
                    </strong>
                    <Progress
                      percent={68}
                      showInfo={false}
                      strokeColor={preset.primary}
                    />
                  </div>
                  <label
                    className="appearance-preview-label"
                    htmlFor="appearance-preview-input"
                  >
                    项目名称
                  </label>
                  <Input
                    id="appearance-preview-input"
                    placeholder="输入一点灵感…"
                    allowClear
                  />
                  <div className="appearance-preview-actions">
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined aria-hidden="true" />}
                      onClick={() =>
                        message.success("这就是当前主题的操作反馈。")
                      }
                    >
                      体验主题
                    </Button>
                    <Button
                      onClick={() => message.info("默认按钮也会跟随全局外观。")}
                    >
                      默认按钮
                    </Button>
                  </div>
                </div>
              </div>
              <p className="preview-help">
                即时生效，随时可恢复默认。演示数据不会受影响。
              </p>
            </aside>
          </div>
          <div className="global-settings-actions">
            {storageError && (
              <p role="status" className="settings-save-error">
                浏览器暂时无法保存，设置仅在本次访问中生效。
              </p>
            )}
            <Button
              type="text"
              size="small"
              className="global-settings-reset"
              icon={<ReloadOutlined aria-hidden="true" />}
              onClick={resetPreferences}
            >
              恢复默认
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
