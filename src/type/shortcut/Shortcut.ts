import path from 'node:path';

import clr from 'chalk';

import { fmtBool } from '../../utility/boolean.js';
import { clog } from '../../utility/console.js';
import { quote } from '../../utility/string.js';

import ShortcutData from './ShortcutData.js';
import ShortcutExportData from './ShortcutExportData.js';
import ManifestData from '../manifest/ManifestData.js';

// TODO jsdoc
class Shortcut implements ShortcutData {
	// TODO jsdoc
	manifest: ManifestData;

	title: string;
	target: string;
	enabled: boolean;

	constructor(manifest: ManifestData, data: ShortcutData) {
		// TODO Accept config in constructor, check validity of executable

		this.manifest = manifest;
		this.title = data.title;
		this.target = data.target;
		this.enabled = data.enabled;

		if (process.argv.includes('--list-shortcuts')) {
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
	 * @returns The JSON designed for handling by Steam ROM Manager.
	 */
	public getExportData(): ShortcutExportData {
		return {
			title: this.getTitle(),
			target: this.getFullTargetPath()
		};
	}

	public getExportString(): string {
		return JSON.stringify(this.getExportData());
	}

	getTitle(): string {
		return this.title;
	}

	getRelativeTargetPath(): string {
		return this.target;
	}

	getFullTargetPath(): string {
		const rootDir = this.manifest.baseDirectory;

		if (!rootDir)
			// TODO Rewrite this error
			throw new Error(
				`Error while constructing full target path for Shortcut (${this.getTitle()}): Manifest (${this.manifest.sourceName}) root directory was invalid`
			);

		return path.join(
			this.manifest.baseDirectory,
			this.getRelativeTargetPath()
		);
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	isDisabled(): boolean {
		return !this.isEnabled();
	}
}

export default Shortcut;
