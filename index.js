import chalk from "chalk";
import startApp from "./src/app.js";

try {
    await startApp();
    console.log(chalk.green('STARTED'));
} catch (err) {
    console.error('An error occurred on app start:', err);
}