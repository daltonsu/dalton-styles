import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1,
  });
  await mkdir("public/previews", { recursive: true });
  for (const [name, route] of [
    ["components", "/components/button"],
    ["workspace", "/examples/overview"],
  ]) {
    await page.goto(`http://127.0.0.1:5173/#${route}`);
    await page.locator(".page-title h1").waitFor();
    if (name === "components")
      await page
        .locator('[data-example="button-0"] .ant-btn')
        .first()
        .waitFor();
    else await page.locator(".recharts-surface").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `public/previews/${name}.png` });
  }
} finally {
  await browser.close();
}
