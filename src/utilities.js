export function getCountString(count, singularNoun, pluralNoun = null) {
    if (typeof(count) !== 'number') {
        console.error('Cannot pluralize count which is not a number');
        return 'ERROR';
    }

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (count === 0 || count > 1) ? pluralNoun : singularNoun;
    return `${count} ${verbiage}`;
};