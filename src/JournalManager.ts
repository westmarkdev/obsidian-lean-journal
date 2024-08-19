import { App, moment, Notice, TFile } from 'obsidian';
import { LeanJournalSettings } from './SettingsManager';

export class JournalManager {
  private app: App;
  private settings: LeanJournalSettings;

  constructor(app: App, settings: LeanJournalSettings) {
    this.app = app;
    this.settings = settings;
  }

  async addJournalEntry() {
    try {
      await this.backupJournal();

      let file = this.app.vault.getAbstractFileByPath(
        this.settings.journalFilePath
      );

      if (!(file instanceof TFile)) {
        file = await this.app.vault.create(this.settings.journalFilePath, '');
      }

      const content = await this.app.vault.read(file as TFile);
      const today = moment().format(this.settings.dateFormat);
      const now = moment().format(this.settings.timeFormat);

      const todayHeading = `## [[${today}]]`;
      const timeEntry = `### ${now}\n\n`;

      let updatedContent: string;

      if (content.includes(todayHeading)) {
        const headingIndex = content.indexOf(todayHeading);
        const afterHeading = content.slice(headingIndex + todayHeading.length);
        updatedContent =
          content.slice(0, headingIndex + todayHeading.length) +
          '\n\n' +
          timeEntry +
          afterHeading.trim();
      } else {
        updatedContent = `${todayHeading}\n\n${timeEntry}${content ? '\n\n' + content : ''}`;
      }

      if (file instanceof TFile) {
        await this.app.vault.modify(file, updatedContent);
      } else {
        throw new Error('Invalid file type');
      }

      this.log(`Journal entry added successfully`);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      new Notice('Failed to add journal entry. Check the console for details.');
    }
  }

  async setViewToJournal() {
    const file = this.app.vault.getAbstractFileByPath(
      this.settings.journalFilePath
    );
    if (file instanceof TFile) {
      await this.app.workspace.openLinkText(file.path, '', true);
    }
  }

  private async backupJournal() {
    try {
      const journalFile = this.app.vault.getAbstractFileByPath(
        this.settings.journalFilePath
      );
      if (journalFile instanceof TFile) {
        const content = await this.app.vault.read(journalFile);
        const backupPath = `${this.settings.journalFilePath}.backup`;
        const backupFile = this.app.vault.getAbstractFileByPath(backupPath);
        if (backupFile instanceof TFile) {
          await this.app.vault.delete(backupFile);
        }
        await this.app.vault.create(backupPath, content);
        this.log(`Journal backup created successfully`);
      }
    } catch (error) {
      console.error('Error backing up journal:', error);
      new Notice('Failed to backup journal. Check the console for details.');
    }
  }

  // FIXME: This should be a general utility function
  private log(message: string) {
    if (this.settings.debug) {
      console.log(`[Lean Journal] ${message}`);
    }
  }
}
