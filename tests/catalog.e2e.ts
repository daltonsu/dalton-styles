import { test, expect } from "@playwright/test";
import manifest from "../src/catalog/manifest.json" with { type: "json" };
test("全部组件栏目渲染，示例数量与目录清单一致", async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let total = 0;
  for (const item of manifest) {
    await page.goto(`/#/components/${item.id}`);
    await expect(page.locator(".page-title h1")).toContainText(item.label);
    await expect(page.locator(".example-card")).toHaveCount(
      item.examples.length,
    );
    await expect(
      page.locator(".example-preview .demo-surface").first(),
    ).toBeVisible();
    await page
      .locator(".example-preview .ant-spin")
      .first()
      .waitFor({ state: "hidden", timeout: 1000 })
      .catch(() => {});
    await page.waitForTimeout(120);
    await expect(page.locator(".usage-section, .source-view")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /^(使用方法|示例入口参数|常用参数)$/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "相邻组件" }),
    ).toBeVisible();
    total += await page.locator(".example-card").count();
  }
  expect(total).toBe(209);
  expect(errors).toEqual([]);
});
test("日期范围并入日期选择器，菜单与相邻导航顺序一致", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-19T05:37:00Z"));
  await page.goto("/#/components/range-picker");
  await expect(page).toHaveURL(/#\/components\/date-picker$/);
  await expect(page.locator(".example-card")).toHaveCount(5);
  const menu = page.locator(".catalog-menu-scroll");
  await expect(
    menu.getByRole("menuitem", { name: "日期范围", exact: true }),
  ).toHaveCount(0);
  const names = await menu.locator(".ant-menu-item").allTextContents();
  const dateIndex = names.findIndex((name) => name.includes("日期选择器"));
  expect(dateIndex).toBeGreaterThanOrEqual(0);
  expect(
    names
      .slice(dateIndex, dateIndex + 3)
      .map((name) => name.replace(/[^\u4e00-\u9fff]/g, "")),
  ).toEqual(["日期选择器", "时间选择器", "日期时间选择器"]);
  const range = page.locator('[data-example="date-picker-3"]');
  await expect(range.getByRole("heading")).toHaveText("起止日期");
  await range.locator("input").first().click();
  const popup = page.locator(".ant-picker-dropdown:visible");
  await popup
    .locator(".ant-picker-panel")
    .first()
    .getByRole("cell", { name: "18", exact: true })
    .click();
  await popup
    .locator(".ant-picker-panel")
    .first()
    .getByRole("cell", { name: "19", exact: true })
    .click();
  await expect(range.locator("input").first()).toHaveValue("18/11/2026");
  await expect(range.locator("input").nth(1)).toHaveValue("19/11/2026");
  const quickRange = page.locator('[data-example="date-picker-4"]');
  await expect(quickRange.getByRole("heading")).toHaveText("快捷范围");
  await quickRange.locator("input").first().click();
  await popup.getByText("最近 7 天", { exact: true }).click();
  await expect(quickRange.locator("input").first()).toHaveValue("13/11/2026");
  await expect(quickRange.locator("input").nth(1)).toHaveValue("19/11/2026");
  const adjacent = page.getByRole("navigation", { name: "相邻组件" });
  await adjacent.getByRole("link", { name: "时间选择器", exact: true }).click();
  await expect(page.locator(".page-title h1")).toContainText("时间选择器");
  await adjacent
    .getByRole("link", { name: "日期时间选择器", exact: true })
    .click();
  await expect(page.locator(".page-title h1")).toContainText("日期时间选择器");
});
test("目录搜索、树勾选、表单校验与异步确认", async ({ page }) => {
  await page.goto("/#/components/button");
  await page.getByRole("textbox", { name: "搜索组件" }).fill("tree");
  await expect(page.locator(".catalog-menu-scroll")).toContainText("树形控件");
  await page
    .locator(".catalog-menu-scroll")
    .getByRole("menuitem", { name: /树形控件/ })
    .click();
  const demo = page.locator('[data-example="tree-1"]');
  await demo.locator(".ant-tree-checkbox").nth(2).click();
  await expect(demo.locator('[role="status"]')).toContainText("Jakarta");
  await page.goto("/#/components/form");
  await page
    .locator('[data-example="form-0"]')
    .getByRole("button", { name: "保存", exact: true })
    .click();
  await expect(page.getByText("请输入客户名称", { exact: true })).toBeVisible();
  await page.goto("/#/components/modal");
  await page.getByRole("button", { name: "体验异步确认" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "保存", exact: true })
    .click();
  await expect(
    page.getByText("模拟请求失败，请重试。已保留原内容。"),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "重试", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
});
test("窄屏导航与代码展示", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/tree");
  await expect(page.locator(".example-card")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator(".example-code summary").first().click();
  await expect(page.locator(".example-code pre").first()).toContainText(
    "ComponentDemo",
  );
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: "test-results/catalog-mobile.png",
    fullPage: true,
  });
});

