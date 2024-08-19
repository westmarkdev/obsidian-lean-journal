---
title: UX enhancements
description: Enhancements to the user experience of the plugin
---

## In testing

### UI enhancements

The current icon is pretty ugly. It would be nice to have a more visually appealing icon that fits in with the Obsidian
aesthetic. Maybe something like a calendar or a notebook would be nice.

### UX enhancements

#### Timer improvements

Currently no way to configure the interval of the timer. It would be nice to have a way to configure the interval of the
timer so that users can set it to update the MOC every hour, every day, or at a custom interval. This would make the
plugin more flexible and user-friendly.

#### Toasty/Notes

We should show the user what we are doing, especially if we are about to update the MOC or if that the timer is enabled
or not (perhabs a status bar). This will help the user understand what is happening and why. We should also be notifying
when we are about to update and backfill the log property and estitmate how many files we are be updating so they can
see it might be a long running operation.

#### Speed of MOC generation

Right now if someone creates a new notes, it's not included in the daily MOC until the timer runs out. It would be nice
to have a way to manually update the MOC to include the new note. Maybe when the user clicks the "Create new note"
button, the MOC is updated immediately and the timer is reset.

#### Folder picker

The current implementation of the folder picker is a bit clunky. It would be nice to have a more user-friendly folder
picker that allows users to select a folder from a list of folders in the vault. This would make it easier for users to
select the folder they want to use as the MOC folder.

#### Daily notes vault location

When testing daily notes feature, it came up that it might be nice to infer what the "Core plugin" daily notes location
is, and use that as the default for the daily notes location. This would make it easier for users to find their daily
notes, and would be a nice touch for the plugin.

##### A: Daily notes location

Unfortunately, the Obsidian API doesn't provide direct access to the settings of other plugins, including the core Daily
Notes plugin. However, we can add a feature request to suggest the Daily Notes folder as the default MOC folder path if
it exists. This would be a nice touch for the plugin and would make it easier for users to find their daily notes. We'll
have to track demand for this feature and see if it's something that users want.

### Bugs in the current version

- [ ] The add new journal button is not aware of the users YAML/Frontmatter.
  When you create a new note, it adds the content to the very top of the file. This breaks the markdown file and the
  YAML/Frontmatter is no longer at the top of the file. We must fix this bug before we release the next version of the
  plugin.

- [ ] The cursor should be set to the bottom of the timestamp for a new entry for quick editing.
- [ ] The plugin should not be adding the timestamp to the note if the user has disabled the timestamp feature.
- [ ] Journal Corruption: sometimes creating a new note will corrupt the journal file. This is a critical bug that must
  be fixed before the next release. I'm not clear what is happening but basically it's sometimes deleting the contents
  and putting the new entry inbetween the YAML/Frontmatter and the rest of the note. We should maybe add a way to backup
  the journal file before we write to it.
