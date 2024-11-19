import { describe, it } from 'node:test';
import assert from 'node:assert';

import Manifest from '../src/Manifest.js';

const exampleManifestPath = './config/examples/example.manifest.yml';
const exampleManifest = new Manifest(exampleManifestPath);
const invalidManifest = new Manifest('./some-made-up-file.yml');

describe('Class: Manifest', () => {
    describe('Method: doesFileExist', () => {
        it('should return true when constructor was passed example manifest path', () => {
            assert(exampleManifest.doesFileExist, `File does not exist: "${exampleManifestPath}"`);
        });
    });

    describe('Method: getDataAsString', () => {
        it('should throw an error if the file does not exist', async () => {
            await assert.rejects(() => invalidManifest.getDataAsString());
        });

        it('should not return a null value when constructor was passed example manifest path', async () => {
            const data = await exampleManifest.getDataAsString();
            assert.notStrictEqual(data, null);
        });

        it('should not return an empty string value when constructor was passed example manifest path', async () => {
            const data = await exampleManifest.getDataAsString();
            assert.notStrictEqual(data, '');
        });
    });

    describe('Method: getSourceName', () => {
        it('should return string literal "Example Source Name" when path of example manifest was passed to constructor', async () => {
            const name = await exampleManifest.getSourceName();
            assert.strictEqual(name, 'Example Source Name');
        });
    });
});