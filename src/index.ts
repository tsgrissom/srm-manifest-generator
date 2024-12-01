import startApp from './app.js';

try {
    await startApp();
} catch (err) {
    console.error('Error on app start:', err);
}