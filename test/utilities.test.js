import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCountString, isSteamRunning } from "../src/utilities.js";

describe('File: utilities.js', () => {
    
    describe('Function: isSteamRunning', () => {

        it('should return a resolved Promise', () => {
            assert.doesNotReject(() => isSteamRunning());
        });
        
    });
    
    describe('Function: getCountString', () => {

        it('should throw error when passed a non-number', () => {
            const inputs = ['Some string', true, false, 'true', '2'];
    
            inputs.forEach(input => {
                assert.throws(() => getCountString(input));
            });
        });
    
        // TODO: This
        it('should infer plural noun when parameters are a plural number of things and no supplied plural noun', () => {
    
        });

    });

});

