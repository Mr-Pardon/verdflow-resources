// In-memory verification data only. Never copied into entries or production output.
export function record(overrides = {}) {
  return {
    schemaVersion: 1, id: 'test.catalog', type: 'assets', name: '测试资产库',
    summary: '仅供自动化验证，不是已发布资源。', author: 'Test author', platforms: ['DTS'],
    tags: ['测试'], license: 'Test only', recommended: '1.0.0', cover: 'media/cover.png',
    versions: [{ version: '1.0.0', releasedAt: '2026-10-22', readme: 'README.md', status: 'published',
      package: { identity: 'test_catalog', url: 'https://github.com/example/resources/releases/download/test/catalog.vfa', filename: 'catalog.vfa', bytes: 42, sha256: 'a'.repeat(64) }, relations: [] }],
    ...overrides,
  };
}
