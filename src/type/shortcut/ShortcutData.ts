/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Represents a Steam ROM Manager-compatible JSON output for
 * writing to manual JSON manifests
 */
interface ShortcutExportData {
	title: string;
	target: string;
}

/**
 * Represents the full data structure of a YAML shortcut from
 * SRM Manifest Generator, which are contained within {@link Manifest}
 * files in lists. Easily converted to {@link ShortcutExportData}
 * for writing to JSON manifest files.
 */
interface ShortcutData extends ShortcutExportData {
	title: string; // TODO Title optional
	target: string;
	enabled?: boolean;
}

function isShortcutData(obj: unknown): obj is ShortcutData {
	if (
		typeof obj === 'object' &&
		obj !== null &&
		// Check for title or name
		(('title' in obj && typeof (obj as any).title === 'string') ||
			('name' in obj && typeof (obj as any).name === 'string')) &&
		// Check for target or exec
		(('target' in obj && typeof (obj as any).target === 'string') ||
			('exec' in obj && typeof (obj as any).exec === 'string'))
	) {
		// Normalize name to title
		if (!('title' in obj) && 'name' in obj) {
			(obj as any).title = (obj as any).name;
		}

		// Normalize exec to target
		if (!('target' in obj) && 'exec' in obj) {
			(obj as any).target = (obj as any).exec;
		}

		return true;
	}
	return false;
}

export { ShortcutData, ShortcutExportData, isShortcutData };
