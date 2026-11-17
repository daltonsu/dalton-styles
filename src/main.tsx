import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntApp } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { HashRouter } from "react-router-dom";
import App from "./app/App";
import { PreferencesProvider } from "./app/Preferences";
import "./styles.css";
import "./global-settings.css";
dayjs.locale("zh-cn");
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PreferencesProvider>
      <AntApp>
        <HashRouter>
          <App />
        </HashRouter>
      </AntApp>
    </PreferencesProvider>
  </React.StrictMode>,
);
