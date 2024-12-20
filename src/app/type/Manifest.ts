import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../../util/logging/console.js';
import { quote } from '../../util/string/wrap.js';

import { UserConfig } from '../../config/type/UserConfig.js';
import {
	basenameWithoutExtensions,
	fmtPath,
	fmtPathWithExistsAndName,
} from '../../util/file/path.js';
import {
	dlog,
	dlogList,
	isDebugActive,
	vlog,
	vlogList,
} from '../../util/logging/debug.js';
import {
	SB_BULLET,
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_WARN,
	UNICODE_CHECK_LG,
	UNICODE_WARN,
	UNICODE_XMARK_LG,
} from '../../util/string/symbols.js';
import Shortcut from '../type/Shortcut.js';
import { ShortcutExportData } from '../type/ShortcutData.js';
import { ManifestData, NameSource } from './ManifestData.js';

// Class: MARK: Manifest

// TODO getName by ManifestNameSource
// TODO jsdoc
class Manifest implements ManifestData {
	// TODO jsdoc
	filePath: string;

	sourceName: string;
	baseDirectory: string;
	outputPath: string;
	shortcuts: Array<Shortcut>;

	public get getFilePath(): string {
		return this.filePath;
	}

	public get getSourceName(): string {
		return this.sourceName;
	}

	public get getBaseDirectory(): string {
		return this.baseDirectory;
	}

	public get getOutputPath(): string {
		return this.outputPath;
	}

	public get getShortcuts(): Array<Shortcut> {
		return this.shortcuts;
	}

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

	// MARK: paths

	public getWritePath(): string {
		return this.outputPath;
	}

	// MARK: names

	public getFileBasename(): string {
		return path.basename(this.filePath);
	}

	public getFallbackName(): string {
		return basenameWithoutExtensions(
			this.filePath,
			['.yml', '.yaml', '.manifest', '.example'],
			true,
		);
	}

	public hasNameAttribute(): boolean {
		if (!this.sourceName) return false;

		return this.sourceName.trim() !== '';
	}

	// TODO jsdoc
	public getNameAttribute(): string {
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
	public getNameSource(): NameSource {
		if (this.hasNameAttribute()) {
			return NameSource.Attribute;
		} else {
			return NameSource.Filename;
		}
	}

	/**
	 * Get the string representation of the Manifest instance's {@link ManifestNameSource}
	 * @returns A `string` representing the value of {@link getNameSource},
	 *  which is a {@link ManifestNameSource}.
	 */
	public getNameSourceAsString(): string {
		switch (this.getNameSource()) {
			case NameSource.Attribute:
				return 'Attribute';
			case NameSource.Filename:
				return 'Filename';
		}
	}

	public getName(): string {
		switch (this.getNameSource()) {
			case NameSource.Attribute:
				return this.getNameAttribute();
			case NameSource.Filename:
				return this.getFallbackName();
		}
	}

	// MARK: shortcuts

	public getEnabledShortcuts(): Array<Shortcut> {
		return this.getShortcuts.filter(each => each.isEnabled);
	}

	public getExportData(): Array<ShortcutExportData> {
		return this.getEnabledShortcuts().map(each => each.getExportData(this));
	}

	public getExportString(): string {
		return JSON.stringify(this.getExportData());
	}

	// MARK: write methods

	public async writeToOutput(): Promise<WriteResults> {
		const exportData = this.getExportData();
		const writeData = JSON.stringify(exportData);
		const writePath = this.getWritePath();

		const nTotal = this.getShortcuts.length,
			nEnabled = this.getEnabledShortcuts().length,
			nDisabled = nTotal - nEnabled,
			nSkipped = 0,
			nInvalid = 0,
			nOk = exportData.length;

		// TODO Calculate invalid

		if (nOk === 0) {
			clog(
				`${SB_WARN} Skipped Manifest ${quote(this.getName())}: No shortcuts which were both enabled and valid`,
			);
			// TODO Verbose print more info here
			return new EmptyWriteResults(this);
		}

		try {
			await fs.promises.writeFile(writePath, writeData);
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
					nOk: nOk,
				},
			};
		} catch {
			throw new Error(
				`Failed to write manifest to output file (Name: ${this.getName()})`,
			);
		}
	}

	public formatAsListEntry(): string {
		let item = ' - ';
		item += this.getName();
		// TODO Display some sort of status
		return item;
	}

	private calculatePrefixForResults(
		results: WriteResults,
		config?: UserConfig,
	): string {
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

	private async dlogWriteResults(
		results: WriteResults,
		config?: UserConfig,
	): Promise<void> {
		const { nTotal, nOk, nEnabled, nDisabled, nValid, nInvalid, nSkipped } =
			results.stats;

		const name = quote(this.getName());
		const fmtBaseDirPath = await fmtPathWithExistsAndName(
			this.getBaseDirectory,
			'Base Directory',
			config,
		);
		const fmtSourceFilePath = await fmtPathWithExistsAndName(
			this.getFilePath,
			'Source File',
			config,
		);
		const fmtOutputPath = await fmtPathWithExistsAndName(
			this.getOutputPath,
			'Output',
		);
		const fmtWriteFilePath = await fmtPathWithExistsAndName(
			this.getWritePath(),
			'Write File',
			config,
		);

		dlog('');
		dlog(clr.magentaBright.underline(`MANIFEST OUTPUT RESULTS: ${name}`));

		vlog(`  ` + clr.underline(`NAMES`));
		vlogList(
			`    `,
			`Manifest Name: ${name}`,
			`Name from Attribute: ${quote(this.getNameAttribute())}`,
			`Name from Filename: ${quote(this.getFallbackName())}`,
			`Name Used: ${this.getNameSourceAsString()}`,
		);

		vlog(`  ` + clr.underline(`PATHS`));
		vlogList(
			`   `,
			fmtSourceFilePath,
			fmtBaseDirPath,
			fmtOutputPath,
			fmtWriteFilePath,
		);

		dlog(`  ` + clr.cyanBright.underline(`SHORTCUTS`));
		dlogList(
			`    `,
			`Total Number: ${nTotal}`,
			`Written: ${nOk}`,
			`Enabled to Disabled: ${nEnabled} / ${nDisabled}`,
			`Valid to Invalid: ${nValid} / ${nInvalid}`,
			`Total Skipped: ${nSkipped}`,
		);
	}

	public async logWriteResults(
		results: WriteResults,
		config?: UserConfig,
	): Promise<void> {
		await this.dlogWriteResults(results);

		const { manifest, stats, outputData } = results;
		const { nTotal, nOk, nDisabled, nInvalid } = stats;
		const useColor = config?.shouldUseColor() ?? true;
		const prefix = this.calculatePrefixForResults(results, config);
		const quotedName = quote(manifest.getName());
		const writePath = manifest.getWritePath();
		const sourceName = useColor ? clr.magentaBright(quotedName) : quotedName;
		const fromSource = 'from source ' + sourceName;

		let writeRatio = `${nOk}/${nTotal}`;

		if (useColor) {
			if (nOk <= 0 && nTotal > 0) {
				writeRatio = clr.redBright(writeRatio);
			} else {
				writeRatio = clr.cyanBright(writeRatio);
			}
		}

		const writeQuantity = `${writeRatio} shortcuts`;

		let header = prefix + ` `;

		if (nOk > 0) {
			header += `Created ${writeQuantity} ${fromSource}`;
		} else {
			header += `Wrote nothing ` + fromSource;
		}

		// Do prints
		if (isDebugActive()) {
			clog('');
		}

		clog(header);

		if (nTotal <= 0) {
			clog(`  ${SB_WARN} No shortcuts were found for this manifest`);
			return;
		}

		if (nOk > 0) {
			dlog(`  ${SB_OK_SM} Wrote new file to ${fmtPath(writePath)}`);

			vlog(
				`    - Source File: ${fmtPath(this.filePath)}`,
				`    - Output Path: ${fmtPath(this.getOutputPath)}`,
				`    - File Written To: ${fmtPath(writePath)}`,
			);
		}

		if (nInvalid > 0) {
			const invalidToAll = `(${nInvalid}/${nTotal})`;
			if (nInvalid === nTotal) {
				clog(`  ${SB_ERR_SM} All shortcuts were invalid ${invalidToAll}`);
			} else {
				clog(`  ${SB_ERR_SM} Some shortcuts were invalid ${invalidToAll}`);
			}
		}

		if (nDisabled > 0) {
			const disabledToAll = `(${nDisabled}/${nTotal})`;
			if (nDisabled === nTotal) {
				clog(`  ${SB_WARN} All shortcuts were disabled ${disabledToAll}`);
			} else {
				clog(`  ${SB_WARN} Some shortcuts were disabled ${disabledToAll}`);
			}
		}

		if (process.argv.includes('--list-shortcuts')) {
			for (const sc of outputData) {
				clog(`   ${SB_BULLET} ${quote(sc.title)}`);
			}
		}
	}
}

