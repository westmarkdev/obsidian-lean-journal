import { addIcon, Plugin, TFile } from 'obsidian';
import {
  LeanJournalSettings,
  LeanJournalSettingTab,
  SettingsManager
} from './src/SettingsManager';
import { JournalManager } from 'src/JournalManager';
import { MOCManager } from 'src/MOCManager';
import { LogManager } from './src/LogManager';
import { JOURNAL_ICON } from './src/constants';
import { runLogCleanerTests } from './src/tests/test_logs';

// BUG:When the plugin is enabled on Obsidian Sync, it causes duplicate 'log' properties to be added when files are created.
// ENHANCEMENT: Optimize plugin startup behavior to reduce impact on Obsidian launch time
// ENHANCEMENT: Delay initialization of auto-logging and MOC creation until needed or after a short startup delay
// ENHANCEMENT: Change the log property addition to avoid unnecessary operations on files that already have log properties
// QUALITY: Improve Overall plugin performacne and reduce resource usage during Obsidian startup
export default class LeanJournalPlugin extends Plugin {
  // TODO: Delay MOC and auto-logging initialization
  // The plugin needs to wait for Obsidian's layout to be ready before initializing auto-features.
  // Add an an additional 3-second delay after the layout is ready, giving Obsidian more time to settle.
  // Auto-logging and MOC creation should ONLY set up if they're enabled in settings.
  // The initializeAutoFeatures method must ensure that these features are set up when needed, even if they weren't initialized at startup.
  // The addJournalEntry method needs to call initializeAutoFeatures, ensuring that auto-logging and MOC creation are set up when the user adds a journal entry, if they weren't already.
  settings: LeanJournalSettings;
  settingsManager: SettingsManager;
  journalManager: JournalManager;
  mocManager: MOCManager; // TODO: Modify the MOCManager to support delayed start.
  logManager: LogManager; // FIXME: Address the specific concern about the add log property function being called on every file.

  async onload() {
    this.settingsManager = new SettingsManager(this);
    await this.settingsManager.loadSettings();
    this.initializeManagers();
    this.addCommands();
    this.addSettingTab(new LeanJournalSettingTab(this.app, this));
    this.setupUI();
    this.setupEventListeners();

    if (this.settings.enableAutoMOC) {
      this.mocManager.startMocInterval();
    }
  }

  onunload() {
    this.mocManager.stopMocInterval();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.mocManager.restartMocInterval();
  }

  private setupEventListeners() {
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          this.logManager.addLogPropertyToFile(file);
          if (this.settings.enableAutoMOC) {
            this.mocManager.updateMOC();
          }
        }
      })
    );
  }

  private initializeManagers() {
    this.journalManager = new JournalManager(this.app, this.settings);
    this.mocManager = new MOCManager(this.app, this.settings);
    this.logManager = new LogManager(this.app, this.settings);
  }

  private addCommands() {
    this.addCommand({
      id: 'add-journal-entry',
      name: 'Add Journal Entry',
      callback: () => this.journalManager.addJournalEntry()
    });

    this.addCommand({
      id: 'create-daily-moc',
      name: 'Create Daily MOC',
      callback: () => this.mocManager.createDailyMOC()
    });

    this.addCommand({
      id: 'backfill-log-property',
      name: 'Backfill Log Property for Existing Notes',
      callback: () => this.logManager.backfillLogProperty()
    });

    this.addCommand({
      id: 'reset-logs',
      name: 'Reset Log Properties',
      callback: () => this.logManager.resetLogs()
    });

    if (process.env.NODE_ENV === 'development') {
      this.addCommand({
        id: 'test-log-cleaner',
        name: 'Run Log Cleaner Tests',
        callback: () => runLogCleanerTests()
      });
    }
  }

  private setupUI() {
    addIcon('journal', JOURNAL_ICON);
    this.addRibbonIcon('journal', 'Add Journal Entry', () => {
      this.journalManager.addJournalEntry();
      this.journalManager.setViewToJournal();
    });
  }
}
