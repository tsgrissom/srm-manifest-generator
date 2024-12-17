import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../../utility/console';
import { dlog, dlogDataSection } from '../../utility/debug';
import {
	basenameWithoutExtensions,
	fmtPath,
	fmtPathAsTag,
	fmtPathWithExistsAndName
} from '../../utility/path';
import { quote } from '../../utility/string';
import {
	SB_ERR_LG,
	SB_OK_LG,
	SB_WARN,
	UNICODE_CHECK_LG,
	UNICODE_WARN,
	UNICODE_XMARK_LG
} from '../../utility/symbols';

import ManifestData from './ManifestData';
import ManifestNameSource from './ManifestNameSource';
import ManifestWriteResults from './ManifestWriteResults';

import UserConfig from '../config/UserConfig';
import Shortcut from '../shortcut/Shortcut';
import ShortcutExportData from '../shortcut/ShortcutExportData';
import EmptyManifestWriteResults from './ManifestEmptyWriteResults';

// TODO getName by ManifestNameSource

// TODO jsdoc
class Manifest implements ManifestData {
	// TODO jsdoc
	filePath: string;

	sourceName: string;
	baseDirectory: string;
	outputPath: string;
	shortcuts: Shortcut[];

	/**
	 * Constructs a new Manifest instance.
	 * @param filePath The filepath of this Manifest's source file. Not read in the constructor, but used as a fallback name if name attribute is not set inside the file.
	 * @param data The object to parse into a Manifest instance.
	 */
	constructor(filePath: string, data: ManifestData) {
		this.filePath = filePath;
		this.sourceName = data.sourceName;
		this.baseDirectory = data.baseDirectory;
		this.outputPath = data.outputPath;
		this.shortcuts = data.shortcuts;
		// TODO Fill shortcuts
	}

	// MARK: Paths

	getOutputPath(): string {
		return this.outputPath;
	}

	getWritePath(): string {
		return this.outputPath;
	}

	getRootDirectory(): string {
		return this.baseDirectory;
	}

	getFilePath(): string {
		return this.filePath;
	}

	// MARK: Names

	getFileBasename(): string {
		return path.basename(this.filePath);
	}

	getFallbackName(): string {
		return basenameWithoutExtensions(this.filePath, ['.yml', '.yaml', '.manifest', '.example'], true);
	}

	hasNameAttribute(): boolean {
		if (!this.sourceName) return false;

		return this.sourceName.trim() !== '';
	}

	// TODO jsdoc
	getNameAttribute(): string {
		if (!this.sourceName || this.sourceName.trim() === '') return '';

		return this.sourceName;
	}

	/**
	 * Determine where the Manifest instance should retrieve its name from. First,
	 * this function checks for a valid name attribute in the Manifest's source
	 * file ({@link ManifestNameSource.Attribute}.) If that doesn't work, it
	 * will fallback to using the filename of the source file, removing all
	 * extensions from it using {@link basenameWithoutExtensions} iteraviley.
	 *
	 * @returns An enum representing the potential sources
	 *  of a manifest's name.
	 */
	public getNameSource(): ManifestNameSource {
		if (this.hasNameAttribute()) {
			return ManifestNameSource.Attribute;
		} else {
			return ManifestNameSource.Filename;
		}
	}

	/**
	 * Get the string representation of the Manifest instance's {@link ManifestNameSource}
	 * @returns A `string` representing the value of {@link getNameSource},
	 *  which is a {@link ManifestNameSource}.
	 */
	public getNameSourceAsString(): string {
		switch (this.getNameSource()) {
			case ManifestNameSource.Attribute:
				return 'Attribute';
			case ManifestNameSource.Filename:
				return 'Filename';
		}
	}

	public getName(): string {
		switch (this.getNameSource()) {
			case ManifestNameSource.Attribute:
				return this.getNameAttribute();
			case ManifestNameSource.Filename:
				return this.getFallbackName();
		}
	}

	// MARK: Shortcuts

	public getShortcuts(): Shortcut[] {
		return this.shortcuts;
	}

	public getEnabledShortcuts(): Shortcut[] {
		return this.getShortcuts().filter(each => each.isEnabled());
	}

	public getExportData(): ShortcutExportData[] {
		return this.getEnabledShortcuts().map(each => each.getExportData(this));
	}

	public getExportString(): string {
		return JSON.stringify(this.getExportData());
	}

	public async writeToOutput(): Promise<ManifestWriteResults> {
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
			clog(
				`${SB_WARN} Skipped Manifest ${quote(this.getName())}: No shortcuts which were both enabled and valid`
			);
			// TODO Verbose print more info here
			return new EmptyManifestWriteResults(this);
		}

