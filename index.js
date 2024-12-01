import chalk from 'chalk';
import startApp from './src/app.js';
import { logDebug } from './src/utility/logging.js';

try {
    await startApp();
    logDebug(chalk.green('APP STARTED'));
} catch (err) {
    console.error('An error occurred on app start:', err);
}