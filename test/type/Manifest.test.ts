import path from 'node:path';
import fs from 'node:fs';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';
import yaml from 'yaml';

import { basenameWithoutExtensions } from '../../src/utility/path';

import ManifestData from '../../src/type/manifest/ManifestData';
import ShortcutData from '../../src/type/shortcut/ShortcutData';
import Shortcut from '../../src/type/shortcut/Shortcut';
import Manifest from '../../src/type/manifest/Manifest';

const resourceDir = 'test/resource/Manifest';
const pathSubdirExecutables = path.join(resourceDir, 'executables');
const pathSubdirManifests = path.join(resourceDir, 'manifests');
const pathSubdirManBaseDir = path.join(resourceDir, 'baseDir');
const pathSubdirManOutputDir = path.join(resourceDir, 'outputDir');

// TODO Whole thing could probably be more DRY?

// const pathExecFileBadExt = path.join(pathSubdirExecutables, 'bad-executable-ext.txt');
// const pathManFileBad = path.join(pathSubdirManifests, 'bad-manifest.manifest.yml');
const pathExecFileOkExt = path.join(pathSubdirExecutables, 'ok-executable-ext.exe');
const pathManFileOk = path.join(pathSubdirManifests, 'ok-manifest.manifest.yml');
const pathManFileNoNameAttr = path.join(pathSubdirManifests, 'no-name-attribute.manifest.yml');
// TODO Manifest with empty file contents
// TODO Manifest which has bad ext, bad contents, etc.

const shortcutDataOk: ShortcutData = {
    title: 'A Fake Game',
    target: pathExecFileOkExt
}

const shortcutsOk: Shortcut[] = [
    new Shortcut(shortcutDataOk)
];

const manDataOk: ManifestData = {
    sourceName: basenameWithoutExtensions(pathManFileOk, '*'),
    baseDirectory: pathSubdirManBaseDir,
    outputPath: pathSubdirManOutputDir,
    shortcuts: shortcutsOk
};

const manDataNoNameAttr: ManifestData = {
    sourceName: '',
    baseDirectory: pathSubdirManBaseDir,
    outputPath: pathSubdirManOutputDir,
    shortcuts: shortcutsOk
};

let manOk: Manifest;
let manNoNameAttr: Manifest;

beforeEach(() => {

    // TODO Construct the rest of the test data
    
    const config: FileSystem.DirectoryItems = {
        'test/resource/Manifest': {
            'manifests': {
                'ok-manifest.manifest.yml': yaml.stringify(manDataOk),
                'bad-manifest.manifest.yml': 'invalid mandata here',
                // 'non-existent.manifest.yml': '',
                'empty.manifest.yml': '',
                'no-name-attribute.manifest.yml': yaml.stringify(manDataNoNameAttr)
            },
            'executables': {
                'ok-executable-ext.exe': 'some valid exe data',
                'bad-executable-ext.txt': 'some invalid data'
            },
            'baseDir': {}, // TODO Might need to put a txt in here, test if that makes existSync see dir
            'outputDir': {},
        }
    };

    manOk = new Manifest(pathManFileOk, manDataOk);
    manNoNameAttr = new Manifest(pathManFileNoNameAttr, manDataNoNameAttr);

    mockFs(config);
});

afterEach(() => {
    mockFs.restore();
})

// MARK: Mock FS

test('mock fs should be created', () => {
    // expect(fs.existsSync(pathFileExecOk)).toBe(true);
    // expect(fs.existsSync(pathFileExecBad)).toBe(true);
    expect(fs.existsSync(pathManFileOk)).toBe(true);
    expect(fs.existsSync(pathManFileNoNameAttr)).toBe(true);
});

describe('Class: Manifest', () => {
	
    // MARK: Constructor

    describe('Constructor', () => {
		// TODO Tests
	});

	// MARK: Mtd hasNameAttribute

	describe('Method: hasNameAttribute()', () => {
		// it('should, when instance constructed from valid manifest file, return true', () => {
		//     expect(manOk.hasNameAttribute()).toBe(true);
		// });
		// it('should, when instance constructed from manifest that has no name attribute, return false', () => {
		//     expect(manNoNameAttr.hasNameAttribute()).toBe(false);
		// });

		it('should be true when constructed from valid manifest', () => {
			expect(manOk.hasNameAttribute()).toBe(true);
		});

		it('should be false when constructed from no name attribute manifest', () => {
			expect(manNoNameAttr.hasNameAttribute()).toBe(false);
		});
	});

	// MARK: Mtd getFileBasename

	describe('Method: getFileBasename()', () => {
		it('should return a string not equal to the original file path of the source manifest file', () => {
			const fileBasename = manOk.getFileBasename();
			const filePath = path.join(pathSubdirManifests, 'ok-manifest.manifest.yml');
			expect(fileBasename).not.toBe(filePath);
		});
	});

	// MARK: Mtd getName

	describe('Method: getName()', () => {
		test.each(['Something', 'Another', 'A Manifest'])(
			'should, when instance constructed from an ok manifest with the given sourceName value, return the same value',
			value => {
				const data: ManifestData = {
					sourceName: value,
					baseDirectory: manDataOk.baseDirectory,
					outputPath: manDataOk.outputPath,
					shortcuts: manDataOk.shortcuts
				};
				const inst = new Manifest(pathManFileOk, data);

				expect(inst.getName()).toBe(value);
			}
		);

		it('should, when instance constructed from an ok manifest with no name attribute, return the basename without exts of the fileName', () => {
			const actual = manNoNameAttr.getName();
			const expected = basenameWithoutExtensions(manNoNameAttr.filePath, '*', true);
			expect(actual).toBe(expected);
		});
	});
});