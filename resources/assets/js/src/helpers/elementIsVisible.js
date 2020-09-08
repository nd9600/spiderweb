/**
 * Returns whether an element can be seen (i.e. it's in the viewport)
 * @param element
 * @param scrolledThing
 * @returns {boolean}
 */
export default function(element, scrolledThing = null, topMustBeVisble = true) {
    if (!element || scrolledThing.scrollLeft == null) {
        return false;
    }

    const bounding = element.getBoundingClientRect();
    if (scrolledThing === null) {
        return (
            bounding.top >= 0
            && bounding.left >= 0
            && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            && bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    let container = scrolledThing.getBoundingClientRect();
    if (topMustBeVisble) {
        return (
            bounding.top >= 0
            && bounding.left >= 0
            && bounding.y <= container.bottom
            && bounding.x <= container.right
        );
    } else {
        return (bounding.left >= 0
            && bounding.y <= container.bottom
            && bounding.x <= container.right
        );
    }
}