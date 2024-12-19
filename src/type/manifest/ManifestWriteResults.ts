import ShortcutExportData from '../shortcut/ShortcutExportData';
import Manifest from './Manifest';

/**
 * Represents the result of a Manifest write operation, including
 * tracking the source Manifest instance, the output created
 * from the manifest's shortcuts attribute, and statistics about
 * the shortcuts.
 */
interface ManifestWriteResults {
	/**
	 * The Manifest instance whose shortcuts the output file's
	 * contents are derived from.
	 */
	readonly manifest: Manifest;

	/**
	 * The contents of the output file in JSON form.
	 */
	readonly outputData: Array<ShortcutExportData>;

	/**
	 * Statistics about the results of the parsing and writing
	 * processess during the operation.
	 */
	readonly stats: {
		/**
		 * The total number of shortcuts found in the input file.
		 * */
		readonly nTotal: number;

		/**
		 * The number of shortcuts which were enabled by the input file.
		 * To be enabled is the default behavior unless explicitly disabled.
		 * */
		readonly nEnabled: number;

		/**
		 * The number of shortcuts which were disabled by the input file.
		 * This is opt-in behavior which only occurs if explicitly disabled.
		 * The difference of {@link nTotal} minus {@link nEnabled}.
		 * */
		readonly nDisabled: number;

		/**
		 * The number of shortcuts which errored out during parsing, such as from
		 * an invalid file path.
		 */
		readonly nInvalid: number;

		readonly nValid: number;

		/**
		 * The number of shortcuts that were skipped before the write operation.
		 * The sum of {@link nDisabled} and {@link nInvalid}.
		 */
		readonly nSkipped: number;

		/**
		 * The number of shortcuts that were enabled as well as passed validation
		 * and were written to the output file.
		 */
		readonly nOk: number;
	};
}

export default ManifestWriteResults;
