import { test } from 'node:test';
import assert from 'node:assert';
import { isSteamRunning } from "../src/utilities.js";

test('isSteamRunning has a result', () => {
    isSteamRunning()
        .then((running) => {
            if (running) {
                console.log('Steam is running');
            } else {
                console.log('Steam is not running');
            }

            assert.ok(true);
        })
        .catch(err => {
            console.error('Error checking if Steam is running:', err);
            assert.fail();
        });
});