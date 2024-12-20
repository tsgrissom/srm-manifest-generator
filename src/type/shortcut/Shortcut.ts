import path from 'node:path';

import { quote } from '../../utility/string-wrap.js';

import { yesNo } from '../../utility/boolean.js';
import { fmtPathWithExistsPrefix } from '../../utility/path.js';
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

	public getFullTargetPathFromBaseDir(baseDirectory: string): string {
		// TODO Absolute path support
		// TODO Probably need more checks
		if (baseDirectory.trim() === '') {
			console.error(
				`Failed to construct full target path from empty string passed to parameter "baseDir"! (Shortcut: ${quote(this.title)}, baseDir: ${quote(baseDirectory)})`,
			);
			return '';
		}

		return path.join(baseDirectory, this.target);
	}

	public getFullTargetPath(manifest: ManifestData): string {
		const baseDirectory = manifest.baseDirectory;
		return this.getFullTargetPathFromBaseDir(baseDirectory);
	}

	public async formatAsListEntry(baseDirectory: string): Promise<Array<string>> {
		const fmtTitle = quote(this.title);
		const fullTarget = this.getFullTargetPathFromBaseDir(baseDirectory);
		const fmtFullTarget = await fmtPathWithExistsPrefix(fullTarget);
		const fmtIsEnabled = yesNo(this.enabled);

		return [
			` - Title: ${fmtTitle}`,
			`   Target: ${fmtFullTarget}`,
			`   Enabled? ${fmtIsEnabled}`,
		];
	}
}

export default Shortcut;
