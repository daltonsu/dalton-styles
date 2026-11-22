import { lazy, Suspense, useEffect, type CSSProperties } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Result, Spin } from "antd";
import Home from "../pages/Home";
import { GlobalSettings } from "../components/GlobalSettings";
import { usePreferences } from "./Preferences";
import { HomeHeader } from "../components/HomeHeader";
const Catalog = lazy(() => import("../pages/Catalog"));
const Workspace = lazy(() => import("../pages/Workspace"));
const ZeroThree = lazy(() => import("../pages/ZeroThree"));
export default function App() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { settingsOpen, pageScrollOffset } = usePreferences();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname === "/") document.title = "Dalton Styles";
  }, [pathname]);
  return (
    <>
      <GlobalSettings />
      {isHome && <HomeHeader />}
      <div
        className={`app-page ${isHome ? "app-page-home" : ""} ${settingsOpen ? "app-page-open" : ""}`}
        inert={settingsOpen}
        style={
          { "--page-scroll-offset": `${pageScrollOffset}px` } as CSSProperties
        }
      >
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
            <Route
              path="/components/range-picker"
              element={<Navigate to="/components/date-picker" replace />}
            />
            <Route path="/components/:id" element={<Catalog />} />
            <Route path="/examples/03/:section?" element={<ZeroThree />} />
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
      </div>
    </>
  );
}
