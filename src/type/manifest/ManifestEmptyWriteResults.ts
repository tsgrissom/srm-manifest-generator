import { ShortcutExportData } from '../shortcut/ShortcutData.js';
import Manifest from './Manifest.js';
import ManifestWriteResults from './ManifestWriteResults.js';

/**
 * Represents the results of a Manifest write operation when the Manifest
 * instance has zero shortcuts to write to a file.
 */
export class EmptyManifestWriteResults implements ManifestWriteResults {
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

export default EmptyManifestWriteResults;
