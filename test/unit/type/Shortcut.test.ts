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

// TEST Typeguard unit tests

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

		// TODO Infer title from target

		it.todo(`throws err if from data w/ empty target`);

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

	describe('Property: hasAbsoluteTarget', () => {
		it('returns false if target path is empty', () => {
			mockSc.target = '';
			expect(mockSc.hasAbsoluteTarget).toBe(false);
		});

		it('returns true if target path is absolute', () => {
			mockSc.target = '/some/absolute/path';
			expect(mockSc.hasAbsoluteTarget).toBe(true);

			if (process.platform === 'win32') {
				// TODO Maybe mock this?
				mockSc.target = 'C:\\Some\\Absolute\\Path';
				expect(mockSc.hasAbsoluteTarget).toBe(true);
			}
		});

		it('returns false if target path is relative', () => {
			mockSc.target = './some/relative/path';
			expect(mockSc.hasAbsoluteTarget).toBe(false);
			mockSc.target = 'some/relative/path';
			expect(mockSc.hasAbsoluteTarget).toBe(false);
			mockSc.target = '.\\some\\relative\\path';
			expect(mockSc.hasAbsoluteTarget).toBe(false);
			mockSc.target = 'some\\relative\\path';
			expect(mockSc.hasAbsoluteTarget).toBe(false);
		});
	});

	// TODO TEST Property: hasRelativeTarget

	describe('Method: getFullTargetPath()', () => {
		it('returns expected full target path', () => {
			expect(mockSc.getFullTargetPath(mockManData)).toBe(expectedSc.fullTargetPath);
		});
	});

	describe('Property: isEnabled', () => {
		it('returns true when enabled is true', () => {
			expect(mockSc.enabled).toBe(true);
		});

		it('returns false when enabled is false', () => {
			mockSc.enabled = false;
			expect(mockSc.enabled).toBe(false);
		});
	});

	describe('Property: isDisabled', () => {
		it('returns true when enabled is false', () => {
			mockSc.enabled = false;
			expect(mockSc.isDisabled).toBe(true);
		});

		it('returns false when enabled is true', () => {
			expect(mockSc.isDisabled).toBe(false);
		});
	});
});
