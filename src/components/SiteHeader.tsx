import { Button } from "antd";
import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
export function SiteHeader({
  section,
  brandCaption,
  current,
  onMenu,
  children,
}: {
  section: string;
  brandCaption: string;
  current: string;
  onMenu: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="site-header">
      <div className="header-left">
        <div className="mobile-header-brand">
          <Brand caption={brandCaption} />
        </div>
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
      {children && <div className="header-right">{children}</div>}
    </header>
  );
}
