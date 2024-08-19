// Handles log property operations (including the LogCleaner)

import { App, moment, Notice, TFile } from 'obsidian';
import { LeanJournalSettings } from './SettingsManager';

export class LogManager {
  private cleaner = new LogCleaner();

  constructor(
    private app: App,
    private settings: LeanJournalSettings
  ) {
    this.app = app;
    this.settings = settings;
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

  async resetLogs() {
    new Notice('Starting log reset process...');
    const files = this.app.vault.getMarkdownFiles();
    let processedCount = 0;
    let changedCount = 0;

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const newContent = this.cleaner.cleanLogProperty(content);

      if (newContent !== content) {
        await this.app.vault.modify(file, newContent);
        changedCount++;
      }

      processedCount++;
      if (processedCount % 100 === 0) {
        new Notice(`Processed ${processedCount} files...`);
      }
    }

    new Notice(
      `Log reset complete. Processed ${processedCount} files, updated ${changedCount} files.`
    );
  }

  // FIXME: This should be a general utility function
  private log(message: string) {
    if (this.settings.debug) {
      console.log(`[Lean Journal] ${message}`);
    }
  }
}

export class LogCleaner {
  cleanLogProperty(content: string): string {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);

    if (!match) return content; // No front matter, return original content

    let frontMatter = match[1];

    // Improved regex to match 'log:' and its values, including nested arrays or strings
    const logRegex =
      /log:\s*(?:-?\s*["']?\[\[.*?\]\]["']?\s*)*(?:-?\s*["']?.*?["']?\s*)*(?:\n\s*)*/g;

    // Remove all log properties and their values
    frontMatter = frontMatter.replace(logRegex, '');

    // Clean up any empty lines and trailing whitespace
    frontMatter = frontMatter
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')
      .trim();

    // If front matter is now empty, remove it entirely
    if (frontMatter === '') {
      return content.replace(frontMatterRegex, '');
    }

    // Otherwise, update the front matter
    return content.replace(frontMatterRegex, `---\n${frontMatter}\n---`);
  }
}
