import startApp from './app';

try {
	await startApp();
} catch (err) {
	console.error('Error on app start:', err);
}