// MARK: ManifestWriteResults

/**
 * Represents the result of a Manifest write operation, including
 * tracking the source Manifest instance, the output created
 * from the manifest's shortcuts attribute, and statistics about
 * the shortcuts.
 */
interface WriteResults {
	/**
	 * The Manifest instance whose shortcuts the output file's
	 * contents are derived from.
	 */
	readonly manifest: Manifest; // TODO Does this need to be here? I removed it from one use of ManifestWriteResults

	/**
	 * The contents of the output file in JSON form.
	 */
	readonly outputData: Array<ShortcutExportData>;

	/**
	 * Statistics about the results of the parsing and writing
	 * processess during the operation.
	 */
	readonly stats: {
		/**
		 * The total number of shortcuts found in the input file.
		 * */
		readonly nTotal: number;

		/**
		 * The number of shortcuts which were enabled by the input file.
		 * To be enabled is the default behavior unless explicitly disabled.
		 * */
		readonly nEnabled: number;

		/**
		 * The number of shortcuts which were disabled by the input file.
		 * This is opt-in behavior which only occurs if explicitly disabled.
		 * The difference of {@link nTotal} minus {@link nEnabled}.
		 * */
		readonly nDisabled: number;

		/**
		 * The number of shortcuts which errored out during parsing, such as from
		 * an invalid file path.
		 */
		readonly nInvalid: number;

		readonly nValid: number;

		/**
		 * The number of shortcuts that were skipped before the write operation.
		 * The sum of {@link nDisabled} and {@link nInvalid}.
		 */
		readonly nSkipped: number;

		/**
		 * The number of shortcuts that were enabled as well as passed validation
		 * and were written to the output file.
		 */
		readonly nOk: number;
	};
}

// MARK: emptyWriteResults

/**
 * Represents the results of a Manifest write operation when the Manifest
 * instance has zero shortcuts to write to a file.
 */
class EmptyWriteResults implements WriteResults {
	manifest: Manifest;
	outputData: Array<ShortcutExportData>;
	readonly stats = {
		nTotal: 0,
		nEnabled: 0,
		nDisabled: 0,
		nInvalid: 0,
		nValid: 0,
		nSkipped: 0,
		nOk: 0,
	};

	constructor(emptyManifest: Manifest) {
		this.manifest = emptyManifest;
		this.outputData = [];
	}
}

export { EmptyWriteResults, Manifest, WriteResults };
