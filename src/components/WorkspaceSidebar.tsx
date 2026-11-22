import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Menu } from "antd";
import {
  AppstoreOutlined,
  BuildOutlined,
  LeftOutlined,
  LogoutOutlined,
  RightOutlined,
  SettingOutlined,
  TeamOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Brand } from "./Brand";
import { usePreferences } from "../app/Preferences";

export const workspaceLinks = [
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
type Props = {
  selectedKey: string;
  collapsed: boolean;
  customerCount?: number;
  onSelect: (key: string) => void;
  onToggle: () => void;
  onAccountAction?: () => HTMLElement | null | void;
};

export function WorkspaceSidebar({
  selectedKey,
  collapsed,
  customerCount,
  onSelect,
  onToggle,
  onAccountAction,
}: Props) {
  const navigate = useNavigate();
  const { setSettingsOpen } = usePreferences();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <div className="workspace-brand">
        <Brand caption="WORKSPACE" />
      </div>
      <button
        type="button"
        className="workspace-collapse"
        aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
        title={collapsed ? "展开侧栏" : "收起侧栏"}
        aria-expanded={!collapsed}
        onClick={() => {
          setAccountOpen(false);
          onToggle();
        }}
      >
        {collapsed ? (
          <RightOutlined aria-hidden="true" />
        ) : (
          <LeftOutlined aria-hidden="true" />
        )}
      </button>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        items={workspaceLinks.map((item) => ({
          ...item,
          label: (
            <span>
              {item.label}
              {item.key === "customers" && customerCount !== undefined && (
                <small className="nav-count">{customerCount}</small>
              )}
            </span>
          ),
        }))}
        onClick={({ key }) => onSelect(key)}
      />
      <div className="workspace-user">
        <Dropdown
          trigger={["click"]}
          placement="topLeft"
          open={accountOpen}
          onOpenChange={setAccountOpen}
          classNames={{ root: "workspace-account-popup" }}
          styles={collapsed ? { root: { minWidth: 176 } } : undefined}
          popupRender={(menu) => (
            <div
              ref={(node) => {
                if (accountOpen) {
                  node
                    ?.querySelector<HTMLElement>('[role="menuitem"]')
                    ?.focus({ preventScroll: true });
                }
              }}
            >
              {menu}
            </div>
          )}
          menu={{
            "aria-label": "账号菜单",
            onKeyDown: (event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setAccountOpen(false);
                accountRef.current?.focus();
              }
            },
            items: [
              {
                key: "settings",
                icon: <SettingOutlined aria-hidden="true" />,
                label: "设置",
              },
              { type: "divider" },
              {
                key: "logout",
                icon: <LogoutOutlined aria-hidden="true" />,
                label: "退出登录",
                danger: true,
              },
            ],
            onClick: ({ key }) => {
              setAccountOpen(false);
              accountRef.current?.focus();
              const returnFocusTarget = onAccountAction?.();
              if (key === "settings")
                setSettingsOpen(true, returnFocusTarget || accountRef.current);
              else if (key === "logout") navigate("/");
            },
          }}
        >
          <button
            ref={accountRef}
            type="button"
            className="workspace-account-trigger"
            aria-label="Dalton 账号菜单"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                setAccountOpen(true);
              }
            }}
          >
            <Avatar className="theme-avatar" aria-hidden="true">
              DS
            </Avatar>
            <span className="workspace-account-name">Dalton</span>
            <UpOutlined
              className="workspace-account-chevron"
              aria-hidden="true"
            />
          </button>
        </Dropdown>
      </div>
    </>
  );
}
