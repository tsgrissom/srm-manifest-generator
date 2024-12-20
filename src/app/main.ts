import { startApp } from './startApp.js';

// TODO Phase this out in favor of main.ts in ./cli

try {
	await startApp();
} catch (err) {
	console.error('Error on app start:', err);
}
