# 种植方案投稿填写示例

以已发布的 **花坛点景 1.0.0** 为例，下面的标题与 Issue 表单字段一一对应。
这是参考写法，不是待投稿资源；请替换成自己的内容、文件链接、署名与真实授权情况。

[查看实际资源](https://mr-pardon.github.io/verdflow-resources/?type=plans&id=flowerbed-accents&version=1.0.0) ·
[填写投稿表](https://github.com/Mr-Pardon/verdflow-resources/issues/new?template=resource-submission.yml) ·
[资产库示例](assets.md) · [策略示例](strategies.md)

## 资源类型

种植方案（VFP）

## 资源名称与版本

花坛点景 / 1.0.0

## 介绍与预览图

适用于花坛与小型景观绿地的 DTS 种植预设，保存了 5 种已启用用途、7 种植被、
用途内权重、缩放范围及种植参数。

主体草坪与收边草坪形成底面，搭配中心主景、组团灌木和外围点缀。
保存的主要参数为主体草坪间距 1.5 米、点景组团密度 3.5、主景出现概率 85%、
点景组团数量下限 2。可按实际地块与模型尺寸继续调整。

![花坛点景在 DTS 中的种植效果](../../entries/plans/flowerbed-accents/media/cover.jpg)

图中建筑、铺装与灯具等是场景原有设施，不随 VFP 分发。
方案保存的是模型引用和配置，不包含三维模型；使用时 DTS 中仍需准备对应资源。

## 包文件链接与关联资源

- VFP：[flowerbed-accents-1.0.0.vfp](https://github.com/Mr-Pardon/verdflow-resources/releases/download/plan-flowerbed-accents-v1.0.0/flowerbed-accents-1.0.0.vfp)
- 保存时所用策略：[草坪点景组团 1.0.2](https://mr-pardon.github.io/verdflow-resources/?type=strategies&id=lawn-feature-groups&version=1.0.2)。使用前需导入策略并单独确认信任，兼容版本由客户端解析。
- 植被来源：[DTS_Library_v6 6.0.0](https://mr-pardon.github.io/verdflow-resources/?type=assets&id=dts-library&version=6.0.0)。用于追溯与继续选材，不是额外的强制安装项；VFP 已携带配置快照。
- 配套模型：[DTS_Library_v6 PAK 下载入口](https://pan.baidu.com/s/1Te07ATBL0UrvJVowNR5k8w?pwd=sp4c)，提取码 `sp4c`，需在 DTS 中另行准备。

## 作者署名

Mr_Pardon

## 许可与素材来源

方案配置由 Mr_Pardon 发布，按 Apache-2.0 授权。
植被模型与 PAK 来自 DTS_Library_v6 的关联入口，模型、PAK 与场景素材遵循原资源授权，
不随方案配置一同转为 Apache-2.0 授权。

## 投稿确认

提交自己的资源时，核对并勾选表单中的两项声明：

- 已移除私人路径、项目资料与凭据，确认拥有所提交内容的分发权。
- 理解资源收录不代表策略安全认证，也不会自动授予客户端执行信任。

## 换成你的方案时

- 使用自己的场景截图，并说明哪些是方案生成的植被，哪些是原有场景内容。
- 列出保存时使用的策略名称、版本和链接，以及各来源资产库；未收录的资源可以写名称与获取方式，不必先申请网站 ID。
- 来源资产库可以有多个，但不应把它们一概写成运行前必须安装；仍应说明模型本体如何合法获取和准备。
- 从 VerdFlow 导出实际 VFP，提供公开可获取的文件链接；无需手写包格式、`resource.json` 或文件校验值。
- 核对配置、缩略图和场景截图的发布权限，避免泄露客户项目、私人路径与未获授权素材。
