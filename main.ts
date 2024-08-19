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

export default class LeanJournalPlugin extends Plugin {
  settings: LeanJournalSettings;
  settingsManager: SettingsManager;
  journalManager: JournalManager;
  mocManager: MOCManager;
  logManager: LogManager;

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
