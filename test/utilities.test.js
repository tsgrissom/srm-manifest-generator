import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCountString, isSteamRunning } from "../src/utilities.js";

describe('Function isSteamRunning', () => {
    it('should return a resolved Promise', () => {
        isSteamRunning()
            .then(running => {
                console.log('Is Steam running? ' + (running ? 'Y' : 'N'));
                assert.ok(true);
            })
            .catch(err => {
                console.error('Something went wrong while checking if Steam is running:', err);
                assert.fail();
            });
    });
});

describe('Function getCountString', () => {
    // TODO: This
    it('should infer plural noun when parameters are a plural number of things and no supplied plural noun', () => {

    });

    it('should return string literal "ERROR" when passed a non-number', () => {
        const inputs = ['Some string', true, false, 'true'];

        inputs.forEach(input => {
            assert.strictEqual(
                getCountString(input),
                'ERROR',
                `Expected "ERROR" for input: ${JSON.stringify(input)}`
            );
        });
    });
});