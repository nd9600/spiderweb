/**
 * Returns whether a string is an integer
 * @param str string
 * @returns {boolean}
 */
function isIntegerString(str) {
    const stringIsAllZeros = RegExp(/^0+$/).test(str);
    if (stringIsAllZeros) {
        return true;
    }

    const trimmedStr = str.replace(/^0+/, "");
    const n = Math.floor(Number(trimmedStr));
    return n !== Infinity && String(n) === trimmedStr && n >= 0;
}

/**
 * Returns whether a variable is an integer, like 1 or "1"
 * @param n string
 * @returns {boolean}
 */
function isInteger(n) {
    return Number.isInteger(n) || isIntegerString(n);
}

/**
 * Returns whether a variable is a number, like 1, "1", 1.2, or "1.2"
 * @param n string
 * @returns {boolean}
 */
function isNumber(n) {
    const isString = typeof n === "string";
    if (isString) {
        const stringEndsInDot = RegExp(/^.*\.$/).test(n);
        if (stringEndsInDot) {
            return false;
        }
    }

    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Returns true if 'n' is floating point, false otherwise.
 * @param n
 * @returns {boolean}
 */
const isFloat = (n) => {
    return Number(n) === n && n % 1 !== 0;
};

export {isIntegerString, isInteger, isNumber, isFloat};