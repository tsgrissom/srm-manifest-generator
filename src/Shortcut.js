import path from 'node:path';

import chalk from "chalk";

class Shortcut {

    constructor(rootDir, json) {
        // TODO Accept Manifest itself instead of rootDir
        // TODO Accept config in constructor, check validity of executable

        // Validate params

        if (!json) {
            throw new Error('Failed to create instance of Shortcut class: JSON parameter in constructor is invalid');
        }

        // MARK: PARSING

        const parsedValues = {
            title: undefined,
            target: undefined,
            enabled: true
        };

        // MARK: Parse target
        {
            if (json.target) {
                if (json.target.trim() !== '') {
                    parsedValues.target = json.target;      
                }
            } else { // Fall back to json.exec
                if (json.exec) {
                    if (json.exec.trim() !== '') {
                        parsedValues.target = json.exec;
                    }
                } else {
                    console.warn(`Couldn't find required Shortcut attribute "target" and exhausted its aliases as well`);
                }
            }
    
            if (!parsedValues.target) {
                throw new Error('Failed to create instance of Shortcut class: Could not find required attribute "target" or any of its aliases');
            }
        }


        // MARK: Parse title
        {
            if (json.title) {
                if (json.title.trim() !== '') {
                    parsedValues.title = json.title;
                }
            } else {
                if (json.name) {
                    if (json.name.trim() !== '') {
                        parsedValues.title = json.name;
                    }
                } else {
                    console.warn(`Could not find optional Shortcut attribute "title" and exhausted its aliases as well`);
                    // TODO Attempt to parse title from target as last-ditch effort
                }
            }
        }

        // MARK: Parse enabled
        {
            if (json.enabled !== undefined && !json.enabled) {
                parsedValues.enabled = false;
            }
    
            if (json.disabled !== undefined && json.disabled) {
                parsedValues.enabled = false;
            }

            if (json.disabled !== undefined && json.enabled !== undefined) {
                console.warn(chalk.yellow(`WARN: Properties "disabled" and "enabled" were found in a Shortcut at the same time which can cause issues. You probably want to remove one.`));
            }
        }

        this.title = parsedValues.title;
        this.target = parsedValues.target;
        this.enabled = parsedValues.enabled;

        // const fullPath = path.join(rootDir, this.target); // TODO To remove this, rewrite Manifest constructor and pass above
        // const targetExists = fs.existsSync(fullPath);

        // if (!targetExists) {
        //     console.warn(`Failed to create instance of Shortcut class. Required attribute "target" points to a non-existent path: ${fullPath}`);
        // }

        // MARK: PARSING END
        
        if (!this.title) { // Title still missing? Attempt to parse from target
            this.title = path.basename(this.title); // TODO What are cases this could fail?
        }

        this.printDebugStatus();
    }

    printDebugStatus() {
        console.log(chalk.green('PARSED SHORTCUT OBJECT DEBUG'));
        console.log(`title: ${this.title}`);
        console.log(`target: ${this.target}`);
        console.log(`enabled: ${this.enabled}`);
    }

    getTitle() {
        return this.title;
    }

    getRelativeTargetPath() {
        return this.target;
    }

    getFullTargetPath() {
        return '';
    }

    // async doesTargetFileExist() {

    // }

    // async isTargetFileValidExecutable() {

    // }

    // async isTargetPathValid() {

    // }

    // async getTitle() {
        
    // }

    // async getTargetPath() {

    // }
}

export default Shortcut;