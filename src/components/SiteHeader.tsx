import { Button } from "antd";
import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
export function SiteHeader({
  section,
  current,
  onMenu,
  children,
}: {
  section: string;
  current: string;
  onMenu: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="site-header">
      <div className="header-left">
        <Button
          className="mobile-nav-toggle"
          type="text"
          icon={<MenuOutlined aria-hidden="true" />}
          aria-label="打开导航"
          onClick={onMenu}
        />
        <Link className="home-link" to="/">
          <ArrowLeftOutlined aria-hidden="true" />
          <span>首页</span>
        </Link>
        <span className="crumb-divider">/</span>
        <span className="header-section">{section}</span>
        <span className="crumb-divider">/</span>
        <span className="header-current">{current}</span>
      </div>
      <div className="header-right">
        {children ?? (
          <span className="header-tech">
            <span className="status-dot" /> React + Ant Design
          </span>
        )}
      </div>
    </header>
  );
}
