# VerdFlow Resources

VerdFlow 资源中心的页面、资源索引与发布维护仓库。

[资源中心](https://mr-pardon.github.io/verdflow-resources/) ·
[资源下载](https://github.com/Mr-Pardon/verdflow-resources/releases) ·
[用户手册](https://mr-pardon.github.io/verdflow-site/)

资源分为资产库（VFA）、策略（VFS）、种植方案（VFP）。这三类文件通过本仓库的 GitHub Releases
分发，不提交到 Git 历史；PAK 始终使用提供方的外部链接。

- 本仓库维护独立的 GitHub Pages 资源中心，页面按需加载资源索引和每项资源的 README。
- 本仓库同时维护资源身份、介绍、版本、依赖与来源关联、下载信息和投稿流程，页面与内容分目录管理。
- `verdflow-site` 继续维护官网与手册，通过导航链接进入资源中心。
- VerdFlow 客户端继续负责本地导入、校验、信任、兼容解析与执行。

完整设计与实施评估见 [资源中心设计](docs/resource-center-design.md)。

## 本地预览

Node.js 22.12 或更高版本：

```powershell
npm ci
npm run dev
```

默认地址为 http://127.0.0.1:4195/，端口占用时 Vite 自动使用其他端口。
正式目录当前收录 DTS_Library_v6，以及层次生态群落、草坪点景组团、通用行道树三个策略。
同时提供“花坛点景”和“草坪铺设”两个种植方案；测试条目不进入生产构建。

```powershell
npm run check
npm test
npm run check:downloads
npm run build
npm run test:browser
```

Windows 浏览器回归默认使用已安装的 Edge；其他环境使用 Playwright Chromium，
首次运行 `npx playwright install --with-deps chromium`。测试自行启动并关闭 4296 生产预览服务。
验证项目 Pages 子路径时，对构建和测试同时设置 SITE_BASE=/仓库名/。

## 维护入口

- [资源格式与版本约定](docs/resource-format.md)
- [新手推荐资源清单](collections/starter.json)：调整 Studio 一键导入的 VFA/VFS；下载信息由构建自动派生。
- [独立资源中心 ADR](docs/adr/0001-independent-resource-center.md)
- [上线清单与配置](docs/release-checklist.md)
- [品牌与素材来源](ASSETS.md)

web/ 是通用页面，entries/ 是唯一正式内容源，scripts/ 负责校验与派生产物。
页面不导入产品 Core，不更改交换包格式，也不执行策略代码。

包文件使用各自的许可和署名，不因收录到资源中心而自动改变授权。

本地目录沿用创建时指定的 `verdflow-resouces`；对外项目名为 VerdFlow Resources。
远端仓库为 [Mr-Pardon/verdflow-resources](https://github.com/Mr-Pardon/verdflow-resources)。
公开记录只指向已经上传并核验的固定版本附件。
