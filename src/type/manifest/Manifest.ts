import fs from 'node:fs/promises';
import path from 'node:path';

import clr from 'chalk';

import { dlog, dlogDataSection } from '../../utility/debug.js';
import { basenameWithoutExtensions, isPathAccessible, fmtPathWithExistsTag, fmtPathAsTag, fmtPath } from '../../utility/path.js';

import ManifestData from './ManifestData.js';
import ManifestNameSource from './ManifestNameSource.js';
import ManifestWriteResults from './ManifestWriteResults.js';

import Shortcut from '../shortcut/Shortcut.js';
import ShortcutExportData from '../shortcut/ShortcutExportData.js';
import { clog } from '../../utility/console.js';
import chalk from 'chalk';
import { SYMB_CHECKMARK_LG } from '../../utility/string.js';
import EmptyManifestWriteResults from './ManifestEmptyWriteResults.js';

// TODO getName by ManifestNameSource

// TODO jsdoc
class Manifest {

    // TODO jsdoc
    filePath: string;
    // TODO jsdoc
    data: ManifestData;

    /**
     * Constructs a new Manifest instance.
     * @param filePath The filepath of this Manifest's source file. Not read in the constructor, but used as a fallback name if name attribute is not set inside the file.
     * @param data The object to parse into a Manifest instance.
     */
    constructor(filePath: string, data: ManifestData) {
        if (typeof(filePath) !== 'string')
            throw new Error(`Failed to create instance of Manifest class: Required arg "filePath" in constructor is not a string (${filePath})`);
        if (typeof(data) !== 'object')
            throw new Error(`Failed to create instance of Manifest class: Required arg "object" in constructor is not an object (${data})`);

        this.filePath = filePath;
        this.data = data;

        if (!data)
            throw new Error('Failed to create instance of Manifest class: Required arg "object" in constructor is invalid');
    }
    
    // MARK: Paths

    getOutputPath() : string {
        return this.data.outputPath;
    }

    getWritePath() : string {
        return this.data.outputPath;
    }

    getRootDirectory() : string {
        return this.data.rootDirectory;
    }

    getFilePath() : string {
        return this.filePath;
    }

    // MARK: Names

    getFileBasename() : string {
        return path.basename(this.filePath);
    }

    getFallbackName() : string {
        return basenameWithoutExtensions(this.filePath, ['.yml', '.yaml', '.manifest', '.example'], true);
    }

    hasNameAttribute() : boolean {
        if (!this.data.name)
            return false;

        return this.data.name.trim() !== '';
    }

    // TODO jsdoc
    getNameAttribute() : string {
        if (!this.data.name || this.data.name.trim() === '')
            return '';

        return this.data.name;
    }

    /**
     * Determine where Manifest#getName retrieves its name from.
     * If there is a valid "name" attribute in the JSON, the value of it will be used
     * and the returned value of this function will be `Manifest.NameSource.ATTRIBUTE`.
     * Otherwise, the fallback filename provided in the constructor will be used and
     * the returned value of this function will be `Manifest.NameSource.FILENAME`;
     * @returns {Manifest.NameSource} Either `ATTRIBUTE` or `FILENAME`.
     */
    public getNameSource() : ManifestNameSource {
        if (this.hasNameAttribute()) {
            return ManifestNameSource.Attribute;
        } else {
            return ManifestNameSource.Filename;
        }
    }

    public getName() : string {
        switch (this.getNameSource()) {
            case ManifestNameSource.Attribute:
                return this.getNameAttribute();
            case ManifestNameSource.Filename:
                return this.getFallbackName();
        }
    }
    
    // MARK: Shortcuts

    public getShortcuts() : Shortcut[] {
        return this.data.shortcuts;
    }

    public getEnabledShortcuts() : Shortcut[] {
        return this.getShortcuts().filter(each => each.isEnabled());
    }

    public getExportData() : ShortcutExportData[] {
        return this.getEnabledShortcuts().map(each => each.getExportData());
    }

