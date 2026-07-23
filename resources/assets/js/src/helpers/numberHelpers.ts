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

export {isIntegerString, isInteger};
