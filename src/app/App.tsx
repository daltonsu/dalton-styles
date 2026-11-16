import { lazy, Suspense, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Result, Spin } from "antd";
import Home from "../pages/Home";
const Catalog = lazy(() => import("../pages/Catalog"));
const Workspace = lazy(() => import("../pages/Workspace"));
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname === "/") document.title = "Dalton Styles";
  }, [pathname]);
  return (
    <Suspense
      fallback={
        <div className="page-loading">
          <Spin />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/components"
          element={<Navigate to="/components/button" replace />}
        />
        <Route path="/components/:id" element={<Catalog />} />
        <Route path="/examples/*" element={<Workspace />} />
        <Route
          path="*"
          element={
            <Result
              status="404"
              title="页面不存在"
              extra={<Link to="/">返回首页</Link>}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}
