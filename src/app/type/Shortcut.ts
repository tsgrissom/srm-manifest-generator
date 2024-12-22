import path from 'node:path';

import { quote } from '../../util/string/quote.js';

import { UserConfig } from '../../config/type/UserConfig.js';
import * as fmt from '../../util/string/format.js';
import { yesNo } from '../../util/string/format.js';
import { ManifestData } from '../type/ManifestData.js';
import { ShortcutData, ShortcutExportData } from './ShortcutData.js';

// TODO jsdoc
class Shortcut implements ShortcutData {
	private _config?: UserConfig;

	private _title: string;
	private _target: string;
	private _enabled: boolean;

	constructor(data: ShortcutData, config?: UserConfig) {
		// TODO Make this check for target
		// TODO Infer title from target if there is none
		if (data.title.trim() === '') {
			throw new Error(
				`Cannot construct Shortcut from ShortcutData with empty str title`,
			);
		}

		this._config = config;
		this._title = data.title;
		this._target = data.target;
		this._enabled = data.enabled ?? true;
	}

	// MARK: getters + setters

	public get title(): string {
		return this._title;
	}

	public set title(str: string) {
		this._title = str;
	}

	public get target(): string {
		return this._target;
	}

	public set target(str: string) {
		this._target = str;
	}

	public get hasAbsoluteTarget(): boolean {
		return path.isAbsolute(this._target);
	}

	public get hasRelativeTarget(): boolean {
		return !path.isAbsolute(this._target);
	}

	public get enabled(): boolean {
		return this._enabled;
	}

	public set enabled(b: boolean) {
		this._enabled = b;
	}

	public get isEnabled(): boolean {
		return this._enabled;
	}

	public get isDisabled(): boolean {
		return !this._enabled;
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
		const fmtFullTarget = await fmt.pathWithExists(fullTarget);
		const fmtIsEnabled = yesNo(this.enabled);

		return [
			` - Title: ${fmtTitle}`,
			`   Target: ${fmtFullTarget}`,
			`   Enabled? ${fmtIsEnabled}`,
		];
	}
}

export default Shortcut;
