# Contributing

Thank you for helping improve the Microproduct Incubator knowledge hub. The full contribution workflow lives in the site guide at `/contribute` and in [`docs/contribute/how-to-contribute.md`](docs/contribute/how-to-contribute.md), which is the canonical source of truth.

## Quickstart

- Add or update playbook modules from `templates/playbook-module.md`. Showcase entries edit the table in `docs/showcase/microproducts.md`. Other doc islands follow that section’s existing page.
- Ensure each markdown file includes `title`, `description`, `last_reviewed` (`YYYY-MM-DD`), and `authors` (registered IDs from `src/data/authors.json`). Default `content_kind` is `module`, which requires `authors`. Author registry records may include an optional plain-text `bio` for their native `/authors/<id>` profile page.
- Run checks locally:

```bash
npm run check
```

- Open a pull request and complete the checklist.

For contribution details, review expectations, and section-specific guidance, use [`docs/contribute/how-to-contribute.md`](docs/contribute/how-to-contribute.md).
