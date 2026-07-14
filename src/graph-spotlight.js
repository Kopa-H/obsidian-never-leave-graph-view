'use strict';

const EDIT_NODE_SCALE = 1.33;
const EDIT_NODE_SCALE_MS = 300;

function cubicBezierEase(p1x, p1y, p2x, p2y) {
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const xt = 3 * t * (1 - t) * (1 - t) * p1x + 3 * t * t * (1 - t) * p2x + t * t * t - x;
      const dxdt = 3 * (1 - t) * (1 - t) * p1x + 6 * t * (1 - t) * (p2x - p1x) + 3 * t * t * (1 - p2x);
      if (Math.abs(dxdt) < 1e-6) break;
      t = Math.max(0, Math.min(1, t - xt / dxdt));
    }
    return 3 * t * (1 - t) * (1 - t) * p1y + 3 * t * t * (1 - t) * p2y + t * t * t;
  };
}

const editNodeEase = cubicBezierEase(0.7, 0, 0.4, 1.4);

const graphSpotlightMethods = {
  scaleUpEditedNode() {
    const leaf = this.previewLeaf;
    const file = this.isLeafAlive(leaf) && leaf.view && leaf.view.file;
    if (!file) return;
    this.clearGraphHover();
    const nodeId = file.path;
    this.waitForGraphNode(nodeId, (renderer) => {
      const currentLeaf = this.previewLeaf;
      if (!this.wasEditing || !this.isLeafAlive(currentLeaf) || !currentLeaf.view
          || !currentLeaf.view.file || currentLeaf.view.file.path !== nodeId) return;
      const target = { renderer, nodeId };
      if (this.scaledNode && this.scaledNode.nodeId !== nodeId) this.animateNodeScale(this.scaledNode, 1);
      this.scaledNode = target;
      this.bringNodeToFront(target);
      this.pinHighlight(target);
      this.animateNodeScale(target, EDIT_NODE_SCALE);
    });
  },

  pinHighlight(target) {
    const { renderer, nodeId } = target;
    const node = renderer.nodeLookup && renderer.nodeLookup[nodeId];
    if (!node) return;
    if (!renderer.__gnpHighlightPatched) {
      let current = renderer.highlightNode;
      Object.defineProperty(renderer, 'highlightNode', {
        configurable: true,
        get() { return current; },
        set(value) {
          current = renderer.__gnpPreviewLinkNode || renderer.__gnpHoverNode || renderer.__gnpPinnedNode || value;
        },
      });
      renderer.__gnpHighlightPatched = true;
    }
    this.pinnedHighlight = { renderer, nodeId };
    renderer.__gnpPinnedNode = node;
    renderer.highlightNode = node;
    if (renderer.changed) renderer.changed();
  },

  overridePinnedHover(renderer, nodeId, nodeType) {
    if (!this.settings.graphHoverOverridesFocus || !nodeId || nodeType === 'tag'
        || !this.pinnedHighlight || this.pinnedHighlight.renderer !== renderer) return;
    const node = renderer.nodeLookup && renderer.nodeLookup[nodeId];
    if (!node) return;
    renderer.__gnpHoverNode = node;
    renderer.highlightNode = node;
    if (renderer.changed) renderer.changed();
  },

  restorePinnedHover(renderer) {
    if (!renderer.__gnpHoverNode) return;
    renderer.__gnpHoverNode = null;
    renderer.highlightNode = renderer.__gnpPinnedNode || null;
    if (renderer.changed) renderer.changed();
  },

  unpinHighlight() {
    if (!this.pinnedHighlight) return;
    const { renderer } = this.pinnedHighlight;
    this.pinnedHighlight = null;
    renderer.__gnpHoverNode = null;
    renderer.__gnpPinnedNode = null;
    renderer.highlightNode = null;
    if (renderer.changed) renderer.changed();
  },

  bringNodeToFront(target) {
    const { renderer, nodeId } = target;
    const node = renderer.nodeLookup && renderer.nodeLookup[nodeId];
    if (!node) return;
    for (const key of ['circle', 'text']) {
      const obj = node[key];
      if (obj && obj.parent && typeof obj.parent.addChild === 'function') obj.parent.addChild(obj);
    }
    if (renderer.changed) renderer.changed();
  },

  scaleDownEditedNode() {
    this.unpinHighlight();
    if (!this.scaledNode) return;
    this.animateNodeScale(this.scaledNode, 1);
    this.scaledNode = null;
  },

  ensureNodeScale(target, factor) {
    const { renderer, nodeId } = target;
    const node = renderer.nodeLookup && renderer.nodeLookup[nodeId];
    if (!node) return;
    if (!node.__gnpBaseGetSize) {
      node.__gnpBaseGetSize = node.getSize.bind(node);
      node.__gnpScale = 1;
      node.getSize = () => node.__gnpBaseGetSize() * (node.__gnpScale || 1);
    }
    if (node.__gnpScale !== factor) {
      node.__gnpScale = factor;
      if (renderer.changed) renderer.changed();
    }
  },

  animateNodeScale(target, to) {
    const { renderer, nodeId } = target;
    const prev = this.nodeScaleAnims.get(nodeId);
    if (prev != null) cancelAnimationFrame(prev);
    const startNode = renderer.nodeLookup && renderer.nodeLookup[nodeId];
    const from = (startNode && startNode.__gnpScale) || 1;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / EDIT_NODE_SCALE_MS, 1);
      const value = p >= 1 ? to : from + (to - from) * editNodeEase(p);
      this.ensureNodeScale(target, value);
      if (p < 1) this.nodeScaleAnims.set(nodeId, requestAnimationFrame(step));
      else this.nodeScaleAnims.delete(nodeId);
    };
    this.nodeScaleAnims.set(nodeId, requestAnimationFrame(step));
  },
};

module.exports = { graphSpotlightMethods };
