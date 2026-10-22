export const siteUrl = 'https://mr-pardon.github.io/verdflow-site/';
export const manual = path => new URL(path, siteUrl).href;
const configuredRepo = import.meta.env.VITE_RESOURCE_REPOSITORY ?? 'https://github.com/Mr-Pardon/verdflow-resources';
if (configuredRepo && !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(configuredRepo)) {
  throw new Error('Invalid resource repository URL');
}
export const repositoryUrl = configuredRepo;
export const categories = [
  { id: 'assets', name: '资产库', shortName: '资产', extension: 'VFA', description: '植被资产与分类',
    emptyTitle: '首批资产库正在整理', emptyText: 'DTS 资产库将与配套 PAK 下载入口一同上线。',
    guide: 'resources/assets.html', guideTitle: '认识资产库', authoring: 'authoring/assets.html', authoringTitle: 'VFA Author', tone: 'green' },
  { id: 'strategies', name: '策略', shortName: '策略', extension: 'VFS', description: '空间布局与生成规则',
    emptyTitle: '策略包即将上架', emptyText: '资源审核完成后，可在这里获取策略包与版本说明。',
    guide: 'resources/strategies.html', guideTitle: '认识策略与角色', authoring: 'authoring/strategy.html', authoringTitle: 'VFS Author', tone: 'blue' },
  { id: 'plans', name: '种植方案', shortName: '种植方案', extension: 'VFP', description: '搭配与效果预设',
    emptyTitle: '种植方案尚未上架', emptyText: '已配置的植被搭配与种植参数，将以独立方案在这里发布。',
    guide: 'resources/mixes.html', guideTitle: '认识种植方案', authoring: 'resources/mixes.html', authoringTitle: '创建与分享方案', tone: 'ochre' },
];
export const categoryById = id => categories.find(category => category.id === id) || categories[0];
export const asset = path => `${import.meta.env.BASE_URL}${path}`;