    public async writeToOutput() : Promise<ManifestWriteResults> {
        const exportData = this.getExportData();
        const writeData = JSON.stringify(exportData);
        const writePath = this.getWritePath();

        const nTotal = this.getShortcuts().length,
              nEnabled = this.getEnabledShortcuts().length,
              nDisabled = nTotal - nEnabled,
              nSkipped = 0,
              nInvalid = 0,
              nOk = exportData.length;

        // TODO Calculate invalid

        if (nOk === 0) {
            const SYMB_WARN = chalk.yellow('\u26A0'); // TODO Move to string utils if it looks good
            clog(` ${SYMB_WARN} Skipping Manifest because it has no enabled, valid shortcuts`);
            return new EmptyManifestWriteResults(this);
        }

        try {
            await fs.writeFile(writePath, writeData);
            dlog(
                ` ${SYMB_CHECKMARK_LG} Wrote Manifest to file ${fmtPathAsTag(this.filePath)}`,
                ` > Source File: ${fmtPath(this.filePath)}`,
                ` > Output Path: ${fmtPath(this.getOutputPath())}`,
                ` > File Written To: ${fmtPath(writePath)}`
            );
            return {
                manifest: this,
                outputData: exportData,
                stats: {
                    nTotal: nTotal,
                    nEnabled: nEnabled,
                    nDisabled: nDisabled,
                    nInvalid: 0,
                    nValid: nEnabled - nInvalid,
                    nSkipped: nSkipped,
                    nOk: nOk
                }
            };
        } catch (err) {
            throw new Error(`Failed to write manifest to output file (Name: ${this.getName()}): ${err}`);
        }
    }

    private async dlogWriteOperation(results: ManifestWriteResults) {
        const { stats } = results;
        dlogDataSection(
            clr.bgCyanBright('MANIFEST WRITE OPERATION'),
            '- ',
            `Source File: ${this.filePath}`,
            `Total #: ${stats.nTotal}`,
            `# of Enabled: ${stats.nEnabled}`,
            `# of Disabled: ${stats.nDisabled}`,
            `# of Skipped: ${stats.nSkipped}`,
            `# of Written: ${stats.nOk}`,
        );
    }

    public async logWriteResults(results: ManifestWriteResults) {
        const { manifest, stats } = results;
        const { nTotal, nOk, nEnabled, nDisabled, nValid, nInvalid, nSkipped } = stats;

        const name = manifest.getName(),
              writePath = manifest.getWritePath();

        let okRatio = `${stats.nOk}/${stats.nTotal} shortcuts`;

        if (nTotal !== 1)
            okRatio += 's';

        // Debug info
        {
            let header = `Wrote ${okRatio} from source "${name}"`;
            if (nOk > 1)
                header += ` to file ${writePath}`;

            dlogDataSection(
                header,
                `Name: "${name}"`,
                `Input File Path: ${fmtPathWithExistsTag(manifest.filePath)}`,
                `Name From: ${manifest.getNameSource()}`,
                `Value of Name Attribute: "${manifest.data.name}"`,
                `Fallback Name: "${manifest.getFallbackName()}"`,
                `Output Path: ${fmtPathWithExistsTag(manifest.getOutputPath())}`,
                `Write File Path: ${fmtPathWithExistsTag(manifest.getWritePath())}`,
                `Root Directory: ${fmtPathWithExistsTag(manifest.data.rootDirectory)}` // TODO Display validation here for paths
            );

            dlogDataSection(
                'Number of Shortcuts',
                `Total #: ${nTotal}`,
                `# Written: ${nOk}`,
                `# Enabled: ${nEnabled}`,
                `# Disabled: ${nDisabled}`,
                `# Valid: ${nValid}`,
                `# Invalid: ${nInvalid}`,
                `# Skipped: ${nSkipped}`
            );
        }

        const sbCheck = '\u2713 ';
        const sbXmark = '\u2715 ';
        const pfxOk = true ? clr.greenBright.bold(sbCheck) : sbCheck; // TODO withColor check
        const pfxFail = true ? clr.redBright.bold(sbXmark) : sbXmark;
        const pfxWarn = true ? clr.yellowBright.bold('!') : '!';

        let wrotePrefix;

        if (nOk > 0) { // At least one shortcut was ok
            if (nOk === nTotal) { // 100% success
                wrotePrefix = pfxOk;
            } else { // Success between 0-100%
                if (nOk === (nTotal - nDisabled)) {
                    wrotePrefix = pfxOk;
                } else { // TEST This condition
                    wrotePrefix = pfxWarn;
                }
            }
        } else { // All shortcuts might have failed
            if (nOk === nTotal) { // Success because there were no shortcuts
                wrotePrefix = pfxOk;
            } else { // All shortcuts have failed
                wrotePrefix = pfxFail;
            }
        }

        // TODO This all needs withColor

        const strOkRatio = true ? clr.magentaBright(okRatio) : okRatio;
        const strFromSource = `from source ${true ? clr.cyanBright(name) : name}`;

        let builder = `${wrotePrefix} Wrote `;
        if (nOk > 0) {
            builder += `${strOkRatio} `;
            builder += strFromSource;
        } else {
            builder += `nothing ${strFromSource}`;
        }

        clog(builder);

        const styledSourcePath = await fmtPathWithExistsTag(manifest.getFilePath());
        const styledWritePath  = await fmtPathWithExistsTag(writePath);

        dlog(`  - Source File Path: ${styledSourcePath}`);
        dlog(`  - Write File Path: ${styledWritePath}`);
    }
}

export default Manifest;