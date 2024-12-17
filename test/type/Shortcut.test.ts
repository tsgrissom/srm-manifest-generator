import path from 'node:path';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';
import tmp from 'tmp';
import yaml from 'yaml';

import ManifestData from '../../src/type/manifest/ManifestData';
import Shortcut from '../../src/type/shortcut/Shortcut';
import ShortcutData from '../../src/type/shortcut/ShortcutData';

const resourceDir = 'test/resource/Shortcut';
const pathSubdirManBaseDir = path.join(resourceDir, 'mockBaseDir');
const pathSubdirManOutputDir = path.join(resourceDir, 'mockOutputDir');

// TODO This could be DRYer

beforeEach(() => {
    const scDataGenOk: ShortcutData = {
        title: 'Some Game',
        target: 'Some Path/Relative/To/Base/Dir/to/Game.exe',
        enabled: true
    }
    
    const scGenOk = new Shortcut(scDataGenOk);

    const manFileContentsGenOk: ManifestData = {
        sourceName: 'generic-ok',
        baseDirectory: pathSubdirManBaseDir,
        outputPath: pathSubdirManOutputDir,
        shortcuts: [scGenOk]
    }

    const config: FileSystem.DirectoryItems = {
        'test/resource/Shortcut': {
            'manifests': {
                'generic-ok.manifest.yml': yaml.stringify(manFileContentsGenOk)
            }
        }
    };

    mockFs(config);
});

afterEach(() => {
    mockFs.restore();
});

describe('Class: Shortcut', () => {
	const someExecutablePath = tmp.tmpNameSync({ prefix: 'some-executable', postfix: '.exe' });
	const scDataGenOk: ShortcutData = {
		title: 'Some Title',
		target: someExecutablePath,
		enabled: true
	};
	const scDataEmptyTitle: ShortcutData = {
		title: '',
		target: someExecutablePath,
		enabled: true
    };
    
    // MARK: Constructor

	describe('Constructor', () => {

		it(`throws err if from data w/ empty title: (Title: "${scDataEmptyTitle.title}")`, () => {
			expect(() => new Shortcut(scDataEmptyTitle)).toThrow();
		});

		it('does not throw err if instantiated with undefined config arg', () => {
			expect(() => new Shortcut(scDataGenOk, undefined)).not.toThrow();
		});

		test.each([undefined, null])(
			`does not throw err if instantiated w/ undefined or null enabled arg: %p`,
			value => {
				expect(
					() =>
						new Shortcut({
							title: 'Something',
							target: someExecutablePath,
							enabled: value as unknown as boolean
						})
				).not.toThrow();
			}
		);
		
	});
});