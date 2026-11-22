import { test, expect } from "@playwright/test";
test("首页入口、客户新增编辑、详情与刷新持久化", async ({ page }) => {
  await page.goto("/");
  await page.locator("a.entry").nth(1).click();
  await expect(page.getByRole("main", { name: "经营概览" })).toBeVisible();
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
  for (const [route, title] of [
    ["overview", "经营概览"],
    ["customers", "客户管理"],
    ["pipeline", "商机看板"],
    ["settings", "项目设置"],
  ]) {
    await page.goto(`/#/examples/${route}`);
    await expect(page.getByRole("main", { name: title })).toBeVisible();
    await expect(page.locator(".header-current")).toHaveText(title);
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

test("首页零三入口只展示侧栏，支持菜单、折叠及返回", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const entry = page.locator('a.entry[href="#/examples/03"]');
    await expect(
      entry.getByRole("heading", { name: "零三Zero Three" }),
    ).toBeVisible();
    await entry.click();
    await expect(page).toHaveURL(/#\/examples\/03$/);
    const sidebar = page.getByRole("complementary", { name: "零三侧边栏" });
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("main", { name: "零三预览" })).toBeEmpty();
    await expect(page.locator(".workspace-content")).toHaveCount(0);
    await sidebar
      .getByRole("menuitem", { name: "客户管理", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/examples\/03\/customers$/);
    await expect(
      sidebar.getByRole("menuitem", { name: "客户管理", exact: true }),
    ).toHaveClass(/ant-menu-item-selected/);
    await page.reload();
    await expect(
      sidebar.getByRole("menuitem", { name: "客户管理", exact: true }),
    ).toHaveClass(/ant-menu-item-selected/);
    const collapse = sidebar.getByRole("button", {
      name: "收起侧栏",
      exact: true,
    });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    await expect(collapse.locator('[data-icon="left"]')).toBeVisible();
    const expandedButton = (await collapse.boundingBox())!;
    const expandedSidebar = (await sidebar.boundingBox())!;
    const firstItem = (await sidebar
      .getByRole("menuitem")
      .first()
      .boundingBox())!;
    expect(expandedButton.y).toBe(firstItem.y);
    expect(expandedButton.height).toBe(firstItem.height);
    expect(expandedButton.y).toBeLessThan(100);
    expect(expandedButton.x).toBeLessThan(expandedSidebar.width);
    expect(expandedButton.x + expandedButton.width).toBeGreaterThan(
      expandedSidebar.width,
    );
    await collapse.click();
    await expect(sidebar).toHaveCSS("width", "80px");
    const expand = sidebar.getByRole("button", {
      name: "展开侧栏",
      exact: true,
    });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect(expand.locator('[data-icon="right"]')).toBeVisible();
    const collapsedButton = (await expand.boundingBox())!;
    const firstCollapsedItem = (await sidebar
      .getByRole("menuitem")
      .first()
      .boundingBox())!;
    expect(collapsedButton.y).toBe(firstCollapsedItem.y);
    expect(collapsedButton.height).toBe(firstCollapsedItem.height);
    expect(collapsedButton.y).toBe(expandedButton.y);
    expect(collapsedButton.x).toBeLessThan(80);
    expect(collapsedButton.x + collapsedButton.width).toBeGreaterThan(80);
    await expand.click();
    await expect(sidebar).toHaveCSS("width", "240px");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await sidebar.getByRole("link", { name: "Dalton Styles 首页" }).click();
    await expect(entry).toBeVisible();
  }
  expect(errors).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`零三账号菜单在 ${width}px 支持上弹、关闭、设置和退出`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/examples/03");
    const account = page.getByRole("button", { name: "Dalton 账号菜单" });
    const menu = page.getByRole("menu", { name: "账号菜单" });
    await expect(menu).toBeHidden();
    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(
      menu.getByRole("menuitem", { name: "设置", exact: true }),
    ).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: "退出登录" }),
    ).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "退出登录" })).toHaveCSS(
      "color",
      "rgb(255, 150, 145)",
    );
    const menuBox = (await menu.boundingBox())!;
    const accountBox = (await account.boundingBox())!;
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(accountBox.y);
    expect(menuBox.x).toBeGreaterThanOrEqual(0);
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(width);
    await account.click();
    await expect(menu).toBeHidden();
    await account.click();
    await page.getByRole("main", { name: "零三预览" }).click();
    await expect(menu).toBeHidden();
    await account.focus();
    await page.keyboard.press("ArrowUp");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(account).toBeFocused();
    await account.click();
    await menu.getByRole("menuitem", { name: "设置", exact: true }).click();
    await expect(page.getByRole("dialog", { name: /全局设置/ })).toBeVisible();
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: "收起全局设置" }).click();
    await expect(account).toBeFocused();
    await page.getByRole("button", { name: "收起侧栏", exact: true }).click();
    await account.click();
    await expect(menu).toBeVisible();
    const collapsedMenu = (await menu.boundingBox())!;
    expect(collapsedMenu.x).toBeGreaterThanOrEqual(0);
    expect(collapsedMenu.x + collapsedMenu.width).toBeLessThanOrEqual(width);
    await menu.getByRole("menuitem", { name: "退出登录" }).click();
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.locator('a.entry[href="#/examples/03"]')).toBeVisible();
  });
}

test("原页面样例的桌面和手机侧栏共用账号菜单", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/examples/overview");
    if (width === 390)
      await page.getByRole("button", { name: "打开导航" }).click();
    const account = page
      .getByRole("button", { name: "Dalton 账号菜单" })
      .filter({ visible: true });
    await account.click();
    const menu = page.getByRole("menu", { name: "账号菜单" });
    await expect(
      menu.getByRole("menuitem", { name: "设置", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(account).toBeFocused();
    await expect(page.getByRole("main", { name: "经营概览" })).toBeAttached();
    await account.click();
    await menu.getByRole("menuitem", { name: "设置", exact: true }).click();
    await expect(page.getByRole("dialog", { name: /全局设置/ })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.getByRole("button", { name: "收起全局设置" }).click();
    await expect(
      width === 390 ? page.getByRole("button", { name: "打开导航" }) : account,
    ).toBeFocused();
  }
});
