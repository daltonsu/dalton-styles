import { test, expect } from "@playwright/test";
import { theme as antTheme } from "antd";
import {
  appearancePalettes,
  createTheme,
  defaultPreferences,
  themePresets,
} from "../src/app/theme";

const preferencesKey = "dalton-styles:preferences:v1";
const rgb = (hex: string) =>
  `rgb(${hex
    .slice(1)
    .match(/../g)!
    .map((part) => parseInt(part, 16))
    .join(", ")})`;
for (const preset of themePresets) {
  test(`${preset.name}统一应用到首页预览、组件图表和全部页面样例`, async ({
    page,
  }) => {
    const appearance = appearancePalettes[preset.mode];
    const tokens = antTheme.getDesignToken(
      createTheme({ ...defaultPreferences, themeId: preset.id }, false),
    );
    await page.goto("/");
    await page.getByRole("button", { name: "打开全局设置" }).click();
    await page.getByRole("radio", { name: new RegExp(preset.name) }).check();
    await page.getByRole("button", { name: "收起全局设置" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-mode",
      preset.mode,
    );
    await expect(page.locator(".home-header")).toHaveCSS(
      "background-color",
      rgb(appearance.canvas),
    );
    await expect(page.locator(".brand strong")).toHaveCSS(
      "color",
      rgb(appearance.text),
    );
    const suffix = preset.id === "clay" ? "" : `-${preset.id}`;
    for (const [index, name] of ["components", "workspace"].entries()) {
      const image = page.locator(".entry-thumbnail").nth(index);
      await expect(image).toHaveAttribute(
        "src",
        `/previews/${name}${suffix}.png`,
      );
      await expect
        .poll(() =>
          image.evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await page.locator("a.entry").first().click();
    await expect(
      page
        .locator('[data-example="button-0"]')
        .getByRole("button", { name: "主要按钮" }),
    ).toHaveCSS("background-color", rgb(tokens.colorPrimary));
    await page.goto("/#/components/line-chart");
    await expect(
      page.locator('[data-example="line-chart-0"] .recharts-line-curve'),
    ).toHaveAttribute("stroke", preset.chartColors[0]);
    await page.locator(".brand:visible").click();
    await page.locator("a.entry").nth(1).click();
    const sidebar = page.locator(".workspace-sidebar");
    await expect(sidebar).toHaveCSS("background-color", rgb(preset.navigation));
    await expect(page.locator(".chart-key i").first()).toHaveCSS(
      "background-color",
      rgb(preset.chartColors[0]),
    );
    await expect(
      page.locator(".recharts-bar-rectangle path").first(),
    ).toHaveAttribute("fill", preset.chartColors[0]);
    await sidebar.getByRole("menuitem", { name: /客户管理/ }).click();
    await expect(
      page.getByRole("button", { name: "新建客户", exact: true }),
    ).toHaveCSS("background-color", rgb(tokens.colorPrimary));
    await expect(
      page.locator(".customer-name-cell .ant-avatar").first(),
    ).toHaveCSS("background-color", rgb(preset.selected));
    await expect(page.locator(".ant-table-thead th").first()).toHaveCSS(
      "background-color",
      rgb(appearance.subtle),
    );
    await sidebar.getByRole("menuitem", { name: /商机看板/ }).click();
    await expect(page.locator(".pipeline-column").first()).toHaveCSS(
      "background-color",
      rgb(preset.selected),
    );
    await sidebar.getByRole("menuitem", { name: /项目设置/ }).click();
    await expect(page.locator("#appearance")).toContainText(preset.name);
    await page.reload();
    await expect(sidebar).toHaveCSS("background-color", rgb(preset.navigation));
    await expect(page.locator("#appearance")).toContainText(preset.name);
    await page.locator(".brand:visible").click();
    await expect(page.locator(".entry-thumbnail").last()).toHaveAttribute(
      "src",
      `/previews/workspace${suffix}.png`,
    );
  });
}

test("主题按明暗分为两行，实时切换保留输入且弹窗跟随暗色", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "打开全局设置" });
  const triggerBox = await trigger.boundingBox();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /全局设置/ });
  const lightOptions = dialog.locator(
    '.theme-option:has(input[data-mode="light"])',
  );
  const darkOptions = dialog.locator(
    '.theme-option:has(input[data-mode="dark"])',
  );
  await expect(lightOptions).toHaveCount(4);
  await expect(darkOptions).toHaveCount(4);
  const rows = await dialog.locator(".theme-option").evaluateAll((options) =>
    options.map((option) => {
      const box = option.getBoundingClientRect();
      return { x: box.x, y: box.y, bottom: box.bottom };
    }),
  );
  expect(new Set(rows.slice(0, 4).map((box) => box.y)).size).toBe(1);
  expect(new Set(rows.slice(4).map((box) => box.y)).size).toBe(1);
  expect(rows[4].y).toBeGreaterThan(rows[0].bottom);
  expect(rows.slice(4).map((box) => box.x)).toEqual(
    rows.slice(0, 4).map((box) => box.x),
  );
  const input = dialog.getByLabel("项目名称", { exact: true });
  await input.fill("明暗切换保留内容");
  for (const [name, mode] of [
    ["暗夜蓝", "dark"],
    ["森林绿", "light"],
    ["暗夜紫", "dark"],
  ] as const) {
    await page.getByRole("radio", { name: new RegExp(name) }).check();
    const colors = appearancePalettes[mode];
    await expect(page.locator("html")).toHaveAttribute("data-mode", mode);
    await expect(input).toHaveValue("明暗切换保留内容");
    await expect(dialog.locator(".appearance-preview-body h3")).toHaveCSS(
      "color",
      rgb(colors.text),
    );
    await expect(dialog.locator(".appearance-preview-card")).toHaveCSS(
      "background-color",
      rgb(colors.surface),
    );
    await expect(dialog.locator(".ant-input-affix-wrapper")).toHaveCSS(
      "background-color",
      rgb(colors.surface),
    );
    expect(
      await page.getByRole("button", { name: "收起全局设置" }).boundingBox(),
    ).toEqual(triggerBox);
  }
  await page.getByRole("button", { name: "收起全局设置" }).click();
  await expect(dialog).toBeHidden();
  await page.goto("/#/examples/customers");
  await page.getByRole("button", { name: "新建客户", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "新建客户" });
  await expect(modal.locator(".ant-modal-container")).toHaveCSS(
    "background-color",
    rgb(appearancePalettes.dark.elevated),
  );
  await expect(modal.locator(".ant-modal-title")).toHaveCSS(
    "color",
    rgb(appearancePalettes.dark.text),
  );
  await modal.getByRole("button", { name: "取消", exact: true }).click();
  await page.goto("/#/components/avatar");
  const avatars = page.locator('[data-example="avatar-0"] .ant-avatar');
  await expect(avatars.nth(0)).toHaveCSS(
    "color",
    rgb(appearancePalettes.dark.text),
  );
  await expect(avatars.nth(1)).toHaveCSS(
    "color",
    rgb(appearancePalettes.dark.text),
  );
  await expect(avatars.nth(2)).toHaveCSS(
    "color",
    rgb(appearancePalettes.dark.onAccent),
  );
  await page.goto("/#/examples/settings");
  await page.getByRole("button", { name: "调整全局外观" }).click();
  await page.getByRole("button", { name: "恢复默认" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await expect(page.getByRole("radio", { name: /陶土橙/ })).toBeChecked();
});

