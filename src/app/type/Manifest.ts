import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../../util/logging/console.js';
import { quote } from '../../util/string/quote.js';

import { UserConfig } from '../../config/type/UserConfig.js';
import { basenameWithoutExtensions } from '../../util/file/path.js';
import {
	dlog,
	dlogList,
	isDebugActive,
	vlog,
	vlogList,
} from '../../util/logging/debug.js';
import * as fmt from '../../util/string/format.js';
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

// MARK: Manifest

// TODO getName by ManifestNameSource
// TODO jsdocs
class Manifest implements ManifestData {
	private _filePath: string;
	// TODO Mandate instanced config
	private _config?: UserConfig;

	private _sourceName: string;
	private _baseDirectory: string;
	private _outputPath: string;
	private _shortcuts: Array<Shortcut>;

	/**
	 * Constructs a new Manifest instance.
	 * @param filePath The filepath of this Manifest's source file. Not read in the constructor, but used as a fallback name if name attribute is not set inside the file.
	 * @param data The object to parse into a Manifest instance.
	 * @param config The config data to use in this Manifest's operations.
	 */
	constructor(filePath: string, data: ManifestData, config?: UserConfig) {
		this._filePath = filePath;
		this._config = config;

		this._sourceName = data.sourceName;
		this._baseDirectory = data.baseDirectory;
		this._outputPath = data.outputPath;
		this._shortcuts = data.shortcuts;
	}

	// MARK: getters + setters

	public get filePath(): string {
		return this._filePath;
	}

	public get fileBasename(): string {
		return path.basename(this._filePath);
	}

	public get fallbackName(): string {
		return basenameWithoutExtensions(this._filePath);
	}

	public get hasSourceNameAttribute(): boolean {
		return !!this._sourceName?.trim();
	}

	public get sourceName(): string {
		return this._sourceName;
	}

	public set sourceName(str: string) {
		this._sourceName = str;
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
	public get nameSource(): NameSource {
		return this.hasSourceNameAttribute ? NameSource.Attribute : NameSource.Filename;
	}

	public get name(): string {
		switch (this.nameSource) {
			case NameSource.Attribute:
				return this.sourceName;
			case NameSource.Filename:
				return this.fallbackName;
		}
	}

	public get baseDirectory(): string {
		return this._baseDirectory;
	}

	public get outputPath(): string {
		return this._outputPath;
	}

	public get writePath(): string {
		// TODO Calculate write path
		return this._outputPath;
	}

	public get shortcuts(): Array<Shortcut> {
		return this._shortcuts;
	}

	public get enabledShortcuts(): Array<Shortcut> {
		return this.shortcuts.filter(sc => sc.enabled);
	}

	// MARK: Methods

	public getExportData(): Array<ShortcutExportData> {
		return this.enabledShortcuts.map(each => each.getExportData(this));
	}

	public getExportString(): string {
		return JSON.stringify(this.getExportData());
	}

	// TODO containsShortcut?

	// TODO Should all this code below actually be here in the instance? Should it be its own namespace or even class `ManifestWriter`? `JsonManifestWriter`?
	public async writeToOutput(): Promise<WriteResults> {
		const exportData = this.getExportData();
		const writeData = JSON.stringify(exportData);
		const writePath = this.writePath;

		const nTotal = this.shortcuts.length,
			nEnabled = this.enabledShortcuts.length,
			nDisabled = nTotal - nEnabled,
			nSkipped = 0,
			nInvalid = 0,
			nOk = exportData.length;

		// TODO Calculate invalid

		if (nOk === 0) {
			clog(
				`${SB_WARN} Skipped Manifest ${quote(this.name)}: No shortcuts which were both enabled and valid`,
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
				`Failed to write manifest to output file (Name: ${this.name})`,
			);
		}
	}

	public formatAsListEntry(): string {
		let item = ' - ';
		item += this.name;
		// TODO Display some sort of status
		return item;
	}

	private calculatePrefixForResults(results: WriteResults): string {
		const { nTotal, nOk, nDisabled } = results.stats;
		const useColor = this._config?.shouldConsoleUseColor;

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
		config: UserConfig,
	): Promise<void> {
		const { nTotal, nOk, nEnabled, nDisabled, nValid, nInvalid, nSkipped } =
			results.stats;

		const name = quote(this.name);
		const fmtBaseDirPath = await fmt.pathWithNameAndExists(
			this.baseDirectory,
			'Base Directory',
			config,
		);
		const fmtSourceFilePath = await fmt.pathWithNameAndExists(
			this.filePath,
			'Source File',
			config,
		);
		const fmtOutputPath = await fmt.pathWithNameAndExists(
			this.outputPath,
			'Output',
			config,
		);
		const fmtWriteFilePath = await fmt.pathWithNameAndExists(
			this.writePath,
			'Write File',
			config,
		);

		dlog('');
		dlog(clr.magentaBright.underline(`MANIFEST OUTPUT RESULTS: ${name}`));

		vlog(`  ` + clr.underline(`NAMES`));
		vlogList(
			`    `,
			`Manifest Name: ${name}`,
			`Name from Attribute: ${quote(this.sourceName)}`,
			`Name from Filename: ${quote(this.fallbackName)}`,
			`Name Used: ${this.name}`,
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
		config: UserConfig,
	): Promise<void> {
		await this.dlogWriteResults(results, config);

		const { manifest, stats, outputData } = results;
		const { nTotal, nOk, nDisabled, nInvalid } = stats;
		const useColor = this._config?.shouldConsoleUseColor;
		const prefix = this.calculatePrefixForResults(results);
		const quotedName = quote(manifest.name);
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
			dlog(`  ${SB_OK_SM} Wrote new file to ${fmt.path(this.writePath)}`);

			vlog(
				`    - Source File: ${fmt.path(this.filePath)}`,
				`    - Output Path: ${fmt.path(this.outputPath)}`,
				`    - File Written To: ${fmt.path(this.writePath)}`,
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

// TODO Could become `JsonManifestWriteResult`, a part of `ManifestWriter` class/namespace
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

// TODO Should be a const probably
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
