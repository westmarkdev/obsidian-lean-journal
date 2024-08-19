# Changelog

All notable changes to the Obsidian Lean Journal Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Automatic jest testing (plan documented in QA.md)

## [0.1.2] - 2024-08-18

### Fixed

- Resolved issue with MOC updates occurring too frequently
- Corrected timing of MOC updates to respect the user-defined interval

### Changed

- Refactored codebase for improved maintainability and performance
- Moved core functionalities into separate manager classes (JournalManager, MOCManager, LogManager)
- Improved settings management with a dedicated SettingsManager

### Added

- Enhanced debug logging for easier troubleshooting
- Implemented proper cleanup of intervals and event listeners

### Improved

- Overall plugin stability and performance
- Code organization and structure

## [0.1.1] - 2024-08-16

### Fixed

- Issue with LOG property being incorrectly rewritten when updating files
- LOG property now correctly maintains a list of unique dates in chronological order

### Changed

- Improved handling of LOG property for both new and existing files
- Enhanced error handling and added debug logging for easier troubleshooting

### Added

- New test cases to verify correct LOG property behavior

## [0.1.0] - 2024-08-14

### Added

- Initial release of Obsidian Lean Journal Plugin
- Core functionality to add journal entries in reverse chronological order
- Settings to customize journal file path, date format, and time format
- Command to add new journal entry
- Ribbon icon for quick access to "Add Journal Entry" function
- Automatic creation of journal file if it doesn't exist
- Daily Map of Contents (MOC) feature
- Auto-MOC creation option
- Command to manually create/update daily MOC
- Command to backfill MOC for existing journal entries
- Settings for MOC folder path and auto-MOC toggle
- Automatic addition of "log" property to new files
- Command to backfill "log" property for existing files
