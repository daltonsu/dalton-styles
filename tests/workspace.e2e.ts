import { test, expect } from "@playwright/test";
test("首页入口、客户新增编辑、详情与刷新持久化", async ({ page }) => {
  await page.goto("/");
  await page.locator("a.entry").nth(1).click();
  await expect(page.locator(".page-title h1")).toHaveText("经营概览");
  await page
    .locator(".workspace-sidebar")
    .getByRole("menuitem", { name: /客户管理/ })
    .click();
  await page.getByRole("button", { name: "新建客户", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "新建客户" });
  await dialog
    .getByRole("textbox", { name: /客户名称/ })
    .fill("Dalton 验收客户");
  await dialog.getByRole("textbox", { name: /联系人/ }).fill("测试联系人");
  await dialog
    .getByRole("textbox", { name: /联系邮箱/ })
    .fill("test@example.com");
  await dialog.getByRole("button", { name: "保存客户", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("searchbox", { name: "搜索客户" }).fill("Dalton 验收");
  await expect(page.locator(".customer-name")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Dalton 验收客户", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "客户详情" })).toContainText(
    "test@example.com",
  );
  await page
    .getByRole("dialog", { name: "客户详情" })
    .getByRole("button", { name: "编辑", exact: true })
    .click();
  const edit = page.getByRole("dialog", { name: "编辑客户资料" });
  await edit
    .getByRole("textbox", { name: /客户名称/ })
    .fill("Dalton 已编辑客户");
  await edit.getByRole("button", { name: "保存客户", exact: true }).click();
  await expect(edit).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog", { name: "客户详情" })).toContainText(
    "Dalton 已编辑客户",
  );
});
test("筛选草稿取消、金额校验、跨页选择与批量分配", async ({ page }) => {
  await page.goto("/#/examples/customers");
  await page.getByRole("button", { name: "高级筛选", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "高级筛选" });
  await dialog
    .getByRole("spinbutton", { name: "最低金额" })
    .fill("999999999999");
  await dialog.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.locator(".table-summary")).toContainText("32");
  await page.getByRole("button", { name: "高级筛选", exact: true }).click();
  await dialog.getByRole("spinbutton", { name: "最低金额" }).fill("200");
  await dialog.getByRole("spinbutton", { name: "最高金额" }).fill("100");
  await dialog.getByRole("button", { name: "应用筛选" }).click();
  await expect(dialog.getByText("最高金额不能低于最低金额")).toBeVisible();
  await dialog.getByRole("button", { name: "取消", exact: true }).click();
  await page
    .locator(".ant-table-row[data-row-key]")
    .first()
    .getByRole("checkbox")
    .check();
  await page.getByTitle("2", { exact: true }).click();
  await page
    .locator(".ant-table-row[data-row-key]")
    .first()
    .getByRole("checkbox")
    .check();
  await expect(page.locator(".bulk-bar")).toContainText("已选择 2 位客户");
  await page.getByRole("button", { name: "分配负责人", exact: true }).click();
  await page
    .getByRole("dialog", { name: "分配负责人" })
    .getByRole("button", { name: "确认分配" })
    .click();
  await expect(page.locator(".bulk-bar")).toBeHidden();
});
test("商机阶段、显示偏好持久化与数据恢复", async ({ page }) => {
  await page.goto("/#/examples/pipeline");
  const card = page.getByRole("article", { name: "零售 CRM 年度方案" });
  await card.getByRole("combobox").click();
  await page
    .locator(".ant-select-dropdown")
    .getByText("初步接洽", { exact: true })
    .click();
  await expect(page.locator(".pipeline-column").first()).toContainText(
    "零售 CRM 年度方案",
  );
  await page.reload();
  await expect(page.locator(".pipeline-column").first()).toContainText(
    "零售 CRM 年度方案",
  );
  await page.goto("/#/examples/settings");
  await page.getByRole("combobox", { name: "表格密度" }).click();
  await page
    .locator(".ant-select-dropdown")
    .getByText("紧凑", { exact: true })
    .click();
  await page.reload();
  await expect(page.locator("#appearance")).toContainText("紧凑");
  await page.getByRole("button", { name: "恢复初始数据", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "恢复初始数据", exact: true })
    .click();
  await page.goto("/#/examples/pipeline");
  await expect(page.locator(".pipeline-column").last()).toContainText(
    "零售 CRM 年度方案",
  );
});
test("手机布局、客户导出与页面运行异常", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["overview", "customers", "pipeline", "settings"]) {
    await page.goto(`/#/examples/${route}`);
    await expect(page.locator(".page-title h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/#/examples/customers");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出客户", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(page.getByRole("dialog")).toContainText("经营概览");
  expect(errors).toEqual([]);
});
