import { App, PluginSettingTab, Setting } from 'obsidian';
import LeanJournalPlugin from '../main';

export interface LeanJournalSettings {
  journalFilePath: string;
  dateFormat: string;
  timeFormat: string;
  enableAutoMOC: boolean;
  mocFolderPath: string;
  mocUpdateInterval: number; // in minutes
  debug: boolean;
}

export const DEFAULT_SETTINGS: LeanJournalSettings = {
  journalFilePath: 'Journal.md',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  enableAutoMOC: false,
  mocFolderPath: 'Daily Notes',
  mocUpdateInterval: 15,
  debug: false
};

export class SettingsManager {
  private plugin: LeanJournalPlugin;

  constructor(plugin: LeanJournalPlugin) {
    this.plugin = plugin;
  }

  async loadSettings() {
    this.plugin.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.plugin.loadData()
    );
  }
}

export class LeanJournalSettingTab extends PluginSettingTab {
  plugin: LeanJournalPlugin;

  constructor(app: App, plugin: LeanJournalPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Lean Journal Settings' });

    new Setting(containerEl)
      .setName('Journal file path')
      .setDesc('Path to your journal file')
      .addText((text) =>
        text
          .setPlaceholder('Journal.md')
          .setValue(this.plugin.settings.journalFilePath)
          .onChange(async (value) => {
            this.plugin.settings.journalFilePath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Date format')
      .setDesc('Format for date headings')
      .addText((text) =>
        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async (value) => {
            this.plugin.settings.dateFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Time format')
      .setDesc('Format for time entries')
      .addText((text) =>
        text
          .setPlaceholder('HH:mm')
          .setValue(this.plugin.settings.timeFormat)
          .onChange(async (value) => {
            this.plugin.settings.timeFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable Auto MOC')
      .setDesc('Automatically create/update MOC when adding journal entries')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAutoMOC)
          .onChange(async (value) => {
            this.plugin.settings.enableAutoMOC = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('MOC Folder Path')
      .setDesc('Path to the folder where MOC files will be stored')
      .addText((text) =>
        text
          .setPlaceholder('Daily Notes')
          .setValue(this.plugin.settings.mocFolderPath)
          .onChange(async (value) => {
            this.plugin.settings.mocFolderPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('MOC Update Interval')
      .setDesc('Interval (in minutes) to update MOC')
      .addText((text) =>
        text
          .setPlaceholder('15')
          .setValue(String(this.plugin.settings.mocUpdateInterval))
          .onChange(async (value) => {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              this.plugin.settings.mocUpdateInterval = numValue;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName('Debug mode')
      .setDesc('Enable debug logging in console')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debug).onChange(async (value) => {
          this.plugin.settings.debug = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