test("设置分层展开、原位收起，外观跨页面与刷新保留", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "打开全局设置" });
  const openingBox = await trigger.boundingBox();
  const header = page.locator(".home-header");
  const headerBox = (await header.boundingBox())!;
  await expect(header).toHaveCSS("border-bottom-style", "solid");
  expect(openingBox!.y + openingBox!.height / 2).toBe(
    headerBox.y + headerBox.height,
  );
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: /全局设置/ });
  await expect(dialog).toBeVisible();
  const close = page.getByRole("button", { name: "收起全局设置" });
  expect(await close.boundingBox()).toEqual(openingBox);
  expect(await header.boundingBox()).toEqual(headerBox);
  await expect(header).toHaveAttribute("inert", "");
  const settingsBox = (await dialog
    .locator(".global-settings-grid")
    .boundingBox())!;
  expect(settingsBox.y - headerBox.height).toBeGreaterThan(21);
  expect(settingsBox.y - headerBox.height).toBeLessThan(80);
  await expect(page.locator(".app-page")).toHaveAttribute("inert", "");
  await expect
    .poll(async () => (await page.locator(".app-page").boundingBox())!.y)
    .toBeGreaterThan(900);
  expect(await header.boundingBox()).toEqual(headerBox);
  await page.getByRole("radio", { name: /静谧蓝/ }).check();
  await page.getByText("圆润 · 12px", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "圆润 · 12px" })).toBeChecked();
  await dialog
    .getByLabel("项目名称", { exact: true })
    .fill("切换动效后保留输入");
  await page.getByRole("switch", { name: "减少动画" }).check();
  await expect(dialog.getByLabel("项目名称", { exact: true })).toHaveValue(
    "切换动效后保留输入",
  );
  await expect(dialog.getByRole("button", { name: "体验主题" })).toHaveCSS(
    "background-color",
    "rgb(49, 93, 182)",
  );
  await expect(dialog.getByRole("button", { name: "体验主题" })).toHaveCSS(
    "border-radius",
    "12px",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await trigger.boundingBox()).toEqual(openingBox);
  expect(await header.boundingBox()).toEqual(headerBox);
  await expect(header).not.toHaveAttribute("inert");
  await page.locator("a.entry").first().click();
  const primary = page
    .locator('[data-example="button-0"]')
    .getByRole("button", { name: "主要按钮" });
  await expect(primary).toHaveCSS("background-color", "rgb(49, 93, 182)");
  await expect(primary).toHaveCSS("border-radius", "12px");
  await page.reload();
  await expect(primary).toHaveCSS("background-color", "rgb(49, 93, 182)");
  await page.goto("/#/examples/settings");
  await expect(page.locator(".workspace-sidebar")).toHaveCSS(
    "background-color",
    "rgb(34, 54, 80)",
  );
  await expect(page.locator("#appearance")).toContainText("静谧蓝");
  const dataBefore = await page.evaluate(() =>
    localStorage.getItem("dalton-styles:workspace:v1"),
  );
  await page.getByRole("button", { name: "调整全局外观" }).click();
  await page.getByRole("button", { name: "恢复默认" }).click();
  await expect(page.getByRole("radio", { name: /陶土橙/ })).toBeChecked();
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "调整全局外观" }),
  ).toBeFocused();
  await expect(page.locator(".workspace-sidebar")).toHaveCSS(
    "background-color",
    "rgb(32, 60, 51)",
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("dalton-styles:workspace:v1"),
    ),
  ).toBe(dataBefore);
});

