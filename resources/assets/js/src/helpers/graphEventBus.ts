import mitt from "mitt";
import type {PostId} from "@/src/@types/StoreTypes";

type GraphEvents = {
    focusOnPost: PostId;
    highlightPost: PostId;
    unhighlightPost: PostId;
    refreshGraph: undefined;
    zoomIn: undefined;
    zoomOut: undefined;
};

const graphEventBus = mitt<GraphEvents>();

export default graphEventBus;
