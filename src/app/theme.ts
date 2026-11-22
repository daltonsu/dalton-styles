import { theme as antTheme, type ThemeConfig } from "antd";
import { dateFormats, weekStartOptions, type DateFormat } from "../domain/date";
export const themePresets = [
  {
    id: "clay",
    mode: "light",
    name: "陶土橙",
    description: "温暖、沉静，原来的 Dalton 风格。",
    primary: "#b64c32",
    navigation: "#203c33",
    navigationSelected: "#365448",
    navigationAccent: "#d99670",
    selected: "#e9f0eb",
    chartColors: [
      "#b66a4d",
      "#315e49",
      "#b59b62",
      "#8e789e",
      "#9baf9c",
      "#ccaaa0",
    ],
  },
  {
    id: "forest",
    mode: "light",
    name: "森林绿",
    description: "自然、克制，让内容成为焦点。",
    primary: "#2c6a4b",
    navigation: "#1f3930",
    navigationSelected: "#365b47",
    navigationAccent: "#b0c997",
    selected: "#eaf3ec",
    chartColors: [
      "#2c6a4b",
      "#76945d",
      "#b59b62",
      "#5d8b85",
      "#a8bc99",
      "#c4b692",
    ],
  },
  {
    id: "blue",
    mode: "light",
    name: "静谧蓝",
    description: "清晰、专注，适合日常工作。",
    primary: "#315db6",
    navigation: "#223650",
    navigationSelected: "#344f75",
    navigationAccent: "#a9c2f4",
    selected: "#eaf0fc",
    chartColors: [
      "#315db6",
      "#3f829e",
      "#9b87b8",
      "#6e9db4",
      "#a6b9dd",
      "#b4c9d3",
    ],
  },
  {
    id: "violet",
    mode: "light",
    name: "暮色紫",
    description: "柔和、细腻，带一点不同。",
    primary: "#7554a3",
    navigation: "#352c45",
    navigationSelected: "#514263",
    navigationAccent: "#cbb8ed",
    selected: "#f1ecf8",
    chartColors: [
      "#7554a3",
      "#54779c",
      "#b88ca7",
      "#9b8860",
      "#b5a4cb",
      "#a8bcc8",
    ],
  },
  {
    id: "clay-dark",
    mode: "dark",
    name: "暗夜橙",
    description: "深色底上的温暖陶土色，柔和而清晰。",
    primary: "#e29678",
    navigation: "#17241f",
    navigationSelected: "#3e4031",
    navigationAccent: "#efb08c",
    selected: "#342924",
    chartColors: [
      "#e29678",
      "#83b39b",
      "#c9b271",
      "#bb9ace",
      "#90aa97",
      "#c8a598",
    ],
  },
  {
    id: "forest-dark",
    mode: "dark",
    name: "暗夜绿",
    description: "沉静的森林绿，为夜间工作留一点呼吸。",
    primary: "#7bb995",
    navigation: "#13251d",
    navigationSelected: "#2c4b38",
    navigationAccent: "#b5d7a0",
    selected: "#24372c",
    chartColors: [
      "#7bb995",
      "#b5c78e",
      "#d1b681",
      "#7db9b0",
      "#a8c6b3",
      "#c7b5a0",
    ],
  },
  {
    id: "blue-dark",
    mode: "dark",
    name: "暗夜蓝",
    description: "深蓝与柔和高光，让夜间界面保持专注。",
    primary: "#8caff0",
    navigation: "#162131",
    navigationSelected: "#2c4568",
    navigationAccent: "#aecbff",
    selected: "#243248",
    chartColors: [
      "#8caff0",
      "#7ebacb",
      "#b39bd1",
      "#9cc2d6",
      "#b7c9ed",
      "#a3b9c8",
    ],
  },
  {
    id: "violet-dark",
    mode: "dark",
    name: "暗夜紫",
    description: "柔和的紫色点缀，适合安静的深色工作空间。",
    primary: "#b69adf",
    navigation: "#231c30",
    navigationSelected: "#49395c",
    navigationAccent: "#d4b7f4",
    selected: "#32283f",
    chartColors: [
      "#b69adf",
      "#8bafd1",
      "#d4a1bc",
      "#c5b18c",
      "#c9b9e2",
      "#a6c6cd",
    ],
  },
] as const;
export const appearancePalettes = {
  light: {
    layout: "#f6f5f1",
    canvas: "#fcfcfa",
    surface: "#ffffff",
    elevated: "#ffffff",
    subtle: "#f8f9f6",
    backdrop: "#e4e8df",
    text: "#25352f",
    secondary: "#617069",
    muted: "#849181",
    border: "#e4e7e0",
    borderStrong: "#cbd2ca",
    onAccent: "#ffffff",
    success: "#2c6a4b",
    successBg: "#eaf3ec",
    successBorder: "#c6decd",
    warning: "#91600e",
    warningBg: "#fcf3df",
    warningBorder: "#e4d4ac",
    error: "#b43c3c",
    errorBg: "#fcecec",
    errorBorder: "#efc4c4",
    info: "#6a5686",
    infoBg: "#f0ebf6",
    infoBorder: "#d7c9e6",
  },
  dark: {
    layout: "#13171c",
    canvas: "#191e25",
    surface: "#20262e",
    elevated: "#29323d",
    subtle: "#252d36",
    backdrop: "#0d1116",
    text: "#e6eaf0",
    secondary: "#adb8c6",
    muted: "#93a1b2",
    border: "#37424f",
    borderStrong: "#536173",
    onAccent: "#10151c",
    success: "#8ec9a4",
    successBg: "#23382d",
    successBorder: "#3e634d",
    warning: "#e0bf7a",
    warningBg: "#3b3220",
    warningBorder: "#6c5830",
    error: "#ed9b97",
    errorBg: "#402a2e",
    errorBorder: "#70464d",
    info: "#bda5dd",
    infoBg: "#332c42",
    infoBorder: "#5b4b73",
  },
} as const;
export type ThemeId = (typeof themePresets)[number]["id"];
export type CornerRadius = 2 | 6 | 12;
export interface Preferences {
  themeId: ThemeId;
  radius: CornerRadius;
  reduceMotion: boolean;
  weekStartsOn: (typeof weekStartOptions)[number];
  dateFormat: DateFormat;
}
export const preferencesKey = "dalton-styles:preferences:v1";
export const defaultPreferences: Preferences = {
  themeId: "clay",
  radius: 6,
  reduceMotion: false,
  weekStartsOn: 1,
  dateFormat: "DD/MM/YYYY",
};
export function normalizePreferences(value: unknown): Preferences {
  const saved =
    value && typeof value === "object" ? (value as Partial<Preferences>) : {};
  return {
    themeId: themePresets.some((preset) => preset.id === saved.themeId)
      ? saved.themeId!
      : defaultPreferences.themeId,
    radius: [2, 6, 12].includes(saved.radius as number)
      ? saved.radius!
      : defaultPreferences.radius,
    reduceMotion: saved.reduceMotion === true,
    weekStartsOn:
      weekStartOptions.find((day) => day === saved.weekStartsOn) ??
      defaultPreferences.weekStartsOn,
    dateFormat:
      dateFormats.find((format) => format === saved.dateFormat) ??
      defaultPreferences.dateFormat,
  };
}
export const palette = {
  clay: "#b64c32",
  forest: "#203c33",
  background: "#f6f5f1",
  border: "#e4e7e0",
  text: "#25352f",
  secondary: "#617069",
};
export const theme: ThemeConfig = {
  token: {
    colorPrimary: palette.clay,
    colorSuccess: "#2c6a4b",
    colorWarning: "#91600e",
    colorError: "#b43c3c",
    colorInfo: "#6a5686",
    colorSuccessBg: "#eaf3ec",
    colorSuccessBorder: "#c6decd",
    colorWarningBg: "#fcf3df",
    colorWarningBorder: "#e4d4ac",
    colorErrorBg: "#fcecec",
    colorErrorBorder: "#efc4c4",
    colorInfoBg: "#f0ebf6",
    colorInfoBorder: "#d7c9e6",
    colorText: palette.text,
    colorTextSecondary: palette.secondary,
    colorBgLayout: palette.background,
    colorBorder: "#cbd2ca",
    colorBorderSecondary: palette.border,
    borderRadius: 6,
    fontSize: 14,
    controlHeight: 32,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Button: { primaryShadow: "none" },
    Menu: {
      itemSelectedBg: "#e9f0eb",
      itemSelectedColor: palette.forest,
      itemBorderRadius: 6,
      darkItemBg: palette.forest,
      darkSubMenuItemBg: "#1c352d",
      darkItemSelectedBg: "#365448",
      darkItemSelectedColor: "#fff",
    },
    Card: { borderRadiusLG: 10 },
    Table: {
      headerBg: "#f8f9f6",
      headerColor: "#617069",
      cellPaddingBlock: 14,
    },
    Modal: { borderRadiusLG: 12 },
    Layout: {
      bodyBg: palette.background,
      headerBg: "#fff",
      siderBg: palette.forest,
    },
  },
};
export function createTheme(
  preferences: Preferences,
  reduceMotion: boolean,
): ThemeConfig {
  const preset = themePresets.find((item) => item.id === preferences.themeId)!;
  const appearance = appearancePalettes[preset.mode];
  return {
    ...theme,
    algorithm:
      preset.mode === "dark"
        ? antTheme.darkAlgorithm
        : antTheme.defaultAlgorithm,
    token: {
      ...theme.token,
      colorPrimary: preset.primary,
      colorBgBase: preset.mode === "dark" ? appearance.layout : "#ffffff",
      colorBgLayout: appearance.layout,
      colorBgContainer: appearance.surface,
      colorBgElevated: appearance.elevated,
      colorText: appearance.text,
      colorTextSecondary: appearance.secondary,
      colorTextTertiary: appearance.muted,
      colorTextLightSolid: appearance.onAccent,
      colorBorder: appearance.borderStrong,
      colorBorderSecondary: appearance.border,
      colorSuccess: appearance.success,
      colorSuccessBg: appearance.successBg,
      colorSuccessBorder: appearance.successBorder,
      colorWarning: appearance.warning,
      colorWarningBg: appearance.warningBg,
      colorWarningBorder: appearance.warningBorder,
      colorError: appearance.error,
      colorErrorBg: appearance.errorBg,
      colorErrorBorder: appearance.errorBorder,
      colorInfo: appearance.info,
      colorInfoBg: appearance.infoBg,
      colorInfoBorder: appearance.infoBorder,
      borderRadius: preferences.radius,
      // Keep the motion provider mounted so switching this preference preserves page state.
      motion: true,
      motionDurationFast: reduceMotion ? "0s" : "0.1s",
      motionDurationMid: reduceMotion ? "0s" : "0.2s",
      motionDurationSlow: reduceMotion ? "0s" : "0.3s",
    },
    components: {
      ...theme.components,
      Avatar: {
        colorTextLightSolid:
          preset.mode === "dark" ? appearance.text : "#ffffff",
      },
      Menu: {
        ...theme.components?.Menu,
        itemSelectedBg: preset.selected,
        itemSelectedColor:
          preset.mode === "dark" ? preset.navigationAccent : preset.navigation,
        itemBorderRadius: preferences.radius,
        darkItemBg: preset.navigation,
        darkSubMenuItemBg: preset.navigation,
        darkItemSelectedBg: preset.navigationSelected,
      },
      Card: {
        ...theme.components?.Card,
        borderRadiusLG: preferences.radius + 4,
      },
      Modal: {
        ...theme.components?.Modal,
        borderRadiusLG: preferences.radius + 6,
      },
      Table: {
        ...theme.components?.Table,
        headerBg: appearance.subtle,
        headerColor: appearance.secondary,
      },
      Layout: {
        ...theme.components?.Layout,
        bodyBg: appearance.layout,
        headerBg: appearance.surface,
        siderBg: preset.navigation,
      },
    },
  };
}
