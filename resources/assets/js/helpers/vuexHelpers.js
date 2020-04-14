import Vue from "vue";

/**
 * Deletes a deeply nested property in an object, in a way that Vue can react to (it's useful for vuex)
 * Use like
 * ```
 * deleteProperty(state, ["enteredUnitRates", resultCode, date]);
 * ```
 * This deletes `state["enteredUnitRates"][resultCode][date]`
 *
 * Can be imported like `import deleteProperty from "@/js/helpers/deleteProperty";`
 * @param obj {object}
 * @param props {array}
 */
function deleteProperty(obj, props) {
    const prop = props.shift();
    if (!obj[prop]) {
        return;
    }
    if (!props.length) {
        Vue.delete(obj, prop);
        return;
    }
    deleteProperty(obj[prop], props);
}

/**
 * Sets a deeply nested property in an object, in a way that Vue can react to (it's useful for vuex)
 * Use like
 * ```
 * setProperty(state, ["enteredUnitRates", resultCode, date], newUnitRates);
 * ```
 * This sets `state["enteredUnitRates"][resultCode][date]` to be `newUnitRates`
 *
 * Can be imported like `import setProperty from "@/js/helpers/setProperty";`
 * @param obj {object}
 * @param props {array}
 * @param value {object}
 */
function setProperty(obj, props, value) {
    const prop = props.shift();
    if (!obj[prop]) {
        Vue.set(obj, prop, {});
    }
    if (!props.length) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            obj[prop] = { ...obj[prop], ...value };
        } else {
            obj[prop] = value;
        }
        return;
    }
    setProperty(obj[prop], props, value);
}

/**
 * Sets a deeply nested property in an object, *completely overwriting* the existing property - it will remove any keys that already exist for a property that is an object, unlike setProperty
 * @param obj {object}
 * @param props {array}
 * @param value {object}
 */
function setPropertyAndOverwrite(obj, props, value) {
    const prop = props.shift();
    if (!obj[prop]) {
        Vue.set(obj, prop, {});
    }
    if (!props.length) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            Vue.set(obj, prop, Object.assign({}, value));
        } else {
            obj[prop] = value;
        }
        return;
    }
    setPropertyAndOverwrite(obj[prop], props, value);
}

export { deleteProperty, setProperty, setPropertyAndOverwrite };