import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ConfigProvider, theme as antTheme, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  createTheme,
  appearancePalettes,
  defaultPreferences,
  normalizePreferences,
  preferencesKey,
  themePresets,
  type Preferences,
} from "./theme";

const PreferencesContext = createContext<{
  preferences: Preferences;
  preset: (typeof themePresets)[number];
  appearance: (typeof appearancePalettes)[keyof typeof appearancePalettes];
  activeTheme: ThemeConfig;
  reducedMotion: boolean;
  storageError: boolean;
  settingsOpen: boolean;
  pageScrollOffset: number;
  setSettingsOpen: (open: boolean) => void;
  updatePreferences: (value: Partial<Preferences>) => void;
  resetPreferences: () => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      return normalizePreferences(
        JSON.parse(localStorage.getItem(preferencesKey) ?? "null"),
      );
    } catch {
      return { ...defaultPreferences };
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef<HTMLElement | null>(null);
  const settingsWasOpen = useRef(false);
  const [pageScrollOffset, setPageScrollOffset] = useState(0);
  const [storageError, setStorageError] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (settingsOpen) {
      settingsWasOpen.current = true;
      return;
    }
    if (!settingsWasOpen.current) return;
    const frame = requestAnimationFrame(() => {
      settingsTriggerRef.current?.focus({ preventScroll: true });
      settingsWasOpen.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [settingsOpen]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [preferences]);
  const preset = themePresets.find((item) => item.id === preferences.themeId)!;
  const appearance = appearancePalettes[preset.mode];
  const reducedMotion = preferences.reduceMotion || systemReducedMotion;
  const activeTheme = useMemo(
    () => createTheme(preferences, reducedMotion),
    [preferences, reducedMotion],
  );
  const tokens = useMemo(
    () => antTheme.getDesignToken(activeTheme),
    [activeTheme],
  );
  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables = {
      "--theme-primary": tokens.colorPrimary,
      "--theme-navigation": preset.navigation,
      "--theme-navigation-accent": preset.navigationAccent,
      "--theme-selected": preset.selected,
      "--theme-ink":
        preset.mode === "dark" ? preset.navigationAccent : preset.navigation,
      ...Object.fromEntries(
        Object.entries(appearance).map(([key, value]) => [
          `--ui-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
          value,
        ]),
      ),
      "--control-radius": `${preferences.radius}px`,
      "--panel-radius": `${preferences.radius + 4}px`,
    };
    Object.entries(variables).forEach(([key, value]) =>
      root.style.setProperty(key, value),
    );
    root.dataset.theme = preset.id;
    root.dataset.mode = preset.mode;
    root.style.colorScheme = preset.mode;
    root.dataset.reducedMotion = String(reducedMotion);
  }, [preset, appearance, tokens, preferences.radius, reducedMotion]);
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        preset,
        appearance,
        activeTheme,
        reducedMotion,
        storageError,
        settingsOpen,
        pageScrollOffset,
        setSettingsOpen: (open) => {
          if (open) {
            settingsTriggerRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            setPageScrollOffset(window.scrollY);
          }
          setSettingsOpen(open);
        },
        updatePreferences: (value) =>
          setPreferences((current) =>
            normalizePreferences({ ...current, ...value }),
          ),
        resetPreferences: () => setPreferences({ ...defaultPreferences }),
      }}
    >
      <ConfigProvider
        button={{ autoInsertSpace: false }}
        theme={activeTheme}
        locale={zhCN}
      >
        {children}
      </ConfigProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("PreferencesProvider missing");
  return context;
}
