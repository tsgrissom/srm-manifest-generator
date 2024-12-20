import fs from 'node:fs/promises';
import path from 'node:path';

// TODO jsdoc
// TODO Unit Test
// FIXME eslint
export const getPackageJson = async () => {
	try {
		const packagePath = path.resolve(process.cwd(), 'package.json');
		const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
		return packageJson;
	} catch (err) {
		console.error('Error reading package.json:', err);
		return undefined;
	}
};

// TODO jsdoc
// TODO Unit Test
// FIXME eslint
export const getPackageJsonAttribute = async (key: string) => {
	const contents = await getPackageJson();
	return contents[key];
};

// TODO jsdoc
// TODO Unit Test
// FIXME eslint
export const getReadmeUrl = async () => getPackageJsonAttribute('readme');
