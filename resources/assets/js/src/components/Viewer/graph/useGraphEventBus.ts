import {onBeforeUnmount, onMounted} from "vue";

import type {PostId} from "@/src/@types/StoreTypes";
import graphEventBus from "@/src/helpers/graphEventBus";

/* eslint-disable no-unused-vars */
type GraphEventHandlers = {
    focusOnPost(postId: PostId): void;
    highlightPost(postId: PostId): void;
    unhighlightPost(postId: PostId): void;
    refreshGraph(): void;
    zoomIn(): void;
    zoomOut(): void;
};
/* eslint-enable no-unused-vars */

export function useGraphEventBus(handlers: GraphEventHandlers): void {
    onMounted(() => {
        graphEventBus.on("focusOnPost", handlers.focusOnPost);
        graphEventBus.on("highlightPost", handlers.highlightPost);
        graphEventBus.on("unhighlightPost", handlers.unhighlightPost);
        graphEventBus.on("refreshGraph", handlers.refreshGraph);
        graphEventBus.on("zoomIn", handlers.zoomIn);
        graphEventBus.on("zoomOut", handlers.zoomOut);
    });

    onBeforeUnmount(() => {
        graphEventBus.off("focusOnPost", handlers.focusOnPost);
        graphEventBus.off("highlightPost", handlers.highlightPost);
        graphEventBus.off("unhighlightPost", handlers.unhighlightPost);
        graphEventBus.off("refreshGraph", handlers.refreshGraph);
        graphEventBus.off("zoomIn", handlers.zoomIn);
        graphEventBus.off("zoomOut", handlers.zoomOut);
    });
}
