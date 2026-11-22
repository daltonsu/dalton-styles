# Dalton Styles

React + Ant Design 组件库与后台页面样例。保留陶土橙、森林绿和暖白风格，将组件文档站与完整后台演示组织为两个独立入口。

## 运行

需要 Node.js 22.12+。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址（默认 `http://127.0.0.1:5173`）。

```sh
npm run build       # TypeScript 检查与生产构建
npm run preview     # 预览 dist
npm test            # 数据筛选、存储校验和 CSV 测试
npm run test:e2e    # 组件目录与完整用户操作回归
```

浏览器测试默认使用 macOS 系统 Chrome。其他环境可设置 `PLAYWRIGHT_CHROME_PATH` 指定 Chrome 路径；未指定时使用 Playwright Chromium（需先运行 `npx playwright install chromium`）。

## 内容

- 留白首页：组件库、页面样例、零三三个缩略图入口；零三仅展示侧边栏。
- 全局设置：首页头部固定，分割线上的按钮打开背后的设置层，下方内容层向下移开；展开和收起按钮保持原位。支持两行八组主题配色（第一行浅色、第二行暗色）、三档圆角、减少动画及恢复默认，设置即时应用到组件库、全部页面样例及首页缩略图，并保存在当前浏览器；后台「项目设置」也可打开。页面背景、文字、弹窗、图表和装饰色跟随明暗主题，状态色保持一致语义。
- 组件库：87 个栏目、209 个交互示例、12 类图表，支持搜索、示例代码查看与复制。
- 设计规范：统一主题、色彩、排版、尺寸与交互规则。
- 后台样例：经营概览、客户管理、商机看板、项目设置。
- 模拟数据：32 位客户、8 个商机；浏览器本地保存，可恢复初始状态。

## 结构

```text
src/app/           应用路由与统一主题
src/catalog/       组件目录、演示、参数摘要
src/components/    共用品牌、页头与指标
src/domain/        类型、数据校验、筛选、导出、本地存储
src/pages/         首页、组件站与后台页面
public/previews/   首页缩略图
```

使用 React 19、Ant Design 6、Vite 8 和 Recharts 3。版本由 lockfile 固定。

参考项目为本地 Tunpla UI 3.7.0。详细来源、技术迁移说明和业务边界见 [迁移说明](docs/迁移说明.md)。当前项目为私有应用，不包含后端、公开组件包发布或自动部署。
