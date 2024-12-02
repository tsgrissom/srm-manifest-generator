# SRM Manifest Generator

Tool for quickly and automatically generating manifest files for [Steam ROM Manager](https://steamgriddb.github.io/steam-rom-manager/). Describe your local game files using simple [YAML](https://yaml.org/) syntax, then use this tool to transform those YAML files into SRM-compatible JSON manifests.

## Why?

Sometimes you have locally-installed game titles (Example: Fan-made PC ports) which you want to bulk-add to Steam ROM Manager, but they require creating a manual parser which relies on _Manifests_, or JSON files describing your desired executable files.

SRM Manifest Generator reduces the tedium of manually editing manifest JSON files. Issues when writing your manifests in JSON: Having to write shared parent directories over and over again, as well as getting the JSON syntax just right, including all of the quotations, commas, and brackets. Instead, SRM Manifest Generator relies on a YAML-driven configuration syntax which is human-readable and easy-to-learn. 

Game files which are stored in similar paths (say a folder at `D:\Games\Ports`) can greatly benefit from having their manifests managed by SRM Manifest Generator, allowing you to turn long and tedious JSON files into easily-edited, human-readable YAML files.

[Project Example YAML Files](https://github.com/tsgrissom/srm-manifest-generator)

[Learn YAML Basics](https://www.tutorialspoint.com/yaml/yaml_basics.htm)

[Read YAML Reference](https://yaml.org/spec/1.2.2/#chapter-1-introduction-to-yaml)

## Example

### Input File: `example.manifest.yml`

```yml
name: Nickname of Game Source
directory: C:/Users/YOU/Some/Working/Directory/To/Start/In
output: ./out/SomeSource.manifest.json
entries:
  - title: An Example Game
    target: SomeRelativePath/bin/Game.exe
  - title: Some Other Game You Want Added to Steam
    target: The Game Folder/TheExecutable.exe
```

### Output File: `SomeSource.manifest.json`

```json
[
  {
    "title": "An Example Game",
    "target": "C:/Users/YOU/Some/Working/Directory/To/Start/In/SomeRelativePath/bin/Game.exe"
  },
  {
    "title": "Some Other Game You Want Added to Steam",
    "target": "C:/Users/YOU/Some/Working/Directory/To/Start/In/The Game Folder/TheExecutable.exe"
  }
]
```

## Usage

### Requirements

* Steam
* [Steam ROM Manager](https://steamgriddb.github.io/steam-rom-manager/)
* Some non-Steam game or program you want to add to Steam with Steam ROM Manager (i.e. an executable on your filesystem you want in Steam)
* Node.js
* A tiny bit of [YAML knowledge](https://www.tutorialspoint.com/yaml/yaml_basics.htm)

### Installation

#### Quick Install (requires Git)

1. Open Terminal and navigate to directory you wish to install this project to.
2. Execute the script below AND don't forget to follow the Configuration section below after!
3. If you don't want to use `pnpm` make sure to change it to `npm`. It should work all the same.

```shell
git clone git@github.com:tsgrissom/srm-manifest-generator.git && cd srm-manifest-generator && pnpm install
```

#### Manual Install

1. Clone this repository (you can use the clone button in the top right) or download + extract [the .zip](https://github.com/tsgrissom/srm-manifest-generator/archive/refs/heads/main.zip)
2. Using your Terminal, navigate to the project's root directory
3. Execute `npm install` to install project dependencies
4. MAKE SURE to read the Configuration section below in order to use this tool

### Configuration

A bit of light configuration is required to use this tool. Minimum requirements are outlined below, along with example files to look at as needed.

[Example App-Wide Configuration](https://github.com/tsgrissom/srm-manifest-generator/blob/main/config/examples/example.config.yml)

1. You must have a tool config located at the tool's root folder named `config.yml`
2. Using the [example](https://github.com/tsgrissom/srm-manifest-generator/blob/main/config/examples/example.config.yml) above, this config must have at least: An attribute named manifests containing a list of file paths, each path pointing to a manifest `.yml` file to be transformed

[Example Manifest File](https://github.com/tsgrissom/srm-manifest-generator/blob/main/config/examples/example.manifest.yml)

1. For each game source you want (say PC Ports as an example), make a `YOUR-SOURCE-NAME.manifest.yml` file
2. You can base this file on the [example.manifest.yml](https://github.com/tsgrissom/srm-manifest-generator/blob/main/config/examples/example.manifest.yml) if needed
3. To be valid, each manifest file must have at least: An attribute `output` pointing to the output path of the generated `.json`, as well as an attribute `entries` which is outlined below

#### Example: `entries` Attribute

```yml
name: Example Source
directory: E:\Games
output: ./out/example-source.json
entries:
  - title: Generic Game Launcher
    target: Some\Relative\Path\GameLauncher.exe
  - title: A Game
    target: Some\Path\To\Game.exe
```

For each entry, the tool will take the manifest's `directory` attribute and append the entry's `target` to it, so the expected path of `GameLauncher.exe` in this example would be `E:\Games\Some\Relative\Path\GameLauncher.exe`

### Recommended Steam ROM Manager Setup

#### File Structure + Organization

* Organize your games and other desired executables into folders which group them by their origin
  * This origin is called the _Source_, and each Source needs a _Manifest_ file to map out the contents of your file structure
  * Normally, one would write these Steam ROM Manager manifests in JSON, but with SRM Manifest Generator you can write them in YAML
  * SRM Manifest Generator also offers extra time-saving features such as setting a _Base Directory_ so you don't have to write out the full path to your executable dozens of times

#### Create Your Steam ROM Manager Parser

1. In Steam ROM Manager, go to **Create Parser** and set _Parser Type_ to "Manual"

* Optionally, you can use the _Steam Collections_ field to have Steam ROM Manager automatically add/remove your titles in Steam collections

2. In the _Manifests Directory_ field, point to the folder where you will store `.json` Manifest Files

* Ideally, this should be the same folder you tell SRM Manifest Generator to output generated Manifest Files to via the "output" property of each Manifest File

3. Click **Save** then check the Parsers list (in the sidebar) and ensure your new Parser is enabled
4. After ensuring your Parser is enabled, click **Add Games** in the sidebar and read the useful instructions on the splash page

* **IMPORTANT:** In order for Steam ROM Manager to work properly, Steam must be _fully closed_ each and every time you try to save parsed titles to Steam

5. Once you are ready to Parse your titles, creating Steam shortcuts out of your Manifests, click the **Parse** button on the **Add Games** page

* Wait for all artwork to be fully loaded, using the arrow buttons on each title to swap out any undesirable artwork
* Optionally, you can manually set the artwork if you can't find one you like. I recommended using [SteamGridDB](https://www.steamgriddb.com/) but other sources such as [IGDB](https://www.igdb.com/) could work as well.
* **Caution:** Steam ROM Manager will not save your alterations to Steam until you click **Save to Steam**
* Once you click Save to Steam, keep an eye out for a green alert in the upper right-hand corner informing you that SRM is done adding/removing entries


## Credits

[Steam ROM Manager](https://steamgriddb.github.io/steam-rom-manager/) and all its contributors for their excellent tool

[yaml on NPM](https://www.npmjs.com/package/yaml) for this extremely handy and full-featured package