# 资源维护约定

本中心不定义新的产品交换包。以下记录只供网站发现、版本展示和分发使用。
正式数据位于 `entries/<assets|strategies|plans>/<entry-id>/`；尚未整理的资源不要录入。

## 文件归属

每项资源包含 resource.json、README.md 和 media/ 下的 PNG/JPEG/WebP。
历史版本可将说明放在 `versions/<version>/README.md`，并在版本记录中指定。
各版本 README 和所引用图片必须保留，不能用新版说明冒充旧版。
说明可以引用相对图片路径；原始 HTML 不执行，远端图片和 SVG 不显示。

精确字段见 `schemas/resource.schema.json`。必填信息如下：

| 字段 | 内容 |
| --- | --- |
| schemaVersion | 网站记录格式版本，目前为 1 |
| id / type | 公开条目身份与 assets、strategies、plans 分类；与目录一致 |
| name / summary / author | 名称、简述与署名 |
| platforms / tags | 适用平台与可选搜索标签 |
| license / cover | 明确许可说明与可选本地封面 |
| recommended | 推荐版本；所有版本已撤回时设为 null |
| versions | 版本记录，按希望展示的顺序填写 |

每个版本包含 version、releasedAt、readme、status、package、relations，
可补充 notes。status 为 published 或 withdrawn，撤回必须提供 withdrawalReason。
package 记录真实包内 identity、固定 Release 下载 URL、filename、bytes 和 sha256。
同一条目的包身份不可跨版本变化；包身份不等于网站条目 ID。

VFA/VFP 的文件 schema 版本不等于分发版本。策略版本应与 VFS 声明一致，
当前检查器不打开交换包，包内身份、策略版本和许可仍须人工核验。
下载文件的 SHA-256 不等于策略内容身份 hash。

## 三种关联

- strategy：所需策略，使用 resourceId 与可选 version 定位；网页不替代客户端兼容选择。
- source-catalog：来源资产库，可指向多个条目；不能标成必须安装的依赖。
- pak：必须填写外部 HTTPS url，不能指向中心资源条目。

关联还包含 name 和可选 note。未收录的策略或来源可只记录名称与说明，不捏造链接；
一旦填写 resourceId 或 version，就必须能在当前目录找到对应对象。

## 校验与生成

`npm run check` 检查结构、目录归属、推荐版本、图片、关系与路径边界。
`npm run check:downloads` 流式读取已发布附件，核对大小和 SHA-256，不落盘也不执行。
外部 PAK 不在此命令中下载，必须另外人工核对。

构建派生出轻量 catalog.json 和带内容摘要路径的单条记录、README、图片。
这些产物不提交到 Git。每次构建只使用当前已审核输入，避免带入已删除的旧条目。
正文加载失败时可以重试；部署期间旧页面失效时应刷新目录获取最新快照。

自动化测试中的条目只存在于临时目录或浏览器请求拦截中，不进入生产索引。
