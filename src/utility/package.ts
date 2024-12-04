import fs from 'node:fs/promises';
import path from 'node:path';

export async function getPackageJson() {
    try {
        const packagePath = path.resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
        return packageJson;
    } catch (err) {
        console.error('Error reading package.json:', err);
        return undefined;
    }
}

export async function getPackageJsonAttribute(key: string) {
    const contents = await getPackageJson();
    return contents['key'];
}

export async function getReadmeUrl() {
    const contents = await getPackageJson();
    return contents['readme'];
}