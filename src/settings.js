'use strict';

const { PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
  leafId: null,
  allowGraphInteraction: true,
  cursorAtStart: true,
  exitOnEmptyCanvasClick: true,
  graphHoverOverridesFocus: true,
  focusGraphFromPreviewLinks: true,
  openPreviewLinksInConnectedEditor: true,
  dimNonPreviewPanes: false,
  showModificationNotices: false,
};

class GraphNodePreviewSettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Graph Node Preview' });
    this.addToggle('Permitir interactuar con el grafo al editar', 'Mantiene pan, zoom y selección de nodos activos mientras el panel conectado tiene el foco.', 'allowGraphInteraction');
    this.addToggle('Cursor al principio de la nota', 'Al abrir una nota desde el grafo, coloca el cursor en la línea 0, columna 0.', 'cursorAtStart');
    this.addToggle('Clic vacío para cerrar la nota', 'Un clic izquierdo en un espacio vacío del grafo sale del modo de edición.', 'exitOnEmptyCanvasClick');
    this.addToggle('Hover de nodo con prioridad visual', 'Al pasar sobre otro nodo, muestra temporalmente su foco en lugar del de la nota editada.', 'graphHoverOverridesFocus');
    this.addToggle('Enlaces de la nota enfocan el grafo', 'Al pasar sobre un enlace interno del panel conectado, enfoca temporalmente su nodo en el grafo.', 'focusGraphFromPreviewLinks');
    this.addToggle('Abrir enlaces en el panel conectado', 'Un clic izquierdo en un enlace interno abre su nota en este mismo editor.', 'openPreviewLinksInConnectedEditor');
    this.addToggle('Atenuar otros paneles al editar', 'Recupera la opacidad reducida de los paneles que no son el editor conectado ni el grafo.', 'dimNonPreviewPanes');
    this.addToggle('Mostrar avisos al guardar', 'Muestra un aviso de modificación después de guardar una nota.', 'showModificationNotices');
  }

  addToggle(name, desc, key) {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addToggle((toggle) => toggle
        .setValue(!!this.plugin.settings[key])
        .onChange(async (value) => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        }));
  }
}

module.exports = { DEFAULT_SETTINGS, GraphNodePreviewSettingsTab };
