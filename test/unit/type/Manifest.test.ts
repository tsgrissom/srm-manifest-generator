import fs from 'node:fs';
import path from 'node:path';

import mockFs from 'mock-fs';
import FileSystem from 'mock-fs/lib/filesystem';
import yaml from 'yaml';

import { Manifest } from '../../../src/app/type/Manifest';
import { ManifestData } from '../../../src/app/type/ManifestData';
import Shortcut from '../../../src/app/type/Shortcut';
import { ShortcutData } from '../../../src/app/type/ShortcutData';
import { basenameWithoutExtensions } from '../../../src/util/file/path';

const resourceDir = 'test/resource/Manifest';
// const pathSubdirExecutables = path.join(resourceDir, 'executables');
const pathSubdirManifests = path.join(resourceDir, 'manifests');

// TODO Phase out above

const mockBaseDir = '/mock/base/dir';
const mockTargetSubdir = 'path/to/target.exe';

let mockScData: ShortcutData;
let mockSc: Shortcut;
let mockManData: ManifestData;
let mockManifest: Manifest;

beforeEach(() => {
	// TODO Construct the rest of the test data
	mockScData = {
		title: 'A Game',
		target: mockTargetSubdir,
	};
	mockSc = new Shortcut(mockScData);

	mockManData = {
		sourceName: 'Some Source of Titles',
		baseDirectory: mockBaseDir,
		outputPath: '/mock/output/dir',
		shortcuts: [mockSc],
	};
	mockManifest = new Manifest(
		path.join(pathSubdirManifests, 'mock-manifest.manifest.yml'),
		mockManData,
	);

	const mockManDataNoNameAttribute = { ...mockManData };
	mockManDataNoNameAttribute.sourceName = '';

	const config: FileSystem.DirectoryItems = {
		'test/resource/Manifest': {
			manifests: {
				'mock-manifest.manifest.yml': yaml.stringify(mockManData),
				'no-name-attribute.manifest.yml': yaml.stringify(
					mockManDataNoNameAttribute,
				),
				// 'bad-manifest.manifest.yml': 'invalid mandata here',
				// // 'non-existent.manifest.yml': '',
				// 'empty.manifest.yml': '',
			},
			executables: {
				'ok-executable-ext.exe': 'some valid exe data',
				'bad-executable-ext.txt': 'some invalid data',
			},
		},
	};

	mockFs(config);
});

afterEach(() => {
	mockFs.restore();
});

// MARK: Mock FS

test('mock fs should be created', () => {
	expect(fs.existsSync(mockManifest.filePath)).toBe(true);
});

describe('Class: Manifest', () => {
	// MARK: Constructor

	describe('Constructor', () => {
		// TODO Tests
	});

	// MARK: Mtd hasNameAttribute

	describe('Property: hasNameAttribute', () => {
		it('returns true when valid manifest', () => {
			mockManifest.sourceName = 'Some Source';
			expect(mockManifest.hasSourceNameAttribute).toBe(true);
		});

		it('returns false when no name attribute manifest', () => {
			mockManifest.sourceName = '';
			expect(mockManifest.hasSourceNameAttribute).toBe(false);
		});
	});

	// MARK: Mtd getFileBasename

	describe('Property: fileBasename', () => {
		it('returns str not equal to instance.filePath when valid manifest', () => {
			const fileBasename = mockManifest.fileBasename;
			const filePath = path.join(pathSubdirManifests, 'mock-manifest.manifest.yml');
			expect(fileBasename).not.toBe(filePath);
		});
	});

	// MARK: Mtd getName

	// TODO Rewrite
	describe('Property: name', () => {
		test.each(['Something', 'Another', 'A Manifest'])(
			'returns given str when ok instance made with sourceName value: %p',
			value => {
				const mockData = { ...mockManData };
				mockData.sourceName = value;
				const mockInstance = new Manifest(
					path.join(pathSubdirManifests, 'mock-manifest.manifest.yml'),
					mockData,
				);

				expect(mockInstance.name).toBe(value);
			},
		);

		it('returns basename w/o exts when ok manifest without name attr', () => {
			mockManifest.sourceName = '';
			const expected = basenameWithoutExtensions(mockManifest.filePath);
			expect(mockManifest.name).toBe(expected);
		});
	});
});
