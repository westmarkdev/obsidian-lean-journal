# Manual Test Plan for Obsidian Lean Journal Plugin

### Refactor Plan - 2024-08-19

```typescript
// TODO: Refactor the MainTS into more managable pieces:
// 1. Create separate files for different functionalities:

// 1a. Test JournalManager.ts: Handles journal entry creation and modification
// 1b. MOCManager.ts: Manages Map of Contents creation and updates
// 1c. LogManager.ts: Handles log property operations (including the LogCleaner)
// 1d. SettingsManager.ts: Manages plugin settings

// 2. Create a utils.ts file for utility functions
// 3. Move the LeanJournalSettingTab to its own file
// 4. Simplify the main LeanJournalPlugin class
// 5.  We should move them to a separate file in a 'tests' folder.  then add a development-only command to run these tests.
```

## 1. Basic Functionality

1.1. Installation

- [ ] Plugin can be installed through Obsidian's Community Plugins
- [ ] Plugin can be enabled/disabled without errors

1.2. Journal Entry Creation

- [x] Clicking the ribbon icon creates a new journal entry
- [x] Using the "Add Journal Entry" command creates a new journal entry
- [x] Entries are added in reverse chronological order
- [ ] Correct date and time formats are used based on settings
	- Need to test with different date and time formats: wait a whole day to see if the date changes correctly

1.3. Settings

- [ ] All settings can be changed and saved successfully
- [ ] Changed settings are applied correctly to new entries

## 2. File Handling

2.1. Journal File

- [x] Plugin creates a new journal file if it doesn't exist
- [x] Plugin correctly appends to an existing journal file

2.2. MOC Files

- [ ] MOC files are created in the specified folder
- [ ] MOC files are named correctly based on the date

2.3. LOG Property Handling

- [ ] Plugin adds the LOG property with the creation date when a new file is created
- [ ] Plugin doesn't duplicate the LOG property when updating an existing file
- [ ] Plugin adds a new date to the existing LOG property list when a file is modified on a different day
- [ ] LOG property correctly maintains a list of unique dates in chronological order

## 3. MOC Functionality

3.1. Auto MOC

- [ ] MOC is created/updated automatically when Auto MOC is enabled
- [ ] MOC is not created/updated when Auto MOC is disabled

3.2. Manual MOC Creation

- [ ] "Create Daily MOC" command creates/updates MOC for the current day
- [ ] MOC contains correct links to journal entries

3.3. Backfill MOC

- [ ] "Backfill MOC for Existing Notes" command creates MOC files for all dates in the journal
- [ ] Backfilled MOC files contain correct links to journal entries

## 4. Edge Cases

4.1. Date Handling

- [ ] Plugin handles date change at midnight correctly
- [ ] Plugin works correctly when computer's date/time settings are changed

4.2. File Conflicts

- [ ] Plugin behaves correctly if journal file is deleted while Obsidian is open
- [ ] Plugin handles concurrent edits to journal file (e.g., from another plugin or sync)

4.3. Large Files

- [ ] Plugin performs well with a large journal file (e.g., 1000+ entries)
- [ ] Backfill function works correctly with a large journal file

4.4. LOG Property Behavior

- [ ] Create a new file and verify the LOG property is added correctly
- [ ] Modify the same file on the same day and verify the LOG property doesn't change
- [ ] Modify the file on a different day and verify a new date is added to the LOG property
- [ ] Manually create a file with a duplicate LOG property and verify the plugin corrects it on the next modification

## 5. User Experience

5.1. Performance

- [ ] Adding entries feels responsive and quick
- [ ] MOC creation/update doesn't noticeably slow down the application

5.2. UI/UX

- [ ] All UI elements are clearly visible and accessible
- [ ] Settings descriptions are clear and helpful

## 6. Compatibility

6.1. Obsidian Versions

- [ ] Plugin works on the minimum supported Obsidian version
- [ ] Plugin works on the latest Obsidian version

6.2. Operating Systems

- [ ] Plugin functions correctly on Windows
- [ ] Plugin functions correctly on macOS
- [ ] Plugin functions correctly on Linux

6.3. Other Plugins

- [ ] Plugin doesn't conflict with other popular Obsidian plugins (list top 5-10 plugins to test with)

## 7. Localization

7.1. Non-English Characters

- [ ] Plugin correctly handles non-English characters in journal entries
- [ ] Plugin correctly handles non-English characters in file paths and settings

## Test Execution

For each test case:

1. Describe the steps to reproduce
2. Note the expected result
3. Record the actual result
4. Mark as Pass/Fail
5. If Fail, note any error messages or unexpected behavior

After completing all tests, summarize:

- Total number of tests
- Number of passed tests
- Number of failed tests
- List of any critical issues found

This test plan will help ensure that all aspects of the plugin are functioning correctly before we proceed with
implementing error handling and notifications. Once we have the results from this test plan, we can prioritize which
areas need additional error handling and what types of notifications would be most beneficial to users.