		try {
			await fs.promises.writeFile(writePath, writeData);
			dlog(
				` ${SB_OK_LG} Wrote Manifest to file ${fmtPathAsTag(this.filePath)}`,
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
		} catch {
			throw new Error(`Failed to write manifest to output file (Name: ${this.getName()})`);
		}
	}

	private calculatePrefixForResults(results: ManifestWriteResults, config?: UserConfig) {
		const { nTotal, nOk, nDisabled } = results.stats;
		const useColor = config?.shouldUseColor() ?? true;

		const ok = useColor ? SB_OK_LG : UNICODE_CHECK_LG; // TODO withColor check
		const err = useColor ? SB_ERR_LG : UNICODE_XMARK_LG;
		const warn = useColor ? SB_WARN : UNICODE_WARN;

		let prefix;

		if (nOk > 0) {
			// At least one shortcut was ok
			if (nOk === nTotal) {
				// 100% success
				prefix = ok;
			} else {
				// Success between 0-100%
				if (nOk === nTotal - nDisabled) {
					prefix = ok;
				} else {
					// TEST This condition
					prefix = warn;
				}
			}
		} else {
			// All shortcuts might have failed
			if (nOk === nTotal) {
				// Success because there were no shortcuts
				prefix = ok;
			} else {
				// All shortcuts have failed
				prefix = err;
			}
		}

		return prefix;
	}

	private async dlogWriteResults(results: ManifestWriteResults) {
		const { manifest: man } = results;
		const { nTotal, nOk, nEnabled, nDisabled, nValid, nInvalid, nSkipped } = results.stats;

		const name = quote(man.getName());
		const sourceFilePath = await fmtPathWithExistsAndName(man.filePath, 'Source File Path');
		const outputPath = await fmtPathWithExistsAndName(man.getOutputPath(), 'Output Path');
		const writeFilePath = await fmtPathWithExistsAndName(man.getWritePath(), 'Write File Path');
		const rootDirectory = await fmtPathWithExistsAndName(man.baseDirectory, 'Root Directory');

		console.log('');
		dlogDataSection(
			clr.magentaBright.underline(`MANIFEST ${name} > Write Operation`),
			`  > `,
			`Name: ${name}`,
			`Name From: ${man.getNameSourceAsString()}`,
			`Value of Name Attribute: ${quote(man.getNameAttribute())}`,
			`Fallback Name: ${quote(man.getFallbackName())}`,
			sourceFilePath,
			outputPath,
			writeFilePath,
			rootDirectory
		);

		dlogDataSection(
			clr.magentaBright.underline(`MANIFEST ${name} > Numbers`),
			`  # `,
			`Total: ${nTotal}`,
			`Written: ${nOk}`,
			`Enabled: ${nEnabled}`,
			`Disabled: ${nDisabled}`,
			`Valid: ${nValid}`,
			`Invalid: ${nInvalid}`,
			`Skipped: ${nSkipped}`
		);
	}

	public async logWriteResults(results: ManifestWriteResults, config?: UserConfig) {
		await this.dlogWriteResults(results);

		const { manifest, stats } = results;
		const { nTotal, nOk, nEnabled } = stats;
		const isEmpty = nOk === 0 && nEnabled === 0;
		const useColor = config?.shouldUseColor() ?? true;

		const name = quote(manifest.getName());

		let okRatio = `${stats.nOk}/${stats.nTotal} shortcut`;
		if (nTotal > 1) {
			okRatio += 's';
		}
		okRatio = useColor ? clr.magentaBright(okRatio) : okRatio;

		const sourceName = useColor ? clr.cyanBright(name) : name;
		const fromSource = 'from source ' + sourceName;
		const emptyAddendum = `(No shortcuts were found)`;
		const prefix = this.calculatePrefixForResults(results, config);

		let header = `${prefix} Wrote `;
		if (nOk > 0) {
			header += okRatio + ' ' + fromSource;
		} else {
			header += 'nothing ' + fromSource;
		}

		if (isEmpty) header += ' ' + emptyAddendum;

		clog(header);

		if (isEmpty) {
			dlog(`  - Source File: ${fmtPath(manifest.getFilePath())}`);
			dlog(`  - Output Path: ${fmtPath(manifest.getOutputPath())}`);
			dlog(`  - File Written To: ${fmtPath(manifest.getWritePath())}`);
		}
	}
}

export default Manifest;
