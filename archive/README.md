# Archive

Parts of the dashboard template that the app does not use right now. Nothing here is built,
linted, type-checked or routed.

Paths match the project, so to bring something back, move it to the same path under `src/`
together with the files it imports (`types/index.d.ts`, `utils/index.ts`,
`composables/useDashboard.ts`).

`layouts/default.vue`, `components/UserMenu.vue`, `pages/index.vue`, `pages/settings.vue` and
`pages/settings/security.vue` are the original versions of files that are still in `src/`: copy
the parts you need instead of replacing the file.

The packages `@tanstack/charts`, `@tanstack/table-core`, `@internationalized/date` and `scule`
are only used here.
