import assert from 'node:assert';
import { describe, it } from 'node:test';

import { isProcessRunning } from "../src/utilities.js";

describe('File: utilities.js', () => {

    // MARK: Fn: isProcessRunning
    // TODO TEST More unit tests
    // TODO TEST Test argument checking 
    describe('Function: isProcessRunning', () => {
        it('should not reject its Promise', () => {
            assert.doesNotReject(() => isProcessRunning());
        });
    });

});

