import Manifest from './Manifest.js';
import ShortcutExportData from '../shortcut/ShortcutExportData.js';

interface ManifestWriteResults {
    inputManifest: Manifest,
    outputManifest: ShortcutExportData[],
    stats: {
        nTotal: number,
        nEnabled: number,
        nDisabled: number,
        nSkipped: number,
        nOk: number
    }
}

export default ManifestWriteResults;