test("手机分层设置可滚动，收起按钮保持原位且焦点不越出面板", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 120));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const trigger = page.getByRole("button", { name: "打开全局设置" });
  const box = await trigger.boundingBox();
  const header = page.locator(".home-header");
  const headerBox = (await header.boundingBox())!;
  expect(box!.y + box!.height / 2).toBe(headerBox.y + headerBox.height);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /全局设置/ });
  await expect(dialog).toBeVisible();
  const close = page.getByRole("button", { name: "收起全局设置" });
  expect(await close.boundingBox()).toEqual(box);
  expect(await header.boundingBox()).toEqual(headerBox);
  const settingsBox = (await dialog
    .locator(".global-settings-grid")
    .boundingBox())!;
  expect(settingsBox.y - headerBox.height).toBeGreaterThan(21);
  expect(settingsBox.y - headerBox.height).toBeLessThan(80);
  await page.getByRole("radio", { name: /暗夜紫/ }).check();
  await page.getByText("利落 · 2px", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "利落 · 2px" })).toBeChecked();
  await page.getByLabel("项目名称", { exact: true }).fill("我的主题预览");
  expect(await close.boundingBox()).toEqual(box);
  expect(await header.boundingBox()).toEqual(headerBox);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.getByRole("button", { name: "恢复默认" }).focus();
  await page.keyboard.press("Tab");
  await expect
    .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "violet-dark",
  );
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  expect(await header.boundingBox()).toEqual(headerBox);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("损坏偏好回退，系统减少动画与存储失败得到正确处理", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(
    (key) => localStorage.setItem(key, '{"themeId":"missing","radius":-10}'),
    preferencesKey,
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "clay");
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await page.getByRole("button", { name: "打开全局设置" }).click();
  await expect(page.getByRole("radio", { name: "默认 · 6px" })).toBeChecked();
  await page.getByRole("button", { name: "收起全局设置" }).click();
  await page.evaluate(
    (key) => localStorage.setItem(key, "{broken"),
    preferencesKey,
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "clay");
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "dalton-styles:preferences:v1")
        throw new DOMException("Blocked", "QuotaExceededError");
      return set.call(this, key, value);
    };
  });
  await page.reload();
  await page.getByRole("button", { name: "打开全局设置" }).click();
  await page.getByRole("radio", { name: /森林绿/ }).check();
  await expect(page.getByRole("status")).toContainText("仅在本次访问中生效");
  await expect(page.getByRole("button", { name: "体验主题" })).toHaveCSS(
    "background-color",
    "rgb(44, 106, 75)",
  );
});
