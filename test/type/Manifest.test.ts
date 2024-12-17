import path from 'node:path';
import fs from 'node:fs';

import mockfs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';

const resourceDir = 'test/resource/Manifest';
let resourceSubdirManifests: string;
let resourceSubdirManRoot: string;
let resourceSubdirManOutput: string;
let resourceSubdirExecutables: string;

let resourceFileExecutableOk: string;
let resourceFileExecutableBad: string;

let resourceFileManOk: string;
let resourceFileManBad: string;

beforeEach(() => {

    const config: FileSystem.DirectoryItems = {
        'test/resource/Manifest': {
            'manifests': {
                'generic-valid.manifest.yml': 'valid mandata here',
                'generic-invalid.manifest.yml': 'invalid mandata here',
                'non-existent.manifest.yml': '',
                'empty.manifest.yml': '',
                'no-name-attribute.manifest.yml': 'no name attr mandata here'
            },
            'executables': {
                'valid-executable.exe': 'some valid exe data',
                'invalid-executable.txt': 'some invalid data'
            },
            'root': {},
            'output': {},
        }
    };

    // Initialize paths relative to the mock filesystem
    resourceSubdirManifests = path.join(resourceDir, 'manifests');
    resourceSubdirManRoot = path.join(resourceDir, 'root');
    resourceSubdirManOutput = path.join(resourceDir, 'output');
    resourceSubdirExecutables = path.join(resourceDir, 'executables');

    resourceFileExecutableOk = path.join(resourceSubdirManifests, 'generic-valid.manifest.yml');
    resourceFileExecutableBad = path.join(resourceSubdirManifests, 'generic-invalid.manifest.yml');
    resourceFileManOk = path.join(resourceSubdirManifests, 'generic-valid.manifest.yml');
    resourceFileManBad = path.join(resourceSubdirManifests, 'generic-invalid.manifest.yml');

    mockfs(config);
});

afterEach(() => {
    mockfs.restore();
})

test('mock fs should be created', () => {
    expect(fs.existsSync(resourceFileExecutableOk)).toBe(true);
    expect(fs.existsSync(resourceFileExecutableBad)).toBe(true);
    expect(fs.existsSync(resourceFileManOk)).toBe(true);
    expect(fs.existsSync(resourceFileManBad)).toBe(true);
});