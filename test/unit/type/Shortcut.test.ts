import path from 'node:path';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';
import yaml from 'yaml';

import { ManifestData } from '../../../src/app/type/ManifestData';
import Shortcut from '../../../src/app/type/Shortcut';
import { ShortcutData } from '../../../src/app/type/ShortcutData';

const mockBaseDir = '/mock/base/dir';
const mockTargetSubdir = 'path/to/target.exe';

let mockScData: ShortcutData;
let mockSc: Shortcut;
let expectedSc: { title: string; target: string; fullTargetPath: string };

let mockManData: ManifestData;
// let mockMan: Manifest;

beforeEach(() => {
	mockScData = {
		title: 'Some Game',
		target: mockTargetSubdir,
	};
	mockSc = new Shortcut(mockScData);
	expectedSc = {
		title: mockScData.title,
		target: mockScData.target,
		fullTargetPath: path.join(mockBaseDir, mockTargetSubdir),
	};

	mockManData = {
		sourceName: 'Some Source',
		baseDirectory: mockBaseDir,
		outputPath: '/mock/output/dir',
		shortcuts: [mockSc],
	};
	// mockMan = new Manifest(
	// 	path.join(pathSubdirManifests, 'mocked-manifest.manifest.yml'),
	// 	mockManData,
	// );

	// TODO Make this more dynamic as well or do away with it altogether
	const config: FileSystem.DirectoryItems = {
		'test/resource/Shortcut': {
			manifests: {
				'mocked-manifest.manifest.yml': yaml.stringify(mockManData),
			},
			executables: {
				'ok-executable.exe': 'some exe data',
			},
		},
	};

	mockFs(config);
});

afterEach(() => {
	mockFs.restore();
});

describe('Class: Shortcut', () => {
	// MARK: Constructor

	describe('Constructor', () => {
		it(`throws err if from data w/ empty title`, () => {
			mockScData.title = '';
			expect(() => new Shortcut(mockScData)).toThrow();
		});

		it('does not throw err if instantiated with undefined config arg', () => {
			expect(() => new Shortcut(mockScData, undefined)).not.toThrow();
		});

		it('does not throw err if instantiated w/ undefined enabled arg', () => {
			mockScData.enabled = undefined;
			expect(() => new Shortcut(mockScData)).not.toThrow();
		});
	});

	describe('Method: getExportData()', () => {
		it('returns export data w/ correct title + target', () => {
			const exportData = mockSc.getExportData(mockManData);

			expect(exportData).toEqual({
				title: expectedSc.title,
				target: expectedSc.fullTargetPath,
			});
		});
	});

	describe('Method: getExportString()', () => {
		it('returns export data as JSON string', () => {
			const exportStr = mockSc.getExportString(mockManData);

			expect(() => JSON.parse(exportStr) as object).not.toThrow();
			const parsed = JSON.parse(exportStr) as ShortcutData;
			expect(parsed.title).toBe(expectedSc.title);
			expect(parsed.target).toBe(expectedSc.fullTargetPath);
		});
	});

	// FIXME Appears broken on macOS
	describe('Method: isTargetPathAbsolute()', () => {
		it('returns false if target path is empty', () => {
			mockSc.target = '';
			expect(mockSc.isTargetPathAbsolute()).toBe(false);
		});

		it('returns true if target path is absolute', () => {
			mockSc.target = '/some/absolute/path';
			expect(mockSc.isTargetPathAbsolute()).toBe(true);

			if (process.platform === 'win32') {
				// TODO Maybe mock this?
				mockSc.target = 'C:\\Some\\Absolute\\Path';
				expect(mockSc.isTargetPathAbsolute()).toBe(true);
			}
		});

		it('returns false if target path is relative', () => {
			mockSc.target = './some/relative/path';
			expect(mockSc.isTargetPathAbsolute()).toBe(false);
			mockSc.target = 'some/relative/path';
			expect(mockSc.isTargetPathAbsolute()).toBe(false);
			mockSc.target = '.\\some\\relative\\path';
			expect(mockSc.isTargetPathAbsolute()).toBe(false);
			mockSc.target = 'some\\relative\\path';
			expect(mockSc.isTargetPathAbsolute()).toBe(false);
		});
	});

	// TEST Method: isTargetPathRelative

	describe('Method: getFullTargetPath()', () => {
		it('returns expected full target path', () => {
			expect(mockSc.getFullTargetPath(mockManData)).toBe(expectedSc.fullTargetPath);
		});
	});

	describe('Method: isEnabled()', () => {
		it('returns true when enabled is true', () => {
			expect(mockSc.isEnabled).toBe(true);
		});

		it('returns false when enabled is false', () => {
			mockSc.enabled = false;
			expect(mockSc.isEnabled).toBe(false);
		});
	});

	describe('Method: isDisabled()', () => {
		it('returns true when enabled is false', () => {
			mockSc.enabled = false;
			expect(mockSc.isDisabled).toBe(true);
		});

		it('returns false when enabled is true', () => {
			expect(mockSc.isDisabled).toBe(false);
		});
	});
});
