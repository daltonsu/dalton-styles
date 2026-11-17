import { Brand } from "./Brand";
import { usePreferences } from "../app/Preferences";

export function HomeHeader() {
  const { settingsOpen } = usePreferences();
  return (
    <header
      className={`home-header ${settingsOpen ? "home-header-settings-open" : ""}`}
      inert={settingsOpen}
    >
      <Brand />
    </header>
  );
}
