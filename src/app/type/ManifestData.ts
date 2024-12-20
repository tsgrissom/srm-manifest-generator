import Shortcut from '../type/Shortcut.js';

// TODO jsdoc

interface ManifestData {
	sourceName: string;
	baseDirectory: string;
	outputPath: string;
	shortcuts: Array<Shortcut>;
}

// TODO jsdoc
enum NameSource {
	Attribute,
	Filename,
}

export { ManifestData, NameSource };
