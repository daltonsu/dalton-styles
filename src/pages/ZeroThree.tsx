import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  WorkspaceSidebar,
  workspaceLinks,
} from "../components/WorkspaceSidebar";

export default function ZeroThree() {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    document.title = "零三 · Dalton Styles";
  }, []);
  if (!workspaceLinks.some((item) => item.key === section)) {
    return <Navigate to="/examples/03" replace />;
  }
  return (
    <div
      className={`workspace-shell sidebar-preview ${collapsed ? "workspace-collapsed" : ""}`}
    >
      <aside className="workspace-sidebar" aria-label="零三侧边栏">
        <WorkspaceSidebar
          selectedKey={section}
          collapsed={collapsed}
          onSelect={(key) => navigate(`/examples/03/${key}`)}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>
      <main className="sidebar-preview-canvas" aria-label="零三预览" />
    </div>
  );
}
