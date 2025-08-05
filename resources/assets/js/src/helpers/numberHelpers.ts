function isIntegerString(str: string): boolean {
  const stringIsAllZeros = /^0+$/.test(str);
  if (stringIsAllZeros) {
    return true;
  }

  const trimmedStr = str.replace(/^0+/, "");
  const n = Math.floor(Number(trimmedStr));
  return n !== Infinity && String(n) === trimmedStr && n >= 0;
}

function isInteger(n: any): boolean {
  return Number.isInteger(n) || isIntegerString(n);
}

function isNumber(n: any): boolean {
  const isString = typeof n === "string";
  if (isString) {
    const stringEndsInDot = /^.*\.$/.test(n);
    if (stringEndsInDot) {
      return false;
    }
  }

  return !isNaN(parseFloat(n)) && isFinite(n);
}

const isFloat = (n: any): boolean => {
  return Number(n) === n && n % 1 !== 0;
};

export { isIntegerString, isInteger, isNumber, isFloat };