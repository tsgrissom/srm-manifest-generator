# Project To-Do List

## Bugs FIXME

* Success Wrote print should have an X and say Nothing was printed for source NAME if nothing was printed

## General TODO

* Move old YAML keys over to new namespaces
* Rename manifest attribute "directory" to root directory for clarity
* Accept folders as manifest paths in the config + Recursive option
* Move my own manifests into a private folder and share some of my good examples for
* Flag ``--list-shortcuts`` should list what shortcuts were written under the print Wrote N shortcuts for source X
* Option to remove color from prints (config or flag)
* Print Transformed N titles should identify how many were successful over how many were listed
* Better solution for debug prints, perhaps one that rolls logging into it as well?
* Support auto-kill Steam + launch Steam ROM Manager as opt-in
* Figure out some mechanism for deleting old manifests left behind in the folder, or at least warning
* Tell user how long it took

## Short-Term Feature Goals

### Feature: Shortcut Validation

* Only mandatory properties of a manifest input should be output and titles, the latter must be valid
  * Ensure attributes name and directory CAN be ommitted, even if not recommended for ease of use
  * Then files can be roughly cut in half from .json to .yml
* Missing `exec` should be rejected, such as both examples below:
* `name` is not required, should be able to infer from `exec` file's basename

```yaml
- title: Some Title of a Game With an Empty Target
  target: 
- title: Some Title of a Game Without a Target
```

### Feature: Sub-Shortcuts

```yaml
rootDirectory: "Your/Regular/Source/Root/Directory"
shortcuts:
  - name: "The Name of Your Parent Shortcut Which Launches Multiple Things"
    enabled: false # Optional, disable outputting 
    rootDirectory: "Appended/To/The/Manifest/Root/Dir" # Adds to the manifest file's root directory if present
    installed:
      date: 11/27/2024
      version: v1.0
    shortcuts: # If sub-shortcuts are present, ignore if parent doesn't have exec field
      - name: One Title Which Inherits From Its Parent
        exec: A/Relative/File/Path/From/Manifest/Root/Dir/Plus/Parent/Shortcut/Root/Dir
      - name: Another Title Which is a Sub-Shortcut of Its Parent
        exec: Some/File/Path/To/A/File.exe
```

### Feature: Metadata

Plans for optional metadata support

* Support various metadata I've exemplified in my personal configs; This should be a flexible system with sensible aliases
* Search function which displays found shortcuts as well as displays its attributes, including if Not Set, for example
* Support `url` values and the ability to open the link automatically

#### Shortcuts Metadata: Install & Update History

* Any way to check file version detail that exes commonly have as a fallback?

```yaml
installed: # Keyword "install" might be too ambiguous
  date: 11/27/2024 # Consider supporting keyword "at" because "on" is taken by yml booleans
  version: v1.0 # Consider supporting keyword "v"
updated:
  date: 11/28/2024
  version: v1.1
```

## Long-Term Goals

### Flexibility

* The reverse: Converting your existing manifest.json into a .yml manifest
* Linting normal JSON SRM manifests
* Support other SRM manifest options, check SRM options
* Proper CLI features, probably use `yargs`
  * Should be able to target an individual manifest YAML and parse, validate, or fully process and output it via CLI
  * Auto-add shortcut to a manifest based on path to exe
  * Option to clear generated manifest files based on current mapping
  * Dry runs
* Split shortcuts into individual files within a folder, then combine them into a single manifest automatically
* Create Windows shortcut (.lnk files) and put them in the desired location such as Desktop or Start Menu dirs
* Explore combined manifests, such as My PC Ports A-R + My PC Ports S-Z = My PC Ports A-Z
* Ensure support for Windows context menu-copied paths (aka `\\` separators)
* Support outputting shortcuts to individual manifests
* Minification options
* Aliases such as "ENTRY.title" could be "ENTRY.name"
* If outputting to jsonc, add comments for other data from session + date
