import ShortcutOutput from './ShortcutOutput.js';

// TODO jsdoc
interface ShortcutData extends ShortcutOutput {
    title: string;
    target: string;
    enabled: boolean;
}

export default ShortcutData;