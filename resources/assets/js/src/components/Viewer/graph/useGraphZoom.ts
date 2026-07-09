import {ref, watch, type Ref} from "vue";
import {zoom as d3zoom, zoomIdentity as d3zoomIdentity} from "d3-zoom";
import type {D3ZoomEvent} from "d3-zoom";
import debounce from "lodash/debounce";
import "d3-transition";

import type {PostId, Zoom} from "@/src/@types/StoreTypes";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {GraphGroupSelection, GraphNodesById, GraphSvgSelection, GraphZoomBehavior} from "./types";

/* eslint-disable no-unused-vars */
type UseGraphZoomOptions = {
    svg: Ref<Nullable<GraphSvgSelection>>;
    rootG: Ref<Nullable<GraphGroupSelection>>;
    linkStroke: Ref<number>;
    originalLinkStroke: number;
    getNodesWithCoordinates(): GraphNodesById;
    setNodeRadius(radius: number): void;
    saveZoom(zoom: Zoom): void;
    isPhone(): boolean;
};
/* eslint-enable no-unused-vars */

export function useGraphZoom(options: UseGraphZoomOptions) {
    let hasMounted = false;
    const zoom = ref<Zoom>({
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    });
    const zoomBehaviour = ref<Nullable<GraphZoomBehavior>>(null);
    const debouncedSaveZoomState = debounce(
        () => {
            // Avoid immediately autosaving the zoom state we just loaded.
            if (hasMounted) {
                options.saveZoom(zoom.value);
            } else {
                hasMounted = true;
            }
        },
        250,
        {
            leading: false,
            trailing: true,
        }
    );

    watch(zoom, ({x, y, scale}: Zoom) => {
        if (options.rootG.value == null) {
            return;
        }

        options.rootG.value.attr("transform", `translate(${x} ${y}) scale(${scale})`);

        const unshiftedTextScaleFactor = INITIAL_ZOOM / scale;
        const textScaleFactor = unshiftedTextScaleFactor < 1
            ? unshiftedTextScaleFactor
            : 1 + ((unshiftedTextScaleFactor - 1) * 0.35); // Keep labels readable without making them explode while zooming out.
        const originalTextSize = 48;
        const maxTextSize = 220;
        const newTextSize = Math.min(
            maxTextSize,
            Math.ceil(originalTextSize * textScaleFactor)
        );

        document.documentElement.style.setProperty("--node-text-size", (options.isPhone() ? (newTextSize / 2) : newTextSize) + "px");

        const minLinkStroke = 8;
        const maxLinkStroke = 110;
        options.linkStroke.value = Math.max(
            minLinkStroke,
            Math.min(
                maxLinkStroke,
                Math.ceil(options.originalLinkStroke * textScaleFactor)
            )
        );
        document.documentElement.style.setProperty("--link-stroke-width", options.linkStroke.value + "px");
        options.setNodeRadius(options.linkStroke.value);

        debouncedSaveZoomState();
    });

    function setupZooming(): void {
        /*
        D3 zoom has a zoom behaviour and a zoom transform. The behaviour is applied to the SVG
        to bind pan/zoom listeners; programmatic zooming works by applying a transform through
        that same behaviour, which then emits the normal zoom event.
         */
        zoomBehaviour.value = d3zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.025, 2])
            .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
                zoom.value = {
                    x: event.transform.x,
                    y: event.transform.y,
                    scale: event.transform.k,
                };
            });

        if (options.svg.value == null) {
            return;
        }

        options.svg.value.call(zoomBehaviour.value)
            .on("wheel", (event: WheelEvent) => {
                event.preventDefault();
            });
    }

    function applyStoredZoom(storedZoom: Zoom): void {
        if (options.svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        options.svg.value.call(zoomBehaviour.value)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .translate(storedZoom.x, storedZoom.y)
                    .scale(storedZoom.scale)
            );
    }

    function resetZoomToCenter(): void {
        if (options.svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        options.svg.value.call(zoomBehaviour.value)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .translate(WIDTH / 2, HEIGHT / 2)
                    .scale(INITIAL_ZOOM)
            );
    }

    function focusOnPost(id: PostId, speed = 1): void {
        if (options.svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        const xOffset = options.isPhone()
            ? 550
            : 2000;
        const yOffset = options.isPhone()
            ? 300
            : 500;

        const post = options.getNodesWithCoordinates()[id];
        if (post?.x == null || post?.y == null) {
            return;
        }

        options.svg.value.transition()
            .duration(1500 / speed)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .scale(INITIAL_ZOOM)
                    .translate(-post.x + xOffset, -post.y + yOffset)
            );
    }

    function zoomIn(): void {
        if (options.svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        options.svg.value.transition()
            .call(zoomBehaviour.value.scaleBy, 2);
    }

    function zoomOut(): void {
        if (options.svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        options.svg.value.transition()
            .call(zoomBehaviour.value.scaleBy, 0.5);
    }

    return {
        zoom,
        setupZooming,
        applyStoredZoom,
        resetZoomToCenter,
        focusOnPost,
        zoomIn,
        zoomOut,
    };
}
