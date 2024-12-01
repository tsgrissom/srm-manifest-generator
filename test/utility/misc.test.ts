import assert from 'node:assert';
import { describe, it } from 'node:test';

import { isProcessRunning } from '../../src/utility/misc.js';

describe('File: utility/misc.js', () => {

    // MARK: Fn: isProcessRunning
    // TODO TEST More unit tests
    // TODO TEST Test argument checking 
    describe('Function: isProcessRunning', () => {
        const defaultPlatformOptions = {
            supportedPlatforms: ['win32', 'darwin', 'linux'],
            settings: {
                win32: { command: 'tasklist', processName: 'steam.exe' },
                darwin: { command: 'ps aux | grep [S]team', processName: 'steam' },
                linux: { command: 'ps aux | grep [s]team', processName: 'steam' }
            }
        };

        it('should not reject its Promise', async () => {
            await assert.doesNotReject(isProcessRunning(defaultPlatformOptions)); 
        });
    });
});

