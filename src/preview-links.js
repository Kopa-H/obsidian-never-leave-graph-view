'use strict';

const { TFile, Keymap } = require('obsidian');

const previewLinkMethods = {
  previewLinkElement(target) {
    const leaf = this.previewLeaf;
    if (!this.isLeafAlive(leaf) || !leaf.containerEl || !target || !target.closest) return null;
    if (!leaf.containerEl.contains(target)) return null;
    return target.closest('.internal-link, .cm-hmd-internal-link');
  },

  handlePreviewLinkOver(evt) {
    if (!this.settings.focusGraphFromPreviewLinks || !this.armedPath) return;
    const link = this.previewLinkElement(evt.target);
    if (!link || this.previewLinkElement(evt.relatedTarget) === link) return;
    const file = this.previewLinkFile(link);
    if (!(file instanceof TFile)) return;
    this.previewLinkHoverPath = file.path;
    for (const { renderer } of this.patchedRenderers) {
      const node = renderer.nodeLookup && renderer.nodeLookup[file.path];
      if (!node) continue;
      renderer.__gnpPreviewLinkNode = node;
      renderer.highlightNode = node;
      if (renderer.changed) renderer.changed();
    }
  },

  handlePreviewLinkOut(evt) {
    const link = this.previewLinkElement(evt.target);
    if (!link || this.previewLinkElement(evt.relatedTarget) === link) return;
    this.clearPreviewLinkFocus();
  },

  previewLinkFile(link) {
    if (!link) return null;
    const linktext = link.getAttribute('data-href') || link.getAttribute('href');
    const leaf = this.previewLeaf;
    const sourcePath = leaf && leaf.view && leaf.view.file ? leaf.view.file.path : '';
    const file = linktext && this.app.metadataCache.getFirstLinkpathDest(linktext, sourcePath);
    return file instanceof TFile ? file : null;
  },

  handlePreviewLinkClick(evt) {
    if (!this.settings.openPreviewLinksInConnectedEditor
        || !this.armedPath
        || evt.button !== 0
        || (Keymap.isModEvent && Keymap.isModEvent(evt))) return;
    const file = this.previewLinkFile(this.previewLinkElement(evt.target));
    if (!file) return;
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.editInPreview(file).catch((e) => console.error('graph-node-preview:', e));
  },

  clearPreviewLinkFocus() {
    if (!this.previewLinkHoverPath) return;
    this.previewLinkHoverPath = null;
    for (const { renderer } of this.patchedRenderers) {
      if (!renderer.__gnpPreviewLinkNode) continue;
      renderer.__gnpPreviewLinkNode = null;
      renderer.highlightNode = renderer.__gnpHoverNode || renderer.__gnpPinnedNode || null;
      if (renderer.changed) renderer.changed();
    }
  },
};

module.exports = { previewLinkMethods };
