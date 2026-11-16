import { test, expect } from "@playwright/test";
import manifest from "../src/catalog/manifest.json" with { type: "json" };
test("全部组件栏目渲染，示例数量与迁移清单一致", async ({ page }) => {
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
    total += await page.locator(".example-card").count();
  }
  expect(total).toBe(208);
  expect(errors).toEqual([]);
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
