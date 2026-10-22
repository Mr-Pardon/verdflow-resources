# VerdFlow Resources

Independent resource-center UI and publication catalog. Read README.md and
docs/resource-format.md before modifying content or publishing behavior.

- Keep web, catalog entries, and publishing tools separate. Never import the product Core.
- Only reviewed entries belong in entries/. Test fixtures never ship in the catalog.
- Never invent released versions, downloads, resource counts or author permissions.
- VFA/VFS/VFP binaries belong in Releases, PAK files are external links only.
- A plan's source catalogs are provenance, not mandatory installed dependencies.
- Downloading or listing a strategy never grants execution trust.
- README is untrusted Markdown, not Vue, HTML or executable package code.
- Do not alter package formats to support this site. Preserve package identities.
- Keep private paths, project data and credentials out of public assets.
- Run npm run check, npm test, npm run build and npm run test:browser.
- Remote creation, publication and resource ingestion require explicit scope.
