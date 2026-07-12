# I Will Never Leave the Graph View

An Obsidian plugin for a graph-first workflow: **preview, edit, and create notes without ever leaving the graph view.**

The graph stops being a read-only map and becomes the place you actually work.

## What it does

- **Hover a node → preview it.** A companion pane in the right sidebar shows the note under your cursor. Move off the node and it returns to a blank idle state — hovering never commits anything.
- **Click a node → edit it.** The note opens in the pane, focused and ready to type. The clicked node pops (1.33×) and Obsidian's native spotlight (node + linked neighbours) stays pinned while you write. The graph freezes so a stray hover can't break your focus.
- **Click a greyed-out node → create it.** The note is created *at that node's position* (it doesn't fly off), opened for editing immediately. Leave without typing and it quietly deletes itself, reverting the node to grey.
- **Add a note anywhere.** A button in the graph's control bar, or right-click empty canvas → *New note here* — the note is born at that exact spot.
- **Filter-aware creation.** With a graph filter active, new notes are made to *match* it (created in a `path:` folder, seeded with a `tag:` or search term) so they don't vanish on creation. When conforming isn't possible, the filter is briefly lifted and restored once the note qualifies on its own.
- **A live eye** in the pane's tab watches your pointer, and blinks when you enter and leave editing.
- **Orientation cues:** the rest of the workspace dims while you edit, an active-filter pill sits at the bottom of the graph, and finishing (click the graph, or press <kbd>Esc</kbd>) returns everything to a clean idle state.

The companion pane appears whenever a graph view is open and closes with it.

## Installation (manual)

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Copy them into `<your vault>/.obsidian/plugins/graph-node-preview/`.
3. Reload Obsidian and enable the plugin under Settings → Community plugins.

## Notes

This plugin drives Obsidian's graph renderer through internals that aren't part of the public API, so a future Obsidian update could require adjustments.

## License

MIT © [yaye.work](https://yaye.work) · hi@yaye.work
