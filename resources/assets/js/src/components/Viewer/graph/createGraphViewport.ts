import {select} from "d3-selection";
import {zoom, zoomIdentity, zoomTransform, type D3ZoomEvent, type ZoomTransform} from "d3-zoom";
import debounce from "lodash/debounce";
import "d3-transition";

import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {NodePosition, Zoom} from "@/src/@types/StoreTypes";
import {useDataStore} from "@/src/store";
import type {RenderNode} from "./layoutGraph";

function getPostFocusPoint(node: RenderNode, viewportWidth: number): NodePosition {
    const nodeElement = document.getElementById(`text-${node.id}`)?.parentElement;
    if (!(nodeElement instanceof SVGGraphicsElement)) {
        return node;
    }

    // Measure the whole node, including its label, when choosing where to focus.
    // The label can extend much further to the left than the circle.
    const bounds = nodeElement.getBBox();
    if (bounds.width <= 0 || bounds.height <= 0) {
        return node;
    }

    const margin = 24;
    const point = {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};
    // If the whole label will not fit inside the SVG when we focus the post,
    // show its beginning. Centring it would hide the first words.
    if (bounds.width * INITIAL_ZOOM > viewportWidth - margin * 2) {
        point.x = bounds.x + (viewportWidth / 2 - margin) / INITIAL_ZOOM;
    }
    return point;
}

export function createGraphViewport(svgElement: SVGSVGElement, rootElement: SVGGElement) {
    const dataStore = useDataStore();
    const svg = select(svgElement);
    const root = select(rootElement);
    let restoringView = false;
    let nodeRadius = 20;
    let nodeTextSize = 48;
    // These CSS variables belong to the page, so their values can remain after
    // Vue removes the previous SVG. Reset them before restoring the saved zoom.
    document.documentElement.style.setProperty("--node-text-size", `${nodeTextSize}px`);
    document.documentElement.style.setProperty("--link-stroke-width", `${nodeRadius}px`);

    // Save the zoom and pan after the view has stopped moving for 250 ms.
    // This avoids saving on every frame of an animation or every pointer movement.
    const saveZoom = debounce(() => {
        const {x, y, k: scale} = zoomTransform(svgElement);
        dataStore.setZoom({x, y, scale});
    }, 250);

    function updateAppearance(scale: number): void {
        // Increase the label and line sizes relative to the graph when zooming out.
        // Limit how large they can become so that they remain readable.
        const relativeScale = INITIAL_ZOOM / scale;
        const textScale = relativeScale < 1 ? relativeScale : 1 + (relativeScale - 1) * 0.35;
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        // Use half the text size on narrow screens.
        const fontSize = Math.min(220, Math.ceil(48 * textScale)) / (viewportWidth <= 576 ? 2 : 1);
        const radius = Math.max(8, Math.min(110, Math.ceil(20 * textScale)));

        if (fontSize !== nodeTextSize) {
            nodeTextSize = fontSize;
            document.documentElement.style.setProperty("--node-text-size", `${fontSize}px`);
        }
        if (radius !== nodeRadius) {
            nodeRadius = radius;
            document.documentElement.style.setProperty("--link-stroke-width", `${radius}px`);
            svg.selectAll(".node__circle").attr("r", radius);
        }
    }

    // D3 calls this handler for mouse or touch gestures and for changes made by
    // the zoom buttons or focusNode. Update the drawing immediately in each case.
    const behaviour = zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.025, 2])
        .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
            const {x, y, k} = event.transform;
            root.attr("transform", `translate(${x} ${y}) scale(${k})`);
            updateAppearance(k);
            if (!restoringView) {
                saveZoom();
            }
        });
    svg.call(behaviour).on("wheel", (event: WheelEvent) => event.preventDefault());

    function navigateTo(transform: ZoomTransform, duration?: number, center?: [number, number]): void {
        // Vue removes the SVG from the page when the user opens another tab.
        // D3 cannot measure it while it is detached. GraphViewer restores the saved
        // zoom and pan when the user returns to the Viewer tab.
        if (!svgElement.isConnected) {
            return;
        }
        // Cancel any animation that is still running before applying the next zoom or pan.
        svg.interrupt();
        if (duration == null) {
            svg.call(behaviour.transform, transform);
        } else {
            svg.transition().duration(duration).call(behaviour.transform, transform, center);
        }
    }

    function restoreZoom(saved: Zoom): void {
        // Cancel any queued save of the previous zoom and pan before restoring the saved values.
        saveZoom.cancel();
        // D3 also sends zoom events when we restore saved values.
        // Set this flag so that the event handler does not save those values again.
        restoringView = true;
        try {
            navigateTo(zoomIdentity.translate(saved.x, saved.y).scale(saved.scale));
        } finally {
            restoringView = false;
        }
    }

    function resetZoom(): void {
        navigateTo(zoomIdentity.translate(WIDTH / 2, HEIGHT / 2).scale(INITIAL_ZOOM));
    }

    function focusNode(node: RenderNode, speed = 1): void {
        if (!svgElement.isConnected) {
            return;
        }
        const {width, height} = svgElement.getBoundingClientRect();
        const center: [number, number] = [width / 2, height / 2];
        const point = getPostFocusPoint(node, width);
        // Translate the chosen point to (0, 0), scale the graph, and then move
        // that point to the centre of the SVG.
        navigateTo(
            zoomIdentity.translate(...center).scale(INITIAL_ZOOM).translate(-point.x, -point.y),
            1500 / speed,
            center
        );
    }

    function zoomBy(scale: number): void {
        if (!svgElement.isConnected) {
            return;
        }
        svg.interrupt();
        svg.transition().call(behaviour.scaleBy, scale);
    }

    function destroy(): void {
        // Cancel any queued save before removing the SVG. A delayed save could
        // overwrite zoom and pan values that were loaded by a later import.
        saveZoom.cancel();
        svg.interrupt().on(".zoom", null).on("wheel", null);
    }

    return {
        restoreZoom,
        resetZoom,
        focusNode,
        zoomIn: () => zoomBy(2),
        zoomOut: () => zoomBy(0.5),
        // Save any pending zoom and pan changes when the user leaves the Viewer tab.
        flushZoom: () => saveZoom.flush(),
        destroy,
        // Use the current radius when drawing new circles, even if the zoom has not changed.
        get nodeRadius() {
            return nodeRadius;
        },
    };
}
