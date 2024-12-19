import Shortcut from '../shortcut/Shortcut.js';

// TODO jsdoc

interface ManifestData {
	sourceName: string;
	baseDirectory: string;
	outputPath: string;
	shortcuts: Array<Shortcut>;
}

export default ManifestData;
