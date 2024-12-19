import path from 'node:path';

import clr from 'chalk';

import { fmtBool } from '../../utility/boolean.js';
import { clog } from '../../utility/console.js';
import { quote } from '../../utility/string-wrap.js';

import { SB_WARN } from '../../utility/symbols.js';
import UserConfig from '../config/UserConfig.js';
import ManifestData from '../manifest/ManifestData.js';
import { ShortcutData, ShortcutExportData } from './ShortcutData.js';

// TODO jsdoc
class Shortcut implements ShortcutData {
	private config?: UserConfig;

	title: string;
	target: string;
	enabled: boolean;

	public get getTitle(): string {
		return this.title;
	}

	public get isEnabled(): boolean {
		return this.enabled;
	}

	public get isDisabled(): boolean {
		return !this.enabled;
	}

	constructor(data: ShortcutData, config?: UserConfig) {
		// TODO Accept config in constructor, check validity of executable

		if (data.title.trim() === '') {
			throw new Error(
				`Cannot construct Shortcut from ShortcutData with empty str title`,
			);
		}

		this.config = config;
		this.title = data.title;
		this.target = data.target;
		this.enabled = data.enabled ?? true;

		if (process.argv.includes('--list-shortcuts')) {
			// TODO Decide fate
			clog(clr.blue.underline(`LOADED SHORTCUT: ${quote(this.title)}`));
			clog(` Title: ${quote(this.title)}`);
			clog(` Target: ${quote(this.target)}`);
			clog(` Enabled: ${fmtBool(this.enabled)}`);
		}
	}

	/**
	 * Maps the Shortcut instance's attributes to a JavaScript object
	 * which is compatible for writing to a JSON manifest for Steam
	 * ROM Manager.
	 * @param manifest The Manifest data to con
	 * @returns The JSON designed for handling by Steam ROM Manager.
	 */
	public getExportData(manifest: ManifestData): ShortcutExportData {
		return {
			title: this.title,
			target: this.getFullTargetPath(manifest),
		};
	}

	/**
	 * Returns a stringified JSON object for the individual
	 * Shortcut instance.
	 * This format is compatible with Steam ROM Manager.
	 * @returns A `string` resulting from {@link JSON.stringify} which
	 *  can be written to the filesystem.
	 */
	public getExportString(manifest: ManifestData): string {
		return JSON.stringify(this.getExportData(manifest));
	}

	public isTargetPathAbsolute(): boolean {
		return path.isAbsolute(this.target);
	}

	// TODO Method: isTargetPathRelative

	public getFullTargetPath(manifest: ManifestData): string {
		const baseDirectory = manifest.baseDirectory;
		const targetPath = this.target;

		// TODO Absolute path support

		if (!baseDirectory) {
			console.error(
				`${SB_WARN} Could not construct full target path for Shortcut (${quote(this.title)}): Given Manifest's base directory is invalid`,
			);
		}

		return path.join(manifest.baseDirectory, targetPath);
	}
}

export default Shortcut;