test.describe("日期时间选择器", () => {
  test.use({ timezoneId: "Asia/Shanghai" });

  test("按四步解锁，点击确定后回填", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-19T05:37:00Z"));
    await page.goto("/#/components/date-time-picker");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    const selection = page.getByRole("group", { name: "所选范围" });
    const confirm = panel.getByRole("button", { name: "确定", exact: true });
    const today = panel.getByRole("button", { name: "今天" });
    const now = panel.getByRole("button", { name: "此刻" });
    const startDate = selection.getByRole("textbox", { name: "开始日期" });
    const startTime = selection.locator(
      '[data-side="from"][data-field="time"]',
    );
    const endDate = selection.getByRole("textbox", { name: "结束日期" });
    const endTime = selection.locator('[data-side="to"][data-field="time"]');
    const hours = panel.getByRole("group", { name: "小时" });
    const minutes = panel.getByRole("group", { name: "分钟" });
    await expect(
      panel.getByRole("button", {
        name: /^(取消|清除范围|开始时间（含）|结束时间（不含）)$/,
      }),
    ).toHaveCount(0);
    await expect(panel.getByRole("textbox")).toHaveCount(0);
    await expect(
      panel.getByRole("button", { name: /^(清空|清除|今日)$/ }),
    ).toHaveCount(0);
    await expect(confirm).toBeDisabled();
    const themeColor = await selection.evaluate(
      (bar) => getComputedStyle(bar).borderTopColor,
    );
    for (const shortcut of [today, now]) {
      await expect(shortcut).toHaveCSS("color", themeColor);
    }
    await expect(startDate).toHaveAttribute("placeholder", "开始日期时间");
    await expect(startTime).toBeHidden();
    await expect(startTime).toBeDisabled();
    await expect(now).toBeDisabled();
    await expect(
      hours.getByRole("button", { name: "09", exact: true }),
    ).toBeDisabled();
    await expect(endDate).toBeDisabled();

    await panel.getByRole("button", { name: "下个月" }).click();
    await expect(panel.getByRole("grid", { name: "2026年12月" })).toBeVisible();
    await today.click();
    await expect(startDate).toHaveValue("19/11/2026");
    await expect(startTime).toBeFocused();
    await hours.getByRole("button", { name: "13", exact: true }).click();
    await expect(confirm).toBeDisabled();
    await expect(startTime).toHaveValue("13:--");
    await expect(endDate).toBeDisabled();
    await minutes.getByRole("button", { name: "37", exact: true }).click();
    await expect(startTime).toHaveValue("13:37");
    await expect(endDate).toBeFocused();
    await expect(endTime).toBeDisabled();

    await panel.locator('[data-day="2026-11-19"]').click();
    await expect(endDate).toHaveValue("19/11/2026");
    await expect(endTime).toBeFocused();
    await now.click();
    await expect(panel.getByRole("alert")).toHaveText(
      "结束时间必须晚于开始时间。",
    );
    await expect(endTime).toBeFocused();
    await confirm.click();
    await expect(panel.getByRole("alert")).toHaveText(
      "结束时间必须晚于开始时间。",
    );
    await expect(panel).toBeVisible();
    await hours.getByRole("button", { name: "13", exact: true }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(
      hours.getByRole("button", { name: "14", exact: true }),
    ).toBeFocused();
    await expect(
      hours.getByRole("button", { name: "13", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();
    await expect(endTime).toHaveValue("14:37");
    await expect(confirm).toBeEnabled();
    await minutes.getByRole("button", { name: "01", exact: true }).click();
    await expect(panel).toBeVisible();
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(panel).toBeHidden();
    await expect(
      page.getByRole("button", {
        name: /19\/11\/2026 13:37.*19\/11\/2026 14:01/,
      }),
    ).toBeFocused();
  });

  test("已有时间可单独修改小时或分钟，首次填写仍需选全两项", async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-11-19T05:37:00Z"));
    await page.goto("/#/components/date-time-picker");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    const startTime = page.getByRole("textbox", { name: "开始时间" });
    const endDate = page.getByRole("textbox", { name: "结束日期" });
    const endTime = page.getByRole("textbox", { name: "结束时间" });
    const hours = panel.getByRole("group", { name: "小时" });
    const minutes = panel.getByRole("group", { name: "分钟" });
    const confirm = panel.getByRole("button", { name: "确定", exact: true });
    const trigger = page.locator(".dtr-trigger");

    await panel.getByRole("button", { name: "今天" }).click();
    await minutes.getByRole("button", { name: "30", exact: true }).click();
    await expect(startTime).toHaveValue("--:30");
    await expect(endDate).toBeDisabled();
    await hours.getByRole("button", { name: "09", exact: true }).click();
    await expect(startTime).toHaveValue("09:30");
    await expect(endDate).toBeFocused();
    await panel.getByRole("button", { name: "今天" }).click();
    await minutes.getByRole("button", { name: "00", exact: true }).click();
    await expect(endTime).toHaveValue("--:00");
    await expect(confirm).toBeDisabled();
    await hours.getByRole("button", { name: "10", exact: true }).click();
    await expect(endTime).toHaveValue("10:00");
    await expect(confirm).toBeEnabled();

    await startTime.click();
    await minutes.getByRole("button", { name: "45", exact: true }).click();
    await expect(startTime).toHaveValue("09:45");
    await hours.getByRole("button", { name: "00", exact: true }).click();
    await expect(startTime).toHaveValue("00:45");
    await minutes.getByRole("button", { name: "00", exact: true }).click();
    await expect(startTime).toHaveValue("00:00");
    await hours.getByRole("button", { name: "09", exact: true }).click();
    await expect(startTime).toHaveValue("09:00");
    await minutes.getByRole("button", { name: "30", exact: true }).click();
    await expect(startTime).toHaveValue("09:30");

    await endTime.click();
    await minutes.getByRole("button", { name: "45", exact: true }).click();
    await expect(endTime).toHaveValue("10:45");
    await hours.getByRole("button", { name: "11", exact: true }).click();
    await expect(endTime).toHaveValue("11:45");
    await hours.getByRole("button", { name: "00", exact: true }).click();
    await expect(endTime).toHaveValue("00:45");
    await expect(panel.getByRole("alert")).toHaveText(
      "结束时间必须晚于开始时间。",
    );
    await hours.getByRole("button", { name: "10", exact: true }).click();
    await expect(endTime).toHaveValue("10:45");
    await expect(panel.getByRole("alert")).toHaveCount(0);
    await confirm.click();
    await expect(trigger).toContainText("19/11/2026 09:30");
    await expect(trigger).toContainText("19/11/2026 10:45");

    await trigger.click();
    await hours.getByRole("button", { name: "08", exact: true }).click();
    await expect(startTime).toHaveValue("08:30");
    await endTime.click();
    await minutes.getByRole("button", { name: "00", exact: true }).click();
    await expect(endTime).toHaveValue("10:00");
    await confirm.click();
    await expect(trigger).toContainText("19/11/2026 08:30");
    await expect(trigger).toContainText("19/11/2026 10:00");
  });

  test("空值提示完整，有值时可从框内叉号清空", async ({ page }) => {
    await page.goto("/#/components/date-time-picker");
    const trigger = page.locator(".dtr-trigger");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    const clear = page.getByRole("button", {
      name: "清空时间范围",
      exact: true,
    });
    const startDate = page.getByRole("textbox", { name: "开始日期" });
    const startTime = page.locator('[data-side="from"][data-field="time"]');
    const endDate = page.getByRole("textbox", { name: "结束日期" });
    const endTime = page.getByRole("textbox", { name: "结束时间" });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(startDate).toHaveAttribute("placeholder", "开始日期时间");
      await expect(endDate).toHaveAttribute("placeholder", "结束日期时间");
      await expect(clear).toHaveCount(0);
      await startDate.fill("31/11/2026");
      await startDate.press("Enter");
      await expect(panel.getByRole("alert")).toBeVisible();
      await clear.focus();
      await page.keyboard.press("Enter");
      await expect(panel).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAccessibleName("开始日期时间 结束日期时间");
      await expect(clear).toHaveCount(0);
      await trigger.click();
      await expect(endDate).toBeDisabled();
      await startDate.fill("18/11/2026");
      await startDate.press("Enter");
      await startTime.fill("09:30");
      await startTime.press("Enter");
      await endDate.fill("19/11/2026");
      await endDate.press("Enter");
      await endTime.fill("10:45");
      await panel.getByRole("button", { name: "确定", exact: true }).click();
      await expect(clear).toBeVisible();
      await clear.click();
      await expect(trigger).toHaveAccessibleName("开始日期时间 结束日期时间");
      await expect(panel).toBeHidden();
      await expect(clear).toHaveCount(0);
      await trigger.click();
      await expect(startDate).toHaveValue("");
      await expect(startTime).toBeDisabled();
      await expect(endDate).toBeDisabled();
      await expect(panel.getByRole("alert")).toHaveCount(0);
    }
  });

  test("完整范围可直接编辑四项，清空后恢复步骤限制", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-19T05:37:00Z"));
    await page.goto("/#/components/date-time-picker");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    const trigger = page.locator(".dtr-trigger");
    const selection = page.getByRole("group", { name: "所选范围" });
    const startDate = selection.getByRole("textbox", { name: "开始日期" });
    const startTime = selection.locator(
      '[data-side="from"][data-field="time"]',
    );
    const endDate = selection.getByRole("textbox", { name: "结束日期" });
    const endTime = selection.getByRole("textbox", { name: "结束时间" });
    await startDate.fill("31/11/2026");
    await startDate.press("Enter");
    await expect(panel.getByRole("alert")).toContainText("请输入有效日期");
    await expect(startTime).toBeDisabled();
    await startDate.fill("18/11/2026");
    await startDate.press("Enter");
    await panel.getByRole("button", { name: "此刻" }).click();
    await panel.getByRole("button", { name: "今天" }).click();
    await endTime.fill("15:00");
    await endTime.press("Tab");
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "确定", exact: true }).click();
    await expect(trigger).toContainText("18/11/2026 13:37");
    await expect(trigger).toContainText("19/11/2026 15:00");
    await expect(panel).toBeHidden();

    for (const [field, text, formatted] of [
      [endTime, "15:25", "19/11/2026 15:25"],
      [startTime, "12:25", "18/11/2026 12:25"],
      [endDate, "20/11/2026", "20/11/2026 15:25"],
      [startDate, "19/11/2026", "19/11/2026 12:25"],
    ] as const) {
      await trigger.click();
      await expect(endDate).toBeEnabled();
      await field.fill(text);
      await field.press("Enter");
      await expect(panel).toBeVisible();
      await panel.getByRole("button", { name: "确定", exact: true }).click();
      await expect(panel).toBeHidden();
      await expect(trigger).toContainText(formatted);
    }

    await trigger.click();
    await endDate.click();
    await expect(
      panel.locator('[data-day="2026-11-20"]').locator(".."),
    ).toHaveAttribute("aria-selected", "true");
    await startDate.fill("");
    await expect(startTime).toBeDisabled();
    await expect(endDate).toBeDisabled();
    await startDate.press("Escape");
    await expect(trigger).toContainText("19/11/2026 12:25");
    await trigger.click();
    await startDate.fill("18/11/2026");
    await page
      .getByRole("button", { name: "清空时间范围", exact: true })
      .click();
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAccessibleName("开始日期时间 结束日期时间");
    await trigger.click();
    await expect(startDate).toHaveValue("");
    await expect(startTime).toBeDisabled();
    await expect(endDate).toBeDisabled();
  });

  test("范围栏在填写、收起和清空时保持尺寸", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-19T05:37:00Z"));
    await page.goto("/#/components/date-time-picker");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const bar = page.locator(".dtr-selection, .dtr-trigger");
      const panel = page.getByRole("group", { name: "日期时间范围" });
      const today = panel.getByRole("button", { name: "今天" });
      const trigger = page.locator(".dtr-trigger");
      const measure = () =>
        bar.evaluate((element) => ({
          width: element.offsetWidth,
          height: element.offsetHeight,
          arrowOffset:
            element.children[1]!.getBoundingClientRect().left -
            element.getBoundingClientRect().left,
        }));
      const empty = await measure();
      await today.click();
      expect(await measure()).toEqual(empty);
      await panel.getByRole("button", { name: "此刻" }).click();
      expect(await measure()).toEqual(empty);
      await today.click();
      const endTime = bar.getByRole("textbox", { name: "结束时间" });
      await endTime.fill("15:00");
      expect(await measure()).toEqual(empty);
      await endTime.press("Enter");
      await panel.getByRole("button", { name: "确定", exact: true }).click();
      await expect(trigger).toContainText("15:00");
      expect(await measure()).toEqual(empty);
      await trigger.click();
      expect(await measure()).toEqual(empty);
      await page
        .getByRole("button", { name: "清空时间范围", exact: true })
        .click();
      await expect(trigger).toHaveAccessibleName("开始日期时间 结束日期时间");
      expect(await measure()).toEqual(empty);
      await trigger.click();
    }
  });

  test("窄屏显示完整面板及示例代码", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/components/date-time-picker");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    await expect(
      panel.getByRole("button", { name: "确定", exact: true }),
    ).toBeVisible();
    expect(
      await panel.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await page.locator(".example-code summary").first().click();
    await expect(page.locator(".example-code pre").first()).toContainText(
      'id="date-time-picker"',
    );
  });

  test("桌面和窄屏此刻与确定并排，无底栏且确认前可编辑或取消", async ({
    page,
  }) => {
    await page.goto("/#/components/date-time-picker");
    const panel = page.getByRole("group", { name: "日期时间范围" });
    const trigger = page.locator(".dtr-trigger");
    const endTime = page.getByRole("textbox", { name: "结束时间" });
    const confirm = panel.getByRole("button", { name: "确定", exact: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await panel.evaluate((element) => {
        const rect = (selector: string) => {
          const { left, right, top, bottom } = element
            .querySelector(selector)!
            .getBoundingClientRect();
          return { left, right, top, bottom };
        };
        return {
          main: rect(".dtr-main"),
          actions: rect(".dtr-time-actions"),
          now: rect(".dtr-time-actions .dtr-quick"),
          confirm: rect(".dtr-confirm"),
        };
      });
      await expect(panel.locator(".dtr-footer")).toHaveCount(0);
      await expect(
        panel.getByRole("button", { name: /^(清空|清除|今日)$/ }),
      ).toHaveCount(0);
      expect(bounds.confirm.top).toBe(bounds.now.top);
      expect(bounds.now.right).toBeLessThan(bounds.confirm.left);
      expect(bounds.confirm.right).toBeLessThanOrEqual(bounds.main.right);
      expect(bounds.confirm.bottom).toBeLessThanOrEqual(bounds.main.bottom);
      await expect(confirm).toBeDisabled();
      const startDate = page.getByRole("textbox", { name: "开始日期" });
      await startDate.fill("18/11/2026");
      await startDate.press("Enter");
      const startTime = page.getByRole("textbox", { name: "开始时间" });
      await startTime.fill("09:00");
      await startTime.press("Enter");
      const endDate = page.getByRole("textbox", { name: "结束日期" });
      await endDate.fill("19/11/2026");
      await endDate.press("Enter");
      await endTime.fill("15:00");
      await confirm.click();
      await expect(trigger).toContainText("19/11/2026 15:00");
      await trigger.click();
      await endTime.fill("16:00");
      await endTime.press("Escape");
      await expect(trigger).toContainText("19/11/2026 15:00");
      await trigger.click();
      await endTime.fill("16:00");
      await confirm.click();
      await expect(trigger).toContainText("19/11/2026 16:00");
      await trigger.click();
      await page
        .getByRole("button", { name: "清空时间范围", exact: true })
        .click();
      await expect(trigger).toHaveAccessibleName("开始日期时间 结束日期时间");
      await trigger.click();
    }
    await page.screenshot({
      path: "test-results/date-time-picker-actions-mobile.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: "test-results/date-time-picker-actions-desktop.png",
      fullPage: true,
    });
  });
});
