# Steam ROM Manifester

[INS_BADGES]

Generates manifests for [Steam ROM Manager]()'s manual parsers using a more powerful,
human-editable YAML syntax into JSON files the parser needs in order to index your
local game files. 

TLDR: Turn your PC's library of non-Steam executables into easily-managed Steam shortcuts
using the power of Steam ROM Manager's manual parsers combined with a powerful custom YAML
syntax.

Mapping your game files using this YAML syntax enables useful features over JSON
besides being easier to read, write, and edit.

[INS_MORE_DESC]

## TEMP: README REWRITE

[] Rewrite old readme in this new file

[] Verify installation instructions work as expected on all platforms

[] Put contact email in contribution guide

[OVERVIEW_OF_OLD_README]

## Requirements

[INS_REQS]

## Installation

Use your favorite package manager to install the CLI tool package `steam-rom-manifest-cli`,
like so:

```sh
# via npm
npm install -g steam-rom-manifester-cli
# or pnpm
pnpm add -g steam-rom-manifester-cli
# or yarn
yarn global add steam-rom-manifester-cli
# etc
```

Otherwise, for those who want to install manually:

```sh
git clone git@github.com:tsgrissom/steam-rom-manifester.git
cd steam-rom-manifester
npm install
npm link
```

## Post-Installation

After following the previous section to install the Steam ROM Manifester, check if the CLI tool is working by executing the following command: `srmg --version`

If installed correctly, the command should print the current tool version to the console.

[INS_MORE]

## Setup

[INS_SETUP]

## Configuration

[INS_CONFIG]

## Usage

[INS_USAGE]

## Credits

Steam ROM Manifester would not be possible without giving credit to the following tools:

* [SteamGridDB][sgdb], its community, and its contributors, including those
  involved in the development of [Steam ROM Manager][srm] for their essential
  resources and tooling.
* The following NPM packages and all their contributors:
  * [yaml][npm-yaml]

[sgdb]: https://steamgriddb.github.io
[srm]: https://steamgriddb.github.io/steam-rom-manager/
[npm-yaml]: https://www.npmjs.com/package/yaml