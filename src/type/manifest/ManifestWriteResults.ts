import Manifest from './Manifest.js';
import ShortcutOutput from '../shortcut/ShortcutOutput.js';

interface ManifestWriteResults {
    manifestIn: Manifest,
    manifestOut: ShortcutOutput[],
    stats: {
        totalInFile: number,
        enabled: number,
        disabled: number,
        skipped: number,
        ok: number
    }
}

export default ManifestWriteResults;