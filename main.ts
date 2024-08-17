import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  moment,
  addIcon,
  debounce
} from 'obsidian';

interface LeanJournalSettings {
  journalFilePath: string;
  dateFormat: string;
  timeFormat: string;
  enableAutoMOC: boolean;
  mocFolderPath: string;
  mocUpdateInterval: number; // in minutes
  debug: boolean; // New debug flag
}

const DEFAULT_SETTINGS: LeanJournalSettings = {
  journalFilePath: 'Journal.md',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  enableAutoMOC: false,
  mocFolderPath: 'Daily Notes',
  mocUpdateInterval: 15, // Increased default interval to reduce frequency
  debug: false
};

const JOURNAL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="12" y1="6" x2="18" y2="6"></line><line x1="12" y1="10" x2="18" y2="10"></line><line x1="12" y1="14" x2="18" y2="14"></line><line x1="12" y1="18" x2="18" y2="18"></line></svg>`;

export default class LeanJournalPlugin extends Plugin {
  settings: LeanJournalSettings;
  mocInterval: number | undefined;
  private debouncedCreateDailyMOC: () => void;

  async onload() {
    await this.loadSettings();

    addIcon('journal', JOURNAL_ICON);

    this.addRibbonIcon('journal', 'Add Journal Entry', () => {
      this.addJournalEntry();
      this.setViewToJournal();
    });

    this.addCommand({
      id: 'add-journal-entry',
      name: 'Add Journal Entry',
      callback: async () => {
        await this.addJournalEntry();
      }
    });

    this.addCommand({
      id: 'create-daily-moc',
      name: 'Create Daily MOC',
      callback: () => {
        this.setViewToDailyNote();
        this.createDailyMOC();
      }
    });

    this.addCommand({
      id: 'backfill-log-property',
      name: 'Backfill Log Property for Existing Notes',
      callback: () => this.backfillLogProperty()
    });

    this.addSettingTab(new LeanJournalSettingTab(this.app, this));

    // Debounce the createDailyMOC function to prevent excessive calls
    this.debouncedCreateDailyMOC = debounce(
      () => this.createDailyMOC(),
      5000,
      true
    );

    if (this.settings.enableAutoMOC) {
      this.startMocInterval();
    }

    // Only add the event listener if auto MOC is enabled
    if (this.settings.enableAutoMOC) {
      this.registerEvent(
        this.app.vault.on('create', (file) => {
          if (file instanceof TFile && file.extension === 'md') {
            this.addLogPropertyToFile(file);
          }
        })
      );
    }
  }

  startMocInterval() {
    if (this.mocInterval) {
      window.clearInterval(this.mocInterval);
    }
    this.mocInterval = window.setInterval(
      () => this.debouncedCreateDailyMOC(),
      this.settings.mocUpdateInterval * 60 * 1000
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    if (this.settings.enableAutoMOC) {
      this.startMocInterval();
    } else if (this.mocInterval) {
      window.clearInterval(this.mocInterval);
    }
  }

  private log(message: string) {
    if (this.settings.debug) {
      console.log(`[Lean Journal] ${message}`);
    }
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

      const tFile = file as TFile;
      const content = await this.app.vault.read(tFile);
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
        console.error('Invalid file type:', file);
      }

      if (this.settings.enableAutoMOC) {
        this.debouncedCreateDailyMOC();
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

  async setViewToDailyNote() {
    const today = moment().format(this.settings.dateFormat);
    const file = this.app.vault.getAbstractFileByPath(
      `${this.settings.mocFolderPath}/${today}.md`
    );
    if (file instanceof TFile) {
      await this.app.workspace.openLinkText(file.path, '', true);
    }
  }

  async createDailyMOC() {
    try {
      const today = moment().format(this.settings.dateFormat);
      const mocFilePath = `${this.settings.mocFolderPath}/${today}.md`;

      let mocFile = this.app.vault.getAbstractFileByPath(mocFilePath);
      if (!(mocFile instanceof TFile)) {
        mocFile = await this.app.vault.create(mocFilePath, '');
      }

      if (!(mocFile instanceof TFile)) {
        throw new Error('Failed to create or access MOC file');
      }

      let existingContent = await this.app.vault.read(mocFile);
      const existingEntries = new Set(
        (existingContent.match(/- \[\[(.*?)\]\]/g) || []).map((entry) =>
          entry.replace(/- \[\[(.*?)\]\]/, '$1')
        )
      );

      const files = this.app.vault.getMarkdownFiles();

      const todayEntries = files.filter((file) => {
        const metadata = this.app.metadataCache.getFileCache(file);
        const log = metadata?.frontmatter?.log;
        if (!Array.isArray(log) || log.length === 0) return false;

        const logDate = log[0].replace(/\[|\]/g, '');
        return logDate === today && !existingEntries.has(file.basename);
      });

      if (todayEntries.length > 0) {
        const newEntriesContent = todayEntries
          .map((file) => `- [[${file.basename}]]`)
          .join('\n');

        if (existingContent.includes('## Linked Notes')) {
          existingContent = existingContent.replace(
            '## Linked Notes\n\n',
            `## Linked Notes\n\n${newEntriesContent}\n`
          );
        } else {
          existingContent += `\n\n## Linked Notes\n\n${newEntriesContent}`;
        }

        await this.app.vault.modify(mocFile, existingContent);
      }

      this.log(`Daily MOC updated successfully`);
    } catch (error) {
      console.error('Error creating daily MOC:', error);
      new Notice('Failed to create daily MOC. Check the console for details.');
    }
  }

  async addLogPropertyToFile(file: TFile) {
    try {
      const content = await this.app.vault.read(file);
      const createdDate = moment(file.stat.ctime).format(
        this.settings.dateFormat
      );
      const updatedContent = this.addLogToFrontMatter(content, createdDate);
      await this.app.vault.modify(file, updatedContent);
      this.log(`Log property added to ${file.path}`);
    } catch (error) {
      console.error(`Error adding log property to ${file.path}:`, error);
    }
  }

  addLogToFrontMatter(content: string, date: string): string {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);
    if (match) {
      const frontMatter = match[1];
      const updatedFrontMatter = frontMatter + `\nlog:\n  - "[[${date}]]"`;
      return content.replace(
        frontMatterRegex,
        `---\n${updatedFrontMatter}\n---`
      );
    } else {
      return `---\nlog:\n  - "[[${date}]]"\n---\n` + content;
    }
  }

  async backfillLogProperty() {
    try {
      const files = this.app.vault.getMarkdownFiles();
      const filesToUpdate = files.filter(
        (file) => !this.app.metadataCache.getFileCache(file)?.frontmatter?.log
      );

      new Notice(`Updating log property for ${filesToUpdate.length} files...`);

      for (const file of filesToUpdate) {
        await this.addLogPropertyToFile(file);
      }

      new Notice(`Updated log property for ${filesToUpdate.length} files.`);
      this.log(`Backfilled log property for ${filesToUpdate.length} files`);
    } catch (error) {
      console.error('Error backfilling log property:', error);
      new Notice(
        'Failed to backfill log property. Check the console for details.'
      );
    }
  }

  async backupJournal() {
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
}

class LeanJournalSettingTab extends PluginSettingTab {
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
      .addDropdown((dropdown) => {
        const folders = this.plugin.app.vault
          .getAllLoadedFiles()
          .filter((f) => f instanceof TFolder)
          .map((f) => f.path);
        folders.forEach((folder) => dropdown.addOption(folder, folder));
        dropdown
          .setValue(this.plugin.settings.mocFolderPath)
          .onChange(async (value) => {
            this.plugin.settings.mocFolderPath = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('MOC Update Interval')
      .setDesc('Interval (in minutes) to update MOC')
      .addText((text) =>
        text
          .setPlaceholder('15')
          .setValue(String(this.plugin.settings.mocUpdateInterval))
          .onChange(async (value) => {
            this.plugin.settings.mocUpdateInterval = parseInt(value);
            await this.plugin.saveSettings();
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
