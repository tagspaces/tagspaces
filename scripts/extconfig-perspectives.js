// Sample: distributor whitelist of perspectives. When ExtEnabledPerspectives
// is set, the Settings → Perspectives tab becomes read-only and the
// perspective switcher only shows the listed IDs. The user's own toggles in
// state.settings.enabledPerspectives are ignored on every load.
//
// Optionally pin the initial perspective for newly opened folders that have
// no per-folder preference in .ts/tsm.json.
//
// Available IDs: grid, list, gallery, mapique, kanban, folderviz, calendar.
window.ExtEnabledPerspectives = ['grid', 'list', 'kanban'];
window.ExtDefaultPerspective = 'grid';
