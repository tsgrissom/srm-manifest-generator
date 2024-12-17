import path from 'node:path';
import fs from 'node:fs';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';

const resourceDir = 'test/resource/Shortcut';

beforeEach(() => {
    // const config: FileSystem.DirectoryItems = {
    //         'test/resource/tmp': {
    //             'manifests': {
    //                 'generic-valid.manifest.yml': 'valid mandata here',
    //                 'generic-invalid.manifest.yml': 'invalid mandata here',
    //                 'non-existent.manifest.yml': '',
    //                 'empty.manifest.yml': '',
    //                 'no-name-attribute.manifest.yml': 'no name attr mandata here'
    //             },
    //             'executables': {
    //                 'valid-executable.exe': 'some valid exe data',
    //                 'invalid-executable.txt': 'some invalid data'
    //             },
    //             'root': {},
    //             'output': {},
    //         }
    //     };

    const config: FileSystem.DirectoryItems = {
        'test/resource/Shortcut': {

        }
    };

    mockFs(config);
});

afterEach(() => {
    mockFs.restore();
});

test('1+2=3', () => {
    expect(1 + 2).toBe(3);
})