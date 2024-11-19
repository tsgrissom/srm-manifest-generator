import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCountString, isSteamRunning } from "../src/utilities.js";

describe('File: utilities.js', () => {
    
    describe('Function: isSteamRunning', () => {

        it('should not reject its Promise', () => {
            assert.doesNotReject(() => isSteamRunning());
        });
        
    });
    
    describe('Function: getCountString', () => {

        it('should, when passed a non-number argument to number of things parameter, throw an error', () => {
            const inputs = ['Some string', true, false, 'true', '2'];
    
            inputs.forEach(input => {
                assert.throws(() => getCountString(input));
            });
        });

        // TODO: This
        // TODO: Rephrase last clause in description
        it('should, when arguments include a plural number of things and no specified plural noun, infer a plural noun', () => {

        });

    });

});

