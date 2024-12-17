import path from 'node:path';
import fs from 'node:fs';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';
import tmp from 'tmp';
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
const pathSubdirManRootDir = path.join(resourceDir, 'rootDir');

// TODO Whole thing could probably be more DRY?

const pathExecFileOkExt = path.join(pathSubdirExecutables, 'ok-executable-ext.exe');
const pathExecFileBadExt = path.join(pathSubdirExecutables, 'bad-executable-ext.txt');
const pathManFileOk  = path.join(pathSubdirManifests, 'ok-manifest.manifest.yml');
const pathManFileBad = path.join(pathSubdirManifests, 'bad-manifest.manifest.yml');

let manOk: Manifest;

beforeEach(() => {

    // TODO Construct the rest of the test data

    const shortcutDataOk: ShortcutData = {
        title: 'A Fake Game',
        target: pathExecFileOkExt
    }
    const manDataOk: ManifestData = {
        sourceName: basenameWithoutExtensions(pathManFileOk, '.yml'),
        baseDirectory: pathSubdirManBaseDir,
        outputPath: pathSubdirManOutputDir,
        shortcuts: [new Shortcut(shortcutDataOk)]
    }
    
    const config: FileSystem.DirectoryItems = {
        'test/resource/Manifest': {
            'manifests': {
                'ok-manifest.manifest.yml': yaml.stringify(manDataOk),
                'bad-manifest.manifest.yml': 'invalid mandata here',
                'non-existent.manifest.yml': '',
                'empty.manifest.yml': '',
                'no-name-attribute.manifest.yml': 'no name attr mandata here'
            },
            'executables': {
                'ok-executable-ext.exe': 'some valid exe data',
                'bad-executable-ext.txt': 'some invalid data'
            },
            'baseDir': {},
            'rootDir': {}, // TODO Might need to put a txt in here, test if that makes existSync see dir
            'outputDir': {},
        }
    };

    manOk = new Manifest(path.join(pathSubdirManifests, 'ok-manifest.manifest.yml'), manDataOk);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    mockFs(config);
});

afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockFs.restore();
})

test('mock fs should be created', () => {
    // expect(fs.existsSync(pathFileExecOk)).toBe(true);
    // expect(fs.existsSync(pathFileExecBad)).toBe(true);
    expect(fs.existsSync(pathManFileOk)).toBe(true);
    expect(fs.existsSync(pathManFileBad)).toBe(true);
});

describe('Class: Manifest', () => {
    
    describe('Constructor', () => {
        it('Should throw err when constructed based on a non-existent source manifest file', () => {

        });
    });

    describe('Method: getFileBasename()', () => {
        it('should return a string not equal to the original file path of the source manifest file', () => {
            const fileBasename = manOk.getFileBasename();
            const filePath = path.join(pathSubdirManifests, 'ok-manifest.manifest.yml')
            expect(fileBasename).not.toBe(filePath);
        });
    });

});