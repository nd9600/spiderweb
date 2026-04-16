function isIntegerString(str: string): boolean {
    const stringIsAllZeros = RegExp(/^0+$/).test(str);
    if (stringIsAllZeros) {
        return true;
    }

    const trimmedStr = str.replace(/^0+/, "");
    const n = Math.floor(Number(trimmedStr));
    return n !== Infinity && String(n) === trimmedStr && n >= 0;
}

function isInteger(n: number | string): boolean {
    return Number.isInteger(n) || (typeof n === "string" && isIntegerString(n));
}

function isNumber(n: number | string): boolean {
    const isString = typeof n === "string";
    if (isString) {
        const stringEndsInDot = RegExp(/^.*\.$/).test(n);
        if (stringEndsInDot) {
            return false;
        }
    }

    const parsedNumber = Number(n);
    return !Number.isNaN(parsedNumber) && Number.isFinite(parsedNumber);
}

const isFloat = (n: unknown): boolean => {
    return Number(n) === n && n % 1 !== 0;
};

export {isIntegerString, isInteger, isNumber, isFloat};
