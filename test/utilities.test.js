import { test } from 'node:test';
import assert from 'node:assert';
import { isSteamRunning } from "../src/utilities.js";

function yn(b) {
    return b ? 'Yes' : 'No';
}

test('isSteamRunning has a result', () => {
    isSteamRunning()
        .then((running) => {
            console.log(`Is Steam running? ${yn(running)}`);
            assert.ok(true);
        })
        .catch(err => {
            console.error('Error checking if Steam is running:', err);
            assert.fail();
        });
});