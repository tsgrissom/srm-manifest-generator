import pkg from '../../../package.json';

/**
 * Defines the expected structure of the project's `package.json`
 * for checking object conformance.
 */
interface ExpectedPackageJson {
	readonly version: string;
	readonly bugs: string;
	readonly homepage: string;
	readonly readme: string;
}

/**
 * Typeguard which determines if a given value {@link obj} conforms to
 * the {@link ExpectedPackageJson} interface, which enumerates a few
 * useful metadata values which can be found within a `package.json`.
 * @param obj A value of an unknown type which is expected to be a
 *  non-null object conforming to the {@link ExpectedPackageJson}
 *  interface.
 * @returns Whether {@link obj} conforms to the expected structure
 *  of the project's `package.json`.
 */
function isExpectedPackageJson(obj: unknown): obj is ExpectedPackageJson {
	if (typeof obj === 'object' && obj !== null) {
		const typedObj = obj as Record<string, unknown>;

		// prettier-ignore
		return (
			'version' in typedObj && typeof typedObj.version === 'string' &&
			'bugs' in typedObj && typeof typedObj.bugs === 'string' &&
			'homepage' in typedObj && typeof typedObj.homepage === 'string' &&
			'readme' in typedObj && typeof typedObj.readme === 'string'
		);
	}

	return false;
}

/**
 * Retrieves the JSON representation of the project's `package.json` file.
 * @returns An `object` which conforms to {@link ExpectedPackageJson},
 *  guaranteeing the presence of some useful metadata values.
 */
function getPackageJson(): ExpectedPackageJson {
	return pkg;
}

export { getPackageJson, isExpectedPackageJson };
