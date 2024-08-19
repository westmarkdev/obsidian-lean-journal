import { App, debounce, moment, Notice, TFile } from 'obsidian';
import { LeanJournalSettings } from './SettingsManager';

export class MOCManager {
  private mocInterval: number | undefined;
  private lastUpdateTime = 0;
  updateMOC = debounce(
    () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - this.lastUpdateTime;
      const updateIntervalMs = this.settings.mocUpdateInterval * 60 * 1000;

      if (timeSinceLastUpdate >= updateIntervalMs) {
        this.log(
          `Executing MOC update after ${timeSinceLastUpdate / 1000} seconds`
        );
        this.createDailyMOC();
        this.lastUpdateTime = now;
      } else {
        this.log(
          `Skipping MOC update. Only ${timeSinceLastUpdate / 1000} seconds since last update`
        );
      }
    },
    1000,
    true
  );

  constructor(
    private app: App,
    private settings: LeanJournalSettings
  ) {}

  startMocInterval() {
    if (this.mocInterval) {
      window.clearInterval(this.mocInterval);
    }
    this.mocInterval = window.setInterval(
      () => {
        this.log('MOC interval triggered');
        this.updateMOC();
      },
      this.settings.mocUpdateInterval * 60 * 1000
    );
    this.log(
      `MOC interval started, set to ${this.settings.mocUpdateInterval} minutes`
    );
  }

  stopMocInterval() {
    if (this.mocInterval) {
      window.clearInterval(this.mocInterval);
      this.mocInterval = undefined;
      this.log('MOC interval stopped');
    }
  }

  restartMocInterval() {
    this.stopMocInterval();
    if (this.settings.enableAutoMOC) {
      this.startMocInterval();
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

  log(message: string) {
    if (this.settings.debug) {
      console.log(`Lean Journal: ${message}`);
    }
  }
}
