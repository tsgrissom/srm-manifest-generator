import ShortcutExportData from './ShortcutExportData.js';

/**
 * Represents the full data structure of a YAML shortcut from
 * SRM Manifest Generator, which are contained within {@link Manifest}
 * files in lists. Easily converted to {@link ShortcutExportData}
 * for writing to JSON manifest files.
 */
interface ShortcutData extends ShortcutExportData {
	title: string;
	target: string;
	enabled?: boolean;
}

export default ShortcutData;